import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, ChevronRight, ChevronLeft, X, Maximize2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRosario } from '@/contexts/RosarioContext';
import { MISTERIOS } from '@/lib/rosarioData';

const mysteryConfig = {
  gozosos: { color: "#22d3ee", gradient: "from-cyan-400 to-cyan-600" },
  luminosos: { color: "#fbbf24", gradient: "from-amber-400 to-amber-600" },
  dolorosos: { color: "#ef4444", gradient: "from-red-400 to-red-600" },
  gloriosos: { color: "#a855f7", gradient: "from-purple-400 to-purple-600" },
};

export function RosarioMiniPlayer() {
  const {
    isMinimized,
    currentMysteryType,
    currentMysteryIndex,
    currentPrayer,
    isPlaying,
    totalProgress,
    isTtsGenerating,
    expand,
    close,
    togglePlay,
    next,
    previous,
    getCurrentPrayerName,
  } = useRosario();

  if (!isMinimized) return null;

  const config = mysteryConfig[currentMysteryType];
  const mysteryData = MISTERIOS[currentMysteryType];
  const currentMystery = mysteryData.misterios[currentMysteryIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40"
      >
        <div 
          className="glass-cyber rounded-2xl border overflow-hidden"
          style={{ borderColor: `${config.color}40` }}
        >
          {/* Progress bar at top */}
          <div className="h-1 bg-slate-800">
            <motion.div
              className="h-full"
              style={{ backgroundColor: config.color }}
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="p-3">
            <div className="flex items-center gap-3">
              {/* Animated planet icon */}
              <motion.div
                animate={{ 
                  rotate: isPlaying ? 360 : 0,
                  boxShadow: isPlaying ? [
                    `0 0 10px ${config.color}40`,
                    `0 0 20px ${config.color}60`,
                    `0 0 10px ${config.color}40`,
                  ] : `0 0 10px ${config.color}40`
                }}
                transition={{ 
                  rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                  boxShadow: { duration: 2, repeat: Infinity }
                }}
                onClick={expand}
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center cursor-pointer flex-shrink-0`}
              >
                <span className="text-xl">🪐</span>
              </motion.div>

              {/* Info */}
              <div className="flex-1 min-w-0" onClick={expand}>
                <p className="text-white font-medium text-sm truncate cursor-pointer">
                  {currentMystery.titulo}
                </p>
                <p className="text-gray-400 text-xs truncate">
                  {mysteryData.nombre.replace('Misterios ', '')} • {getCurrentPrayerName()}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={previous}
                  className="w-8 h-8 text-gray-400 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={togglePlay}
                  disabled={isTtsGenerating}
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}
                  style={{ boxShadow: `0 0 15px ${config.color}40` }}
                >
                  {isTtsGenerating ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  )}
                </motion.button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={next}
                  className="w-8 h-8 text-gray-400 hover:text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={expand}
                  className="w-8 h-8 text-gray-400 hover:text-white"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={close}
                  className="w-8 h-8 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Prayer counter dots */}
            <div className="flex justify-center gap-1 mt-2">
              {[...Array(12)].map((_, index) => (
                <motion.div
                  key={index}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ 
                    backgroundColor: index <= currentPrayer ? config.color : '#334155' 
                  }}
                  animate={index === currentPrayer ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.5, repeat: index === currentPrayer ? Infinity : 0 }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
