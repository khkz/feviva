import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Waves, Play, Square } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface SoundTrack {
  id: string;
  name: string;
  description: string;
  color: string;
  frequency: number;
  type: OscillatorType;
  lfoFrequency: number;
}

const soundTracks: SoundTrack[] = [
  {
    id: 'marte',
    name: 'Viento de Marte',
    description: 'Captado por InSight',
    color: '#ef4444',
    frequency: 60,
    type: 'sawtooth',
    lfoFrequency: 0.3,
  },
  {
    id: 'pulsar',
    name: 'Púlsares',
    description: 'Estrellas de neutrones',
    color: '#8b5cf6',
    frequency: 180,
    type: 'sine',
    lfoFrequency: 8,
  },
  {
    id: 'vacio',
    name: 'Silencio Cósmico',
    description: 'El vacío entre galaxias',
    color: '#06b6d4',
    frequency: 40,
    type: 'sine',
    lfoFrequency: 0.1,
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
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<AudioNode | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
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
    if (audioNodesRef.current && !isMuted) {
      audioNodesRef.current.gainNode.gain.setValueAtTime(
        (volume / 100) * 0.15,
        audioContextRef.current?.currentTime || 0
      );
    }
  }, [volume, isMuted]);

  const stopCurrentSound = () => {
    if (audioNodesRef.current) {
      try {
        const { gainNode } = audioNodesRef.current;
        const ctx = audioContextRef.current;
        if (ctx) {
          // Fade out
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

  const playAmbientSound = (trackId: string) => {
    // If clicking same track, stop it
    if (activeTrack === trackId) {
      stopCurrentSound();
      setActiveTrack(null);
      return;
    }

    // Stop current sound if any
    stopCurrentSound();

    // Initialize AudioContext if needed
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    const track = soundTracks.find(t => t.id === trackId);
    if (!track) return;

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
    oscillator.type = track.type;
    oscillator.frequency.value = track.frequency;

    // Configure LFO for pulsing effect
    lfo.type = 'sine';
    lfo.frequency.value = track.lfoFrequency;
    lfoGain.gain.value = track.frequency * 0.1;

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

    setActiveTrack(trackId);
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
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
          <p className="text-gray-400 text-sm">Audio Ambiental</p>
        </div>
      </div>

      <div className="glass-cyber rounded-2xl p-6 border-purple-400/30">
        <p className="text-gray-400 text-sm mb-6 text-center">
          🌌 Reza con el sonido real de la creación de Dios
        </p>

        {/* Sound Tracks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {soundTracks.map((track) => (
            <motion.button
              key={track.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => playAmbientSound(track.id)}
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
              {/* Play/Stop indicator */}
              <div className="absolute top-3 right-3">
                {activeTrack === track.id ? (
                  <Square className="w-4 h-4" style={{ color: track.color }} />
                ) : (
                  <Play className="w-4 h-4 text-gray-500" />
                )}
              </div>

              {/* Waveform visualization */}
              <div className="flex justify-center gap-0.5 h-12 items-end mb-3">
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
          Sonidos sintetizados inspirados en datos de NASA • Toca para reproducir en loop
        </p>
      </div>
    </motion.div>
  );
}
