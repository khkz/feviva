import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X, SkipBack, SkipForward, ListMusic, Moon, Cross, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { cn } from "@/lib/utils";
import { PlaylistDrawer } from "./PlaylistDrawer";

interface UnifiedMiniPlayerProps {
  className?: string;
}

export function UnifiedMiniPlayer({ className }: UnifiedMiniPlayerProps) {
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

  const [showPlaylist, setShowPlaylist] = useState(false);

  // Only show when minimized and there's an active item
  if (!currentItem || !isMinimized) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const hasQueue = queue.length > 1;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Theme based on content type
  const theme = 
    currentItem.type === 'oracion'
      ? {
          bg: "from-secondary/95 via-secondary/90 to-primary/90",
          progressBg: "from-primary to-secondary",
          text: "text-secondary-foreground",
          textMuted: "text-secondary-foreground/60",
          buttonHover: "hover:bg-secondary-foreground/10",
          border: "border-secondary/20",
          icon: Cross,
          iconBg: "from-secondary/30 to-primary/20",
          subtitle: "Oración"
        }
      : currentItem.type === 'lesson'
      ? {
          bg: "from-blue-950/95 via-indigo-950/95 to-slate-950/95",
          progressBg: "from-blue-400 to-indigo-400",
          text: "text-white",
          textMuted: "text-blue-200/60",
          buttonHover: "hover:bg-white/10",
          border: "border-blue-500/20",
          icon: BookOpen,
          iconBg: "from-blue-500/30 to-indigo-500/20",
          subtitle: "Lección"
        }
      : {
          bg: "from-indigo-950/95 via-purple-950/95 to-slate-950/95",
          progressBg: "from-indigo-400 to-purple-400",
          text: "text-white",
          textMuted: "text-indigo-200/60",
          buttonHover: "hover:bg-white/10",
          border: "border-white/10",
          icon: Moon,
          iconBg: "from-indigo-500/30 to-purple-500/20",
          subtitle: "Historia para dormir"
        };

  const IconComponent = theme.icon;

  return (
    <>
      <AnimatePresence>
        <motion.div
          className={cn(
            "fixed left-0 right-0 z-40 px-3",
            "bottom-[calc(4rem+env(safe-area-inset-bottom))] lg:bottom-4 lg:left-64 lg:right-4",
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
              "bg-gradient-to-r",
              theme.bg,
              theme.border
            )}
            onClick={expand}
          >
            {/* Progress bar at top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
              <motion.div
                className={cn("h-full bg-gradient-to-r", theme.progressBg)}
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            <div className="flex items-center gap-3 p-3 pt-4">
              {/* Item image/icon */}
              <div className={cn(
                "w-12 h-12 rounded-xl overflow-hidden shrink-0",
                "bg-gradient-to-br",
                theme.iconBg
              )}>
                {currentItem.imageUrl ? (
                  <img
                    src={currentItem.imageUrl}
                    alt={currentItem.title}
                    className="w-full h-full object-cover"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <IconComponent className={cn("w-6 h-6", theme.textMuted)} />
                  </div>
                )}
              </div>

              {/* Item info */}
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium truncate", theme.text)}>
                  {currentItem.title}
                </p>
                <p className={cn("text-xs", theme.textMuted)}>
                  {currentItem.subtitle || theme.subtitle} • {formatTime(currentTime)} / {formatTime(duration)}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                {/* Previous button */}
                {hasQueue && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("hidden h-11 w-11 rounded-full sm:inline-flex", theme.textMuted, theme.text, theme.buttonHover)}
                    onClick={playPrevious}
                    disabled={!hasPrevious}
                    aria-label="Reproducir anterior"
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>
                )}

                {/* Play/Pause */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-11 w-11 rounded-full", theme.text, theme.buttonHover)}
                  onClick={togglePlay}
                  disabled={!audioUrl || isGenerating}
                  aria-label={isGenerating ? "Preparando audio" : isPlaying ? "Pausar audio" : "Reproducir audio"}
                >
                  {isGenerating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </Button>

                {/* Next button */}
                {hasQueue && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("hidden h-11 w-11 rounded-full sm:inline-flex", theme.textMuted, theme.text, theme.buttonHover)}
                    onClick={playNext}
                    disabled={!hasNext}
                    aria-label="Reproducir siguiente"
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                )}

                {/* Queue button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("hidden h-11 w-11 rounded-full sm:inline-flex", theme.textMuted, theme.text, theme.buttonHover)}
                  onClick={() => setShowPlaylist(true)}
                  aria-label="Abrir lista de reproducción"
                >
                  <ListMusic className="w-4 h-4" />
                </Button>

                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-11 w-11 rounded-full", theme.textMuted, theme.text, theme.buttonHover)}
                  onClick={close}
                  aria-label="Cerrar reproductor"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Playlist Drawer */}
      <PlaylistDrawer
        isOpen={showPlaylist}
        onClose={() => setShowPlaylist(false)}
      />
    </>
  );
}
