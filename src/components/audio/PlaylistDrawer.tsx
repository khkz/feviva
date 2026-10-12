import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Trash2, ListMusic, Cross, Moon, BookOpen, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAudioPlayer, type AudioQueueItem } from "@/contexts/AudioPlayerContext";
import { usePlaylistManager, PlaylistItem } from "@/hooks/usePlaylistManager";
import { cn } from "@/lib/utils";

interface PlaylistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlaylistDrawer({ isOpen, onClose }: PlaylistDrawerProps) {
  const { queue, currentIndex, playQueue } = useAudioPlayer();
  const { dailyPlaylist, removeItem, clearPlaylist, toQueueItems, isLoading } = usePlaylistManager();

  const handlePlayRoutine = () => {
    const queueItems = toQueueItems();
    if (queueItems.length > 0) {
      playQueue(queueItems, 0);
      onClose();
    }
  };

  const handleRemoveFromRoutine = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeItem(itemId);
  };

  const handlePlayFromQueue = (index: number) => {
    playQueue(queue, index);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl shadow-2xl max-h-[85vh]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1.5 bg-muted rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-secondary/10">
                  <ListMusic className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h2 className="font-heading font-semibold text-lg">Mi Rutina de Oración</h2>
                  <p className="text-sm text-muted-foreground">
                    {dailyPlaylist.length} {dailyPlaylist.length === 1 ? 'oración' : 'oraciones'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <ScrollArea className="max-h-[60vh]">
              <div className="p-4 space-y-6">
                {/* Current Queue Section */}
                {queue.length > 0 && (
                  <section>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 px-2">
                      Cola Actual
                    </h3>
                    <div className="space-y-2">
                      {queue.map((item, index) => (
                        <QueueItem
                          key={`queue-${item.id}-${index}`}
                          title={item.title}
                          subtitle={item.subtitle}
                          type={item.type}
                          imageUrl={item.imageUrl}
                          isActive={index === currentIndex}
                          onClick={() => handlePlayFromQueue(index)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Daily Routine Section */}
                <section>
                  <div className="flex items-center justify-between mb-3 px-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Rutina Guardada
                    </h3>
                    {dailyPlaylist.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-destructive"
                        onClick={clearPlaylist}
                      >
                        Vaciar
                      </Button>
                    )}
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-pulse text-muted-foreground">Cargando...</div>
                    </div>
                  ) : dailyPlaylist.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                        <Cross className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <p className="text-muted-foreground mb-2">Tu rutina está vacía</p>
                      <p className="text-sm text-muted-foreground/70">
                        Añade oraciones desde el catálogo usando el botón +
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {dailyPlaylist.map((item) => (
                        <RoutineItem
                          key={item.id}
                          item={item}
                          onRemove={(e) => handleRemoveFromRoutine(item.id, e)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </ScrollArea>

            {/* Play Button */}
            {dailyPlaylist.length > 0 && (
              <div className="p-4 border-t border-border bg-background">
                <Button
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-secondary to-primary text-white font-medium text-lg gap-3"
                  onClick={handlePlayRoutine}
                >
                  <Play className="w-5 h-5" />
                  Reproducir Rutina
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Queue item component
function QueueItem({
  title,
  subtitle,
  type,
  imageUrl,
  isActive,
  onClick,
}: {
  title: string;
  subtitle?: string;
  type: AudioQueueItem['type'];
  imageUrl?: string;
  isActive?: boolean;
  onClick: () => void;
}) {
  const isPrayer = type === 'oracion' || type === 'ritual' || type === 'rosario';
  const IconComponent = isPrayer ? Cross : type === 'lesson' ? BookOpen : Moon;
  const iconBg = isPrayer ? "bg-secondary/10" : type === 'lesson' ? "bg-blue-500/10" : "bg-indigo-500/10";
  const iconColor = isPrayer ? "text-secondary" : type === 'lesson' ? "text-blue-400" : "text-indigo-400";

  return (
    <motion.button
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors",
        isActive
          ? "bg-secondary/20 border border-secondary/30"
          : "hover:bg-muted/50"
      )}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
    >
      <div className={cn(
        "w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center",
        iconBg
      )}>
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <IconComponent className={cn("w-5 h-5", iconColor)} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium truncate",
          isActive && "text-secondary"
        )}>
          {title}
        </p>
        {subtitle && (
          <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>
      {isActive && (
        <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
      )}
    </motion.button>
  );
}

// Routine item with delete
function RoutineItem({
  item,
  onRemove,
}: {
  item: PlaylistItem;
  onRemove: (e: React.MouseEvent) => void;
}) {
  const IconComponent = item.type === 'oracion' ? Cross : item.type === 'lesson' ? BookOpen : Moon;
  const iconBg = item.type === 'oracion' ? "bg-secondary/10" : item.type === 'lesson' ? "bg-blue-500/10" : "bg-indigo-500/10";
  const iconColor = item.type === 'oracion' ? "text-secondary" : item.type === 'lesson' ? "text-blue-400" : "text-indigo-400";

  return (
    <motion.div
      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
    >
      <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab" />
      
      <div className={cn(
        "w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center",
        iconBg
      )}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <IconComponent className={cn("w-5 h-5", iconColor)} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.title}</p>
        {item.subtitle && (
          <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        onClick={onRemove}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}
