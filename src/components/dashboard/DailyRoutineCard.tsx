import { useState } from "react";
import { Play, Cross, ChevronRight, ListMusic } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { usePlaylistManager } from "@/hooks/usePlaylistManager";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { PlaylistDrawer } from "@/components/audio/PlaylistDrawer";
import { cn } from "@/lib/utils";

export function DailyRoutineCard() {
  const { dailyPlaylist, toQueueItems, isLoading, isLoggedIn } = usePlaylistManager();
  const { playQueue } = useAudioPlayer();
  const [showDrawer, setShowDrawer] = useState(false);

  // Don't show if not logged in or loading
  if (!isLoggedIn || isLoading) return null;
  
  // Don't show if no items
  if (dailyPlaylist.length === 0) return null;

  const handlePlay = () => {
    const queueItems = toQueueItems();
    if (queueItems.length > 0) {
      playQueue(queueItems, 0);
    }
  };

  // Get first 3 items to preview
  const previewItems = dailyPlaylist.slice(0, 3);
  const remainingCount = dailyPlaylist.length - 3;

  return (
    <>
      <motion.div
        className="px-5 lg:px-0 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary/10 via-secondary/5 to-primary/10 border border-secondary/20 p-4">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-secondary/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-secondary/20">
                  <Cross className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground">
                    Mi Rutina de Oración
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {dailyPlaylist.length} {dailyPlaylist.length === 1 ? 'oración' : 'oraciones'}
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-muted-foreground hover:text-secondary"
                onClick={() => setShowDrawer(true)}
              >
                <ListMusic className="w-5 h-5" />
              </Button>
            </div>

            {/* Preview items */}
            <div className="flex items-center gap-2 mb-4">
              {previewItems.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex-1 p-2 rounded-lg bg-background/50 backdrop-blur-sm",
                    "flex items-center gap-2 min-w-0"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                    <Cross className="w-4 h-4 text-secondary" />
                  </div>
                  <span className="text-sm font-medium truncate">{item.title}</span>
                </div>
              ))}
              
              {remainingCount > 0 && (
                <button
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-secondary transition-colors"
                  onClick={() => setShowDrawer(true)}
                >
                  +{remainingCount} más
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Play button */}
            <Button
              className="w-full h-12 rounded-xl bg-gradient-to-r from-secondary to-primary hover:opacity-90 text-white font-medium gap-2"
              onClick={handlePlay}
            >
              <Play className="w-5 h-5" />
              Reproducir Rutina
            </Button>
          </div>
        </div>
      </motion.div>

      <PlaylistDrawer isOpen={showDrawer} onClose={() => setShowDrawer(false)} />
    </>
  );
}
