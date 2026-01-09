import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { cn } from "@/lib/utils";

interface MiniPlayerProps {
  className?: string;
}

export function MiniPlayer({ className }: MiniPlayerProps) {
  const {
    currentStory,
    audioUrl,
    isPlaying,
    currentTime,
    duration,
    isMinimized,
    isGenerating,
    togglePlay,
    expand,
    close,
  } = useAudioPlayer();

  // Only show when minimized and there's an active story
  if (!currentStory || !isMinimized) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        className={cn(
          "fixed left-0 right-0 z-40 px-3",
          "bottom-[calc(4rem+env(safe-area-inset-bottom))] lg:bottom-4 lg:left-64",
          className
        )}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div 
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/95 via-purple-950/95 to-slate-950/95 backdrop-blur-xl border border-white/10 shadow-lg shadow-indigo-500/10 cursor-pointer"
          onClick={expand}
        >
          {/* Progress bar at top */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-400 to-purple-400"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          <div className="flex items-center gap-3 p-3">
            {/* Story image */}
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-indigo-500/30 to-purple-500/20">
              {currentStory.imagen_url ? (
                <img 
                  src={currentStory.imagen_url} 
                  alt={currentStory.titulo}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Moon className="w-6 h-6 text-indigo-400/60" />
                </div>
              )}
            </div>

            {/* Story info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {currentStory.titulo}
              </p>
              <p className="text-xs text-indigo-200/60">
                {formatTime(currentTime)} / {formatTime(duration)}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 text-white hover:text-white hover:bg-white/10 rounded-full"
                onClick={togglePlay}
                disabled={!audioUrl || isGenerating}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-white/60 hover:text-white hover:bg-white/10 rounded-full"
                onClick={close}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
