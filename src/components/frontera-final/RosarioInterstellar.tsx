import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RosarioInterstellarProps {
  isOpen: boolean;
  onClose: () => void;
}

const mysteries = [
  { name: "Gozosos", color: "#22d3ee", planet: "Mercurio" },
  { name: "Luminosos", color: "#fbbf24", planet: "Venus" },
  { name: "Dolorosos", color: "#ef4444", planet: "Marte" },
  { name: "Gloriosos", color: "#a855f7", planet: "Júpiter" },
];

const prayers = [
  "Padre Nuestro",
  ...Array(10).fill("Ave María"),
  "Gloria",
];

export function RosarioInterstellar({ isOpen, onClose }: RosarioInterstellarProps) {
  const [currentMystery, setCurrentMystery] = useState(0);
  const [currentPrayer, setCurrentPrayer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (isOpen && !audioContext) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
    }
  }, [isOpen, audioContext]);

  // Play bell sound
  const playBellSound = useCallback(() => {
    if (!audioContext || isMuted) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, [audioContext, isMuted]);

  // Auto-advance when playing
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      handleNext();
    }, 3000); // 3 seconds per prayer

    return () => clearInterval(interval);
  }, [isPlaying, currentPrayer, currentMystery]);

  const handleNext = () => {
    playBellSound();

    if (currentPrayer < prayers.length - 1) {
      setCurrentPrayer(prev => prev + 1);
    } else if (currentMystery < mysteries.length - 1) {
      setCurrentMystery(prev => prev + 1);
      setCurrentPrayer(0);
    } else {
      // Completed all mysteries
      setIsPlaying(false);
    }
  };

  const handleReset = () => {
    setCurrentMystery(0);
    setCurrentPrayer(0);
    setIsPlaying(false);
  };

  const totalProgress = (currentMystery * prayers.length + currentPrayer) / (mysteries.length * prayers.length);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg glass-cyber rounded-3xl p-8 border-amber-400/30"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="font-orbitron text-2xl font-bold text-white mb-2">
              Rosario Interestelar
            </h2>
            <p className="text-gray-400 text-sm">
              Misterios {mysteries[currentMystery].name}
            </p>
          </div>

          {/* Solar System Visualization */}
          <div className="relative h-64 mb-8">
            {/* Sun (center) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(251, 191, 36, 0.5)",
                    "0 0 40px rgba(251, 191, 36, 0.8)",
                    "0 0 20px rgba(251, 191, 36, 0.5)",
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500"
              />
            </div>

            {/* Orbits and Planets */}
            {mysteries.map((mystery, index) => {
              const orbitSize = 80 + index * 40;
              const isActive = index === currentMystery;
              const isCompleted = index < currentMystery;

              return (
                <div key={mystery.name} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  {/* Orbit ring */}
                  <motion.div
                    className="rounded-full border"
                    style={{
                      width: orbitSize * 2,
                      height: orbitSize * 2,
                      marginLeft: -orbitSize,
                      marginTop: -orbitSize,
                      borderColor: isActive ? mystery.color : 'rgba(100, 116, 139, 0.2)',
                    }}
                    animate={isActive ? { 
                      borderColor: [mystery.color, `${mystery.color}80`, mystery.color] 
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  />

                  {/* Planet */}
                  <motion.div
                    className="absolute rounded-full cursor-pointer transition-all duration-300"
                    style={{
                      width: isActive ? 28 : 20,
                      height: isActive ? 28 : 20,
                      backgroundColor: isCompleted || isActive ? mystery.color : '#475569',
                      top: '50%',
                      left: '50%',
                      marginLeft: -10 + (isActive ? -4 : 0),
                      marginTop: -orbitSize - 10 + (isActive ? -4 : 0),
                      boxShadow: isActive ? `0 0 20px ${mystery.color}` : 'none',
                    }}
                    animate={isActive ? {
                      scale: [1, 1.2, 1],
                    } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    onClick={() => {
                      setCurrentMystery(index);
                      setCurrentPrayer(0);
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Prayer Counter */}
          <div className="text-center mb-6">
            <div className="flex justify-center gap-2 mb-4">
              {prayers.map((_, index) => (
                <motion.div
                  key={index}
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: index <= currentPrayer 
                      ? mysteries[currentMystery].color 
                      : '#334155',
                  }}
                  animate={index === currentPrayer ? {
                    scale: [1, 1.3, 1],
                  } : {}}
                  transition={{ duration: 0.5, repeat: index === currentPrayer ? Infinity : 0 }}
                />
              ))}
            </div>
            <p className="text-white font-orbitron text-lg">
              {prayers[currentPrayer]}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {currentPrayer + 1} de {prayers.length}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full mb-6 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: mysteries[currentMystery].color }}
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              className="text-gray-400 hover:text-white"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              className="text-gray-400 hover:text-white"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-400/30"
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 text-slate-900" />
              ) : (
                <Play className="w-7 h-7 text-slate-900 ml-1" />
              )}
            </motion.button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="text-gray-400 hover:text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}