import { useState } from "react";
import { ListPlus, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePlaylistManager } from "@/hooks/usePlaylistManager";
import { AudioQueueItem } from "@/contexts/AudioPlayerContext";
import { toast } from "sonner";

interface AddToPlaylistButtonProps {
  item: AudioQueueItem;
  variant?: "icon" | "full";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AddToPlaylistButton({ 
  item, 
  variant = "icon",
  size = "md",
  className 
}: AddToPlaylistButtonProps) {
  const { addItem, removeItem, isInPlaylist, isLoggedIn } = usePlaylistManager();
  const [isLoading, setIsLoading] = useState(false);
  const [showCheck, setShowCheck] = useState(false);

  const isAdded = isInPlaylist(item.id);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isLoggedIn) {
      toast.error("Inicia sesión para crear tu rutina");
      return;
    }

    setIsLoading(true);
    
    try {
      if (isAdded) {
        await removeItem(item.id);
      } else {
        await addItem(item);
        setShowCheck(true);
        setTimeout(() => setShowCheck(false), 1500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-10 w-10"
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-5 w-5"
  };

  if (variant === "full") {
    return (
      <Button
        variant={isAdded ? "secondary" : "outline"}
        size="sm"
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          "gap-2 rounded-xl transition-all",
          isAdded && "bg-secondary/20 border-secondary text-secondary-foreground",
          className
        )}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isAdded ? (
            <motion.div
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Check className="h-4 w-4" />
            </motion.div>
          ) : (
            <motion.div
              key="plus"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <ListPlus className="h-4 w-4" />
            </motion.div>
          )}
        </AnimatePresence>
        <span>{isAdded ? "En tu rutina" : "Añadir a rutina"}</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "rounded-full transition-all",
        sizeClasses[size],
        isAdded 
          ? "text-secondary bg-secondary/10 hover:bg-secondary/20" 
          : "text-muted-foreground hover:text-primary hover:bg-primary/10",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <Loader2 className={cn(iconSizes[size], "animate-spin")} />
        ) : isAdded || showCheck ? (
          <motion.div
            key="check"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Check className={iconSizes[size]} />
          </motion.div>
        ) : (
          <motion.div
            key="plus"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <ListPlus className={iconSizes[size]} />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}
