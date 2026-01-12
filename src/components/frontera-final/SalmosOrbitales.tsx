import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  X, 
  Minimize2, 
  Volume2, 
  VolumeX,
  RotateCcw,
  Maximize2,
  Sun,
  BookOpen
} from 'lucide-react';
import { useSalmos } from '@/contexts/SalmosContext';
import { SALMOS_ORBITALES } from '@/lib/salmosData';
import { Slider } from '@/components/ui/slider';

export function SalmosOrbitales() {
  const {
    isOpen,
    close,
    minimize,
    togglePlay,
    next,
    previous,
    reset,
    setSalmoIndex,
    toggleMute,
    setAmbientVolume,
    isPlaying,
    isMuted,
    ambientVolume,
    meditacionesCompletadas,
    currentSalmo,
    currentVerse,
    currentSalmoIndex,
    currentVerseIndex,
    totalProgress,
  } = useSalmos();

  const [showVerseText, setShowVerseText] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 overflow-hidden"
      >
        {/* Starfield */}
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0.3 + Math.random() * 0.7,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Top Controls */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <Maximize2 className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={minimize}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <Minimize2 className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={close}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Main Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 py-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 text-sm font-medium">
                {meditacionesCompletadas} meditaciones completadas
              </span>
            </div>
            <h1 className="font-orbitron text-3xl md:text-4xl font-bold text-white mb-2">
              Salmos Orbitales
            </h1>
            <p className="text-gray-400">Medita en Su Palabra Cósmica</p>
          </motion.div>

          {/* Salmo Selector */}
          <div className="flex gap-2 mb-8 flex-wrap justify-center">
            {SALMOS_ORBITALES.map((salmo, index) => (
              <motion.button
                key={salmo.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSalmoIndex(index)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  currentSalmoIndex === index
                    ? 'text-slate-900'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
                style={{
                  backgroundColor: currentSalmoIndex === index ? salmo.color : undefined,
                }}
              >
                Salmo {salmo.numero}
              </motion.button>
            ))}
          </div>

          {/* Solar System Visualization */}
          <div className="relative w-80 h-80 md:w-96 md:h-96 mb-8">
            {/* Sun (God - Center) */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full flex items-center justify-center z-10"
              style={{
                background: `radial-gradient(circle, #FCD34D 0%, #F59E0B 50%, #D97706 100%)`,
                boxShadow: '0 0 60px rgba(251, 191, 36, 0.6)',
              }}
              animate={{
                boxShadow: [
                  '0 0 60px rgba(251, 191, 36, 0.4)',
                  '0 0 80px rgba(251, 191, 36, 0.6)',
                  '0 0 60px rgba(251, 191, 36, 0.4)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sun className="w-10 h-10 text-yellow-900" />
            </motion.div>

            {/* Orbits with Verse Planets */}
            {currentSalmo.versiculos.map((verse, index) => {
              const orbitRadius = 60 + index * 35;
              const isActive = index === currentVerseIndex;
              const isCompleted = index < currentVerseIndex;
              
              return (
                <div key={index} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  {/* Orbit Ring */}
                  <motion.div
                    className="rounded-full border border-white/10"
                    style={{
                      width: orbitRadius * 2,
                      height: orbitRadius * 2,
                      marginLeft: -orbitRadius,
                      marginTop: -orbitRadius,
                    }}
                    animate={{
                      borderColor: isActive ? `${currentSalmo.color}40` : 'rgba(255,255,255,0.1)',
                    }}
                  />
                  
                  {/* Planet (Verse) */}
                  <motion.button
                    onClick={() => {}}
                    className="absolute rounded-full flex items-center justify-center font-bold text-xs"
                    style={{
                      width: isActive ? 40 : 30,
                      height: isActive ? 40 : 30,
                      backgroundColor: isActive ? currentSalmo.color : isCompleted ? `${currentSalmo.color}80` : '#475569',
                      boxShadow: isActive ? `0 0 20px ${currentSalmo.color}` : 'none',
                      left: '50%',
                      top: '50%',
                      marginLeft: -15 + (isActive ? -5 : 0),
                      marginTop: -orbitRadius - 15 + (isActive ? -5 : 0),
                    }}
                    animate={isPlaying && isActive ? {
                      rotate: 360,
                    } : {}}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className={isActive ? 'text-slate-900' : 'text-white'}>
                      {verse.numero}
                    </span>
                  </motion.button>
                </div>
              );
            })}
          </div>

          {/* Current Verse Display */}
          <motion.div
            key={`${currentSalmoIndex}-${currentVerseIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl text-center mb-8"
          >
            <p className="text-sm text-gray-400 mb-2">
              Salmo {currentSalmo.numero}:{currentVerse.numero} — {currentSalmo.titulo}
            </p>
            
            <AnimatePresence mode="wait">
              {showVerseText && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <p 
                    className="text-2xl md:text-3xl font-light text-white mb-4 leading-relaxed"
                    style={{ textShadow: `0 0 30px ${currentSalmo.color}40` }}
                  >
                    "{currentVerse.texto}"
                  </p>
                  <p className="text-gray-300 text-lg italic">
                    {currentVerse.meditacion}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Toggle Verse Text */}
          <button
            onClick={() => setShowVerseText(!showVerseText)}
            className="text-gray-400 text-sm hover:text-white transition-colors mb-4"
          >
            {showVerseText ? 'Ocultar texto' : 'Mostrar texto'}
          </button>

          {/* Ambient Volume */}
          <div className="flex items-center gap-3 mb-6 px-4">
            <VolumeX className="w-4 h-4 text-gray-400" />
            <Slider
              value={[ambientVolume]}
              onValueChange={([v]) => setAmbientVolume(v)}
              max={100}
              step={1}
              className="w-32"
            />
            <Volume2 className="w-4 h-4 text-gray-400" />
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md mb-6">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>Progreso</span>
              <span>{Math.round(totalProgress * 100)}%</span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ 
                  backgroundColor: currentSalmo.color,
                  width: `${totalProgress * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMute}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={reset}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <RotateCcw className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={previous}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <SkipBack className="w-6 h-6" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePlay}
              className="p-5 rounded-full text-slate-900"
              style={{ backgroundColor: currentSalmo.color }}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={next}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <SkipForward className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Mini Player for minimized state
export function SalmosMiniPlayer() {
  const { isMinimized, expand, currentSalmo, currentVerse, isPlaying, togglePlay, close } = useSalmos();

  if (!isMinimized) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-20 left-4 right-4 z-40 glass-cyber rounded-2xl p-4 border-amber-400/30"
    >
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePlay}
          className="w-12 h-12 rounded-full flex items-center justify-center text-slate-900"
          style={{ backgroundColor: currentSalmo.color }}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </motion.button>

        <div className="flex-1 min-w-0" onClick={expand}>
          <p className="text-white font-medium text-sm truncate">
            Salmo {currentSalmo.numero}:{currentVerse.numero}
          </p>
          <p className="text-gray-400 text-xs truncate">
            {currentSalmo.titulo}
          </p>
        </div>

        <button onClick={close} className="text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
