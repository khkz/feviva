import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, ChevronRight, ChevronLeft, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MISTERIOS, ORACIONES_ROSARIO, getMisterioDelDia, TipoMisterio } from '@/lib/rosarioData';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RosarioInterstellarProps {
  isOpen: boolean;
  onClose: () => void;
}

const mysteryConfig = {
  gozosos: { color: "#22d3ee", planet: "Mercurio", gradient: "from-cyan-400 to-cyan-600" },
  luminosos: { color: "#fbbf24", planet: "Venus", gradient: "from-amber-400 to-amber-600" },
  dolorosos: { color: "#ef4444", planet: "Marte", gradient: "from-red-400 to-red-600" },
  gloriosos: { color: "#a855f7", planet: "Júpiter", gradient: "from-purple-400 to-purple-600" },
};

const mysteryOrder: TipoMisterio[] = ["gozosos", "luminosos", "dolorosos", "gloriosos"];

// Meditaciones espaciales para cada tipo de misterio
const spaceReflections: Record<TipoMisterio, string[]> = {
  gozosos: [
    "Como una nueva estrella que nació en Belén, cada misterio gozoso es luz en la inmensidad del cosmos.",
    "La Anunciación fue el Big Bang del plan divino de salvación.",
    "En el silencio del espacio, María dijo 'sí' y cambió el universo.",
    "El pesebre fue el punto de partida de la mayor misión cósmica.",
    "Como los Reyes Magos siguieron una estrella, nosotros seguimos la luz de Cristo.",
  ],
  luminosos: [
    "El bautismo de Jesús fue como una supernova de gracia divina.",
    "En Caná, el agua se transformó en vino como las nebulosas forman estrellas.",
    "El Reino de Dios se expande como el universo mismo.",
    "En el Tabor, la luz de Cristo brilló más que mil soles.",
    "La Eucaristía es el centro gravitacional de nuestra fe.",
  ],
  dolorosos: [
    "En Getsemaní, las estrellas fueron testigos del dolor más profundo.",
    "Cada azote fue un meteorito de sufrimiento que Él aceptó por nosotros.",
    "La corona de espinas, más pesada que los anillos de Saturno.",
    "El camino al Calvario fue la órbita más difícil que alguien ha recorrido.",
    "En la cruz, el Sol se oscureció: el cosmos lloró con su Creador.",
  ],
  gloriosos: [
    "La Resurrección fue el amanecer cósmico definitivo.",
    "Cristo ascendió más allá de las galaxias al trono del Padre.",
    "Pentecostés fue una lluvia de meteoros de fuego divino.",
    "María fue elevada por encima de todas las constelaciones.",
    "Como Reina del Cielo, María gobierna más allá de las estrellas.",
  ],
};

