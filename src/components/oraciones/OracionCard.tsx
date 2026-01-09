import { useState, useRef, useEffect } from "react";
import { Heart, Play, Pause, ChevronRight, Volume2, Loader2, Cross } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAudioCache } from "@/hooks/useAudioCache";

interface OracionCardProps {
  id: string;
  nombre: string;
  texto: string;
  categoria: string;
  subcategoria?: string;
  historia?: string;
  audioUrl?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onSelect?: () => void;
  onPlay?: () => void;
  esFundamental?: boolean;
}

export function OracionCard({
  id,
  nombre,
  texto,
  categoria,
  subcategoria,
  historia,
  audioUrl,
  isFavorite = false,
  onToggleFavorite,
  onSelect,
  onPlay,
  esFundamental = false,
}: OracionCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { getAudioWithCache } = useAudioCache();

  // Pre-cache audio if URL exists
  useEffect(() => {
    if (audioUrl) {
      getAudioWithCache(audioUrl).then(cached => {
        if (cached) setCachedUrl(cached);
      });
    }
  }, [audioUrl, getAudioWithCache]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayPause = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioUrl) return;
    
    // If onPlay is provided, use global player instead of local audio
    if (onPlay) {
      onPlay();
      return;
    }
    
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    // Get cached or original URL
    const urlToPlay = cachedUrl || audioUrl;
    
    try {
      setIsLoading(true);
      
      if (!audioRef.current || audioRef.current.src !== urlToPlay) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        audioRef.current = new Audio(urlToPlay);
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onerror = () => {
          setIsPlaying(false);
          setIsLoading(false);
        };
      }
      
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(id);
  };

  // Get first line preview
  const preview = texto.split('\n')[0].substring(0, 80) + (texto.length > 80 ? "..." : "");

  return (
    <motion.div 
      className={cn(
        "relative cursor-pointer overflow-hidden",
        "rounded-2xl border border-border/50",
        "bg-gradient-to-br from-card to-card/80",
        "transition-all duration-300",
        "hover:shadow-medium hover:border-primary/20",
        "active:scale-[0.98]",
        "group",
        esFundamental && "border-secondary/30 bg-gradient-to-br from-secondary/5 to-card"
      )}
      onClick={onSelect}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative p-4">
        <div className="flex items-start gap-3">
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {esFundamental && (
                <span className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Cross className="h-3 w-3" />
                  Fundamental
                </span>
              )}
              <span className="text-xs font-medium text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-full">
                {subcategoria || categoria}
              </span>
              {audioUrl && (
                <span className="text-xs text-primary flex items-center gap-1">
                  <Volume2 className="h-3 w-3" />
                  Audio
                </span>
              )}
            </div>
            <h3 className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {nombre}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {preview}
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 rounded-full",
                isFavorite 
                  ? "text-destructive hover:text-destructive/80" 
                  : "text-muted-foreground hover:text-destructive"
              )}
              onClick={handleFavorite}
            >
              <Heart 
                className="h-5 w-5 transition-transform group-hover:scale-110" 
                fill={isFavorite ? "currentColor" : "none"}
              />
            </Button>
            
            {audioUrl && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-primary hover:bg-primary/10"
                onClick={handlePlayPause}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </Button>
            )}
          </div>
        </div>
        
        {/* Bottom action hint */}
        <div className="flex items-center justify-end mt-2 text-xs text-muted-foreground/60 group-hover:text-primary/60 transition-colors">
          <span className="mr-1">Rezar</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </motion.div>
  );
}
