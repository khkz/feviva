import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X, Moon, Cross, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { cn } from "@/lib/utils";

interface MiniPlayerProps {
  className?: string;
}

export function MiniPlayer({ className }: MiniPlayerProps) {
  const {
    currentItem,
    audioUrl,
    isPlaying,
    currentTime,
    duration,
    isMinimized,
    isGenerating,
    queue,
    togglePlay,
    expand,
    close,
    playNext,
    playPrevious,
    hasNext,
    hasPrevious,
  } = useAudioPlayer();

  // Only show when minimized and there's an active item
  if (!currentItem || !isMinimized) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isOracion = currentItem.type === 'oracion';
  const hasQueue = queue.length > 1;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const gradientClass = isOracion
    ? "from-secondary/95 via-secondary/90 to-primary/90"
    : "from-indigo-950/95 via-purple-950/95 to-slate-950/95";

  const progressGradient = isOracion
    ? "from-primary to-secondary"
    : "from-indigo-400 to-purple-400";

  const IconComponent = isOracion ? Cross : Moon;

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
          className={cn(
            "relative overflow-hidden rounded-2xl backdrop-blur-xl border shadow-lg cursor-pointer",
            isOracion
              ? "bg-gradient-to-r border-secondary/20 shadow-secondary/10"
              : "bg-gradient-to-r border-white/10 shadow-indigo-500/10",
            gradientClass
          )}
          onClick={expand}
        >
          {/* Progress bar at top */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10">
            <motion.div 
              className={cn("h-full bg-gradient-to-r", progressGradient)}
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          <div className="flex items-center gap-3 p-3">
            {/* Item image */}
            <div className={cn(
              "w-12 h-12 rounded-xl overflow-hidden shrink-0",
              isOracion 
                ? "bg-gradient-to-br from-secondary/30 to-primary/20"
                : "bg-gradient-to-br from-indigo-500/30 to-purple-500/20"
            )}>
              {currentItem.imageUrl ? (
                <img 
                  src={currentItem.imageUrl} 
                  alt={currentItem.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <IconComponent className={cn(
                    "w-6 h-6",
                    isOracion ? "text-secondary-foreground/60" : "text-indigo-400/60"
                  )} />
                </div>
              )}
            </div>

            {/* Item info */}
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium truncate",
                isOracion ? "text-secondary-foreground" : "text-white"
              )}>
                {currentItem.title}
              </p>
              <p className={cn(
                "text-xs",
                isOracion ? "text-secondary-foreground/60" : "text-indigo-200/60"
              )}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
              {/* Previous button (only if queue has multiple items) */}
              {hasQueue && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "w-8 h-8 rounded-full",
                    isOracion 
                      ? "text-secondary-foreground/60 hover:text-secondary-foreground hover:bg-secondary-foreground/10"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  )}
                  onClick={playPrevious}
                  disabled={!hasPrevious}
                >
                  <SkipBack className="w-4 h-4" />
                </Button>
              )}

              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "w-10 h-10 rounded-full",
                  isOracion 
                    ? "text-secondary-foreground hover:text-secondary-foreground hover:bg-secondary-foreground/10"
                    : "text-white hover:text-white hover:bg-white/10"
                )}
                onClick={togglePlay}
                disabled={!audioUrl || isGenerating}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </Button>

              {/* Next button (only if queue has multiple items) */}
              {hasQueue && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "w-8 h-8 rounded-full",
                    isOracion 
                      ? "text-secondary-foreground/60 hover:text-secondary-foreground hover:bg-secondary-foreground/10"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  )}
                  onClick={playNext}
                  disabled={!hasNext}
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              )}
              
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "w-8 h-8 rounded-full",
                  isOracion 
                    ? "text-secondary-foreground/60 hover:text-secondary-foreground hover:bg-secondary-foreground/10"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
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
