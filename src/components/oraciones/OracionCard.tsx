import { useState } from "react";
import { Heart, Play, Pause, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
}: OracionCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(() => audioUrl ? new Audio(audioUrl) : null);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(id);
  };

  // Get first line preview
  const preview = texto.split('\n')[0].substring(0, 60) + (texto.length > 60 ? "..." : "");

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-smooth hover:shadow-medium group",
        "border-border/50 hover:border-primary/30"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {subcategoria || categoria}
              </span>
            </div>
            <h3 className="font-heading font-semibold text-foreground truncate group-hover:text-primary transition-smooth">
              {nombre}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {preview}
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8",
                isFavorite && "text-destructive"
              )}
              onClick={handleFavorite}
            >
              <Heart 
                className="h-4 w-4" 
                fill={isFavorite ? "currentColor" : "none"}
              />
            </Button>
            
            {audioUrl && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
