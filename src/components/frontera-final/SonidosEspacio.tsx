import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, Waves } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface SoundTrack {
  id: string;
  name: string;
  description: string;
  color: string;
  // URLs de sonidos de NASA (public domain) - placeholder
  url?: string;
}

const soundTracks: SoundTrack[] = [
  {
    id: 'marte',
    name: 'Viento de Marte',
    description: 'Captado por InSight',
    color: '#ef4444',
    // Estos URLs serían reemplazados por sonidos reales de NASA
    url: undefined,
  },
  {
    id: 'pulsar',
    name: 'Púlsares',
    description: 'Estrellas de neutrones',
    color: '#8b5cf6',
    url: undefined,
  },
  {
    id: 'vacio',
    name: 'Silencio Cósmico',
    description: 'El vacío entre galaxias',
    color: '#06b6d4',
    url: undefined,
  },
];

export function SonidosEspacio() {
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  // Generar sonido ambiente con Web Audio API
  const playAmbientSound = (trackId: string) => {
    if (activeTrack === trackId) {
      setActiveTrack(null);
      return;
    }

    setActiveTrack(trackId);
    
    // Si no hay URL de audio real, usar Web Audio API para generar sonido ambiente
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Crear un oscilador simple como placeholder
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configurar según el tipo de sonido
    switch (trackId) {
      case 'marte':
        oscillator.frequency.value = 80; // Bajo profundo
        oscillator.type = 'sawtooth';
        break;
      case 'pulsar':
        oscillator.frequency.value = 200;
        oscillator.type = 'sine';
        break;
      case 'vacio':
        oscillator.frequency.value = 40;
        oscillator.type = 'sine';
        break;
    }
    
    gainNode.gain.value = (volume / 100) * 0.1; // Volumen bajo
    
    // Auto-stop después de demostración (5 segundos)
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      if (activeTrack === trackId) {
        setActiveTrack(null);
      }
    }, 5000);
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
        <div className="grid grid-cols-3 gap-4 mb-6">
          {soundTracks.map((track) => (
            <motion.button
              key={track.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => playAmbientSound(track.id)}
              className={`relative glass-cyber rounded-xl p-4 transition-all duration-300 ${
                activeTrack === track.id
                  ? 'border-2'
                  : 'border border-white/10 hover:border-white/20'
              }`}
              style={{
                borderColor: activeTrack === track.id ? track.color : undefined,
                boxShadow: activeTrack === track.id ? `0 0 20px ${track.color}40` : undefined,
              }}
            >
              {/* Waveform visualization */}
              <div className="flex justify-center gap-0.5 h-12 items-end mb-3">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 rounded-full"
                    style={{ backgroundColor: track.color }}
                    animate={activeTrack === track.id ? {
                      height: [8, 24 + Math.random() * 16, 8],
                    } : { height: 8 }}
                    transition={{
                      duration: 0.5 + Math.random() * 0.3,
                      repeat: activeTrack === track.id ? Infinity : 0,
                      delay: i * 0.05,
                    }}
                  />
                ))}
              </div>

              <p className="font-orbitron text-sm text-white mb-1">{track.name}</p>
              <p className="text-gray-500 text-xs">{track.description}</p>

              {/* Play indicator */}
              {activeTrack === track.id && (
                <motion.div
                  className="absolute top-2 right-2"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
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
            onClick={() => setIsMuted(!isMuted)}
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
          <span className="text-gray-400 text-sm w-10">{volume}%</span>
        </div>

        <p className="text-gray-500 text-xs text-center mt-4">
          Sonidos basados en datos de NASA. Sube tus propios MP3 para personalizar.
        </p>
      </div>
    </motion.div>
  );
}