export function RosarioInterstellar({ isOpen, onClose }: RosarioInterstellarProps) {
  const [currentMysteryType, setCurrentMysteryType] = useState<TipoMisterio>(getMisterioDelDia);
  const [currentMysteryIndex, setCurrentMysteryIndex] = useState(0);
  const [currentPrayer, setCurrentPrayer] = useState(0); // 0: Padre Nuestro, 1-10: Ave María, 11: Gloria
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showPrayerText, setShowPrayerText] = useState(true);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [rosariosCompletados, setRosariosCompletados] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  const mysteryData = MISTERIOS[currentMysteryType];
  const currentMystery = mysteryData.misterios[currentMysteryIndex];
  const config = mysteryConfig[currentMysteryType];

  // Load user and stats
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Load rosary count
        const { count } = await supabase
          .from('user_rosario_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('completado', true);
        setRosariosCompletados(count || 0);
      }
    };
    if (isOpen) loadUser();
  }, [isOpen]);

  // Initialize audio context
  useEffect(() => {
    if (isOpen && !audioContext) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
    }
  }, [isOpen, audioContext]);

  // Play cosmic bell sound
  const playBellSound = useCallback(() => {
    if (!audioContext || isMuted) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Cosmic reverb-like sound
    filter.type = "lowpass";
    filter.frequency.value = 2000;
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.8);
  }, [audioContext, isMuted]);

  // Play completion chord
  const playCompletionChord = useCallback(() => {
    if (!audioContext || isMuted) return;

    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    
    notes.forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.frequency.value = freq;
      osc.type = "sine";
      
      const startTime = audioContext.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 1.5);
      
      osc.start(startTime);
      osc.stop(startTime + 1.5);
    });
  }, [audioContext, isMuted]);

  // Auto-advance when playing
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      handleNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, currentPrayer, currentMysteryIndex]);

  const handleNext = () => {
    playBellSound();

    if (currentPrayer < 11) {
      // Still in current decade
      setCurrentPrayer(prev => prev + 1);
    } else if (currentMysteryIndex < 4) {
      // Move to next mystery
      playCompletionChord();
      setCurrentMysteryIndex(prev => prev + 1);
      setCurrentPrayer(0);
    } else {
      // Completed all mysteries
      playCompletionChord();
      setIsPlaying(false);
      saveProgress();
    }
  };

  const handlePrevious = () => {
    if (currentPrayer > 0) {
      setCurrentPrayer(prev => prev - 1);
    } else if (currentMysteryIndex > 0) {
      setCurrentMysteryIndex(prev => prev - 1);
      setCurrentPrayer(11);
    }
  };

  const handleReset = () => {
    setCurrentMysteryIndex(0);
    setCurrentPrayer(0);
    setIsPlaying(false);
  };

  const saveProgress = async () => {
    if (!userId) return;
    
    try {
      await supabase.from('user_rosario_progress').insert({
        user_id: userId,
        misterio_tipo: currentMysteryType,
        completado: true,
        decenas_completadas: 5,
      });
      setRosariosCompletados(prev => prev + 1);
    } catch (error) {
      console.error('Error saving rosary progress:', error);
    }
  };

  const getCurrentPrayerText = () => {
    if (currentPrayer === 0) return ORACIONES_ROSARIO.padreNuestro;
    if (currentPrayer >= 1 && currentPrayer <= 10) return ORACIONES_ROSARIO.aveMaria;
    return ORACIONES_ROSARIO.gloria;
  };

  const getCurrentPrayerName = () => {
    if (currentPrayer === 0) return "Padre Nuestro";
    if (currentPrayer >= 1 && currentPrayer <= 10) return `Ave María (${currentPrayer}/10)`;
    return "Gloria";
  };

  const totalProgress = (currentMysteryIndex * 12 + currentPrayer) / (5 * 12);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop with stars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm"
          onClick={onClose}
        >
          {[...Array(100)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </motion.div>

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-2xl max-h-[90vh] glass-cyber rounded-3xl border-amber-400/30 overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="p-6 text-center border-b border-white/10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 text-sm font-medium">
                {rosariosCompletados} rosarios completados
              </span>
            </div>
            <h2 className="font-orbitron text-2xl font-bold text-white mb-1">
              Rosario Interestelar
            </h2>
            <p className="text-gray-400 text-sm">
              {mysteryData.nombre} • {mysteryData.dia}
            </p>
          </div>

          {/* Mystery Type Selector */}
          <div className="flex justify-center gap-2 p-4 border-b border-white/10">
            {mysteryOrder.map((type) => (
              <button
                key={type}
                onClick={() => {
                  setCurrentMysteryType(type);
                  setCurrentMysteryIndex(0);
                  setCurrentPrayer(0);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  currentMysteryType === type
                    ? `bg-gradient-to-r ${mysteryConfig[type].gradient} text-white`
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                {MISTERIOS[type].nombre.replace('Misterios ', '')}
              </button>
            ))}
          </div>

          <ScrollArea className="flex-1 p-6">
            {/* Current Mystery */}
            <motion.div
              key={`${currentMysteryType}-${currentMysteryIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <div 
                className="inline-block px-4 py-1 rounded-full text-sm mb-3"
                style={{ backgroundColor: `${config.color}20`, color: config.color }}
              >
                {currentMysteryIndex + 1}º Misterio
              </div>
              <h3 className="font-orbitron text-xl font-bold text-white mb-2">
                {currentMystery.titulo}
              </h3>
              <p className="text-gray-400 text-sm mb-3">
                Fruto: <span className="text-white">{currentMystery.fruto}</span>
              </p>
              
              {/* Space Meditation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="glass-cyber rounded-xl p-4 mb-4 border-amber-400/20"
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300 text-sm italic text-left">
                    {spaceReflections[currentMysteryType][currentMysteryIndex]}
                  </p>
                </div>
              </motion.div>

              <p className="text-gray-300 text-sm">
                {currentMystery.meditacion}
              </p>
            </motion.div>

            {/* Solar System Visualization */}
            <div className="relative h-48 mb-6">
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
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500"
                />
              </div>

              {/* Orbits and Planets for 5 mysteries */}
              {[0, 1, 2, 3, 4].map((index) => {
                const orbitSize = 50 + index * 20;
                const isActive = index === currentMysteryIndex;
                const isCompleted = index < currentMysteryIndex;

                return (
                  <div key={index} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    {/* Orbit ring */}
                    <motion.div
                      className="rounded-full border"
                      style={{
                        width: orbitSize * 2,
                        height: orbitSize * 2,
                        marginLeft: -orbitSize,
                        marginTop: -orbitSize,
                        borderColor: isActive ? config.color : 'rgba(100, 116, 139, 0.2)',
                      }}
                      animate={isActive ? { 
                        borderColor: [config.color, `${config.color}80`, config.color] 
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    />

                    {/* Planet */}
                    <motion.div
                      className="absolute rounded-full cursor-pointer transition-all duration-300"
                      style={{
                        width: isActive ? 20 : 14,
                        height: isActive ? 20 : 14,
                        backgroundColor: isCompleted || isActive ? config.color : '#475569',
                        top: '50%',
                        left: '50%',
                        marginLeft: isActive ? -10 : -7,
                        marginTop: -orbitSize - (isActive ? 10 : 7),
                        boxShadow: isActive ? `0 0 15px ${config.color}` : 'none',
                      }}
                      animate={isActive ? {
                        scale: [1, 1.2, 1],
                      } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      onClick={() => {
                        setCurrentMysteryIndex(index);
                        setCurrentPrayer(0);
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Prayer Counter */}
            <div className="text-center mb-4">
              <div className="flex justify-center gap-1.5 mb-3 flex-wrap max-w-xs mx-auto">
                {[...Array(12)].map((_, index) => (
                  <motion.div
                    key={index}
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: index <= currentPrayer ? config.color : '#334155',
                    }}
                    animate={index === currentPrayer ? {
                      scale: [1, 1.3, 1],
                    } : {}}
                    transition={{ duration: 0.5, repeat: index === currentPrayer ? Infinity : 0 }}
                  />
                ))}
              </div>
              <p className="font-orbitron text-lg text-white">
                {getCurrentPrayerName()}
              </p>
            </div>

            {/* Prayer Text */}
            {showPrayerText && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="glass-cyber rounded-xl p-4 mb-4 border-white/10"
              >
                <p className="text-gray-200 text-sm whitespace-pre-line leading-relaxed">
                  {getCurrentPrayerText()}
                </p>
              </motion.div>
            )}

            {/* Toggle prayer text */}
            <button
              onClick={() => setShowPrayerText(!showPrayerText)}
              className="w-full text-center text-gray-400 text-sm hover:text-white transition-colors mb-4"
            >
              {showPrayerText ? 'Ocultar texto' : 'Mostrar texto de la oración'}
            </button>
          </ScrollArea>

          {/* Progress Bar */}
          <div className="px-6 py-2 border-t border-white/10">
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: config.color }}
                initial={{ width: 0 }}
                animate={{ width: `${totalProgress * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-center text-gray-400 text-xs mt-1">
              {Math.round(totalProgress * 100)}% completado
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 p-6 border-t border-white/10">
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

            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="text-gray-400 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPlaying(!isPlaying)}
              className={`w-16 h-16 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}
              style={{ boxShadow: `0 0 20px ${config.color}40` }}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 text-white" />
              ) : (
                <Play className="w-7 h-7 text-white ml-1" />
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