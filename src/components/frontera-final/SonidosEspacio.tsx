import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Waves, Play, Square, Rocket, Download, Loader2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SoundTrack {
  id: string;
  name: string;
  description: string;
  color: string;
  filename: string;
  fallbackFrequency: number;
  fallbackType: OscillatorType;
  fallbackLfoFrequency: number;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const BUCKET_NAME = 'ambient-audio';

const soundTracks: SoundTrack[] = [
  {
    id: 'marte',
    name: 'Atmósfera Marciana',
    description: 'Ambiente espacial profundo',
    color: '#ef4444',
    filename: 'atmosfera-marte.mp3',
    fallbackFrequency: 60,
    fallbackType: 'sawtooth',
    fallbackLfoFrequency: 0.3,
  },
  {
    id: 'jupiter',
    name: 'Púlsar Cósmico',
    description: 'Ondas de estrella de neutrones',
    color: '#f59e0b',
    filename: 'pulsar-cosmico.mp3',
    fallbackFrequency: 180,
    fallbackType: 'sine',
    fallbackLfoFrequency: 8,
  },
  {
    id: 'saturno',
    name: 'Cosmos Profundo',
    description: 'Ambiente interestelar',
    color: '#8b5cf6',
    filename: 'cosmos-profundo.mp3',
    fallbackFrequency: 40,
    fallbackType: 'sine',
    fallbackLfoFrequency: 0.1,
  },
];

interface AudioNode {
  oscillator: OscillatorNode;
  lfo: OscillatorNode;
  gainNode: GainNode;
  lfoGain: GainNode;
}

export function SonidosEspacio() {
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasRealAudio, setHasRealAudio] = useState<Record<string, boolean>>({});
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<AudioNode | null>(null);

  // Check which audio files exist
  useEffect(() => {
    const checkAudioFiles = async () => {
      const availability: Record<string, boolean> = {};
      
      for (const track of soundTracks) {
        try {
          const { data } = await supabase.storage
            .from(BUCKET_NAME)
            .list('', { search: track.filename });
          
          availability[track.id] = data && data.length > 0;
        } catch {
          availability[track.id] = false;
        }
      }
      
      setHasRealAudio(availability);
    };

    checkAudioFiles();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioNodesRef.current) {
        try {
          audioNodesRef.current.oscillator.stop();
          audioNodesRef.current.lfo.stop();
        } catch {
          // Already stopped
        }
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
    if (audioNodesRef.current && !isMuted) {
      audioNodesRef.current.gainNode.gain.setValueAtTime(
        (volume / 100) * 0.15,
        audioContextRef.current?.currentTime || 0
      );
    }
  }, [volume, isMuted]);

  const downloadNasaSounds = async () => {
    setIsDownloading(true);
    try {
      const { data, error } = await supabase.functions.invoke('download-nasa-sounds');
      
      if (error) throw error;
      
      if (data.success) {
        toast.success('¡Sonidos de NASA descargados!', {
          description: data.message,
        });
        
        // Update availability
        const availability: Record<string, boolean> = { ...hasRealAudio };
        for (const result of data.results) {
          if (result.status === 'success' || result.status === 'already_exists') {
            availability[result.id] = true;
          }
        }
        setHasRealAudio(availability);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Error downloading NASA sounds:', err);
      toast.error('Error al descargar sonidos', {
        description: 'Los sonidos sintéticos siguen disponibles',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const stopCurrentSound = () => {
    // Stop HTML5 audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    
    // Stop Web Audio API oscillators
    if (audioNodesRef.current) {
      try {
        const { gainNode } = audioNodesRef.current;
        const ctx = audioContextRef.current;
        if (ctx) {
          gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          
          setTimeout(() => {
            try {
              audioNodesRef.current?.oscillator.stop();
              audioNodesRef.current?.lfo.stop();
            } catch {
              // Already stopped
            }
            audioNodesRef.current = null;
          }, 600);
        }
      } catch {
        audioNodesRef.current = null;
      }
    }
  };

  const playRealAudio = async (track: SoundTrack) => {
    const audioUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${track.filename}`;
    
    setIsLoading(true);
    
    try {
      const audio = new Audio(audioUrl);
      audio.loop = true;
      audio.volume = isMuted ? 0 : volume / 100;
      
      await audio.play();
      audioRef.current = audio;
      setActiveTrack(track.id);
    } catch (err) {
      console.error('Error playing audio:', err);
      // Fallback to synthesized sound
      playSynthesizedSound(track);
    } finally {
      setIsLoading(false);
    }
  };

  const playSynthesizedSound = (track: SoundTrack) => {
    // Initialize AudioContext if needed
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Create nodes for ambient drone sound
    const oscillator = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const lfoGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Configure oscillator
    oscillator.type = track.fallbackType;
    oscillator.frequency.value = track.fallbackFrequency;

    // Configure LFO for pulsing effect
    lfo.type = 'sine';
    lfo.frequency.value = track.fallbackLfoFrequency;
    lfoGain.gain.value = track.fallbackFrequency * 0.1;

    // Connect LFO to oscillator frequency for modulation
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);

    // Configure filter for warmth
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    filter.Q.value = 1;

    // Connect: oscillator -> filter -> gain -> output
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Set initial volume with fade in
    const targetVolume = isMuted ? 0 : (volume / 100) * 0.15;
    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      Math.max(targetVolume, 0.001),
      ctx.currentTime + 1
    );

    // Start oscillators
    oscillator.start();
    lfo.start();

    // Store references
    audioNodesRef.current = {
      oscillator,
      lfo,
      gainNode,
      lfoGain,
    };

    setActiveTrack(track.id);
  };

  const playSound = async (trackId: string) => {
    // If clicking same track, stop it
    if (activeTrack === trackId) {
      stopCurrentSound();
      setActiveTrack(null);
      return;
    }

    // Stop current sound if any
    stopCurrentSound();

    const track = soundTracks.find(t => t.id === trackId);
    if (!track) return;

    // Use real audio if available, otherwise synthesized
    if (hasRealAudio[trackId]) {
      await playRealAudio(track);
    } else {
      playSynthesizedSound(track);
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (audioRef.current) {
      audioRef.current.volume = newMuted ? 0 : volume / 100;
    }
    
    if (audioNodesRef.current && audioContextRef.current) {
      const targetVolume = newMuted ? 0.001 : (volume / 100) * 0.15;
      audioNodesRef.current.gainNode.gain.setValueAtTime(
        audioNodesRef.current.gainNode.gain.value,
        audioContextRef.current.currentTime
      );
      audioNodesRef.current.gainNode.gain.exponentialRampToValueAtTime(
        Math.max(targetVolume, 0.001),
        audioContextRef.current.currentTime + 0.3
      );
    }
  };

  const hasAnyRealAudio = Object.values(hasRealAudio).some(v => v);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-8 rounded-full bg-gradient-to-b from-purple-400 to-pink-400" />
        <div>
          <h2 className="font-orbitron text-2xl font-bold text-white">
            Sonidos del Espacio
          </h2>
          <p className="text-gray-400 text-sm">Audio Ambiental NASA</p>
        </div>
      </div>

      <div className="glass-cyber rounded-2xl p-6 border-purple-400/30">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-400 text-sm">
            🌌 Reza con el sonido real de la creación de Dios
          </p>
          
          {!hasAnyRealAudio && (
            <Button
              variant="outline"
              size="sm"
              onClick={downloadNasaSounds}
              disabled={isDownloading}
              className="border-purple-500/50 hover:bg-purple-500/20 text-purple-300"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Descargar sonidos cósmicos
            </Button>
          )}
        </div>

        {/* Sound Tracks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {soundTracks.map((track) => (
            <motion.button
              key={track.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => playSound(track.id)}
              disabled={isLoading}
              className={`relative glass-cyber rounded-xl p-4 transition-all duration-300 ${
                activeTrack === track.id
                  ? 'border-2'
                  : 'border border-white/10 hover:border-white/20'
              }`}
              style={{
                borderColor: activeTrack === track.id ? track.color : undefined,
                boxShadow: activeTrack === track.id ? `0 0 30px ${track.color}40` : undefined,
              }}
            >
              {/* Real audio badge */}
              {hasRealAudio[track.id] && (
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                  <Rocket className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-medium">REAL</span>
                </div>
              )}
              
              {/* Play/Stop indicator */}
              <div className="absolute top-3 right-3">
                {isLoading && activeTrack !== track.id ? (
                  <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                ) : activeTrack === track.id ? (
                  <Square className="w-4 h-4" style={{ color: track.color }} />
                ) : (
                  <Play className="w-4 h-4 text-gray-500" />
                )}
              </div>

              {/* Waveform visualization */}
              <div className="flex justify-center gap-0.5 h-12 items-end mb-3 mt-4">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 rounded-full"
                    style={{ backgroundColor: track.color }}
                    animate={activeTrack === track.id ? {
                      height: [8, 20 + Math.random() * 20, 8],
                    } : { height: 8 }}
                    transition={{
                      duration: 0.4 + Math.random() * 0.4,
                      repeat: activeTrack === track.id ? Infinity : 0,
                      delay: i * 0.05,
                    }}
                  />
                ))}
              </div>

              <p className="font-orbitron text-sm text-white mb-1">{track.name}</p>
              <p className="text-gray-500 text-xs">{track.description}</p>

              {/* Active indicator */}
              {activeTrack === track.id && (
                <motion.div
                  className="absolute bottom-2 left-1/2 -translate-x-1/2"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Waves className="w-4 h-4" style={{ color: track.color }} />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMute}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={(v) => {
              setVolume(v[0]);
              if (v[0] > 0) setIsMuted(false);
            }}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-gray-400 text-sm w-10 text-right">{volume}%</span>
        </div>

        <p className="text-gray-500 text-xs text-center mt-4">
          {hasAnyRealAudio 
            ? '🛸 Sonidos cósmicos reales • Dominio Público • Loop infinito'
            : 'Sonidos sintetizados • Toca "Descargar" para audio real'}
        </p>
      </div>
    </motion.div>
  );
}
