import { useState, useEffect, useRef } from "react";
import { X, Heart, Play, Pause, Volume2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface OracionDetailProps {
  nombre: string;
  texto: string;
  categoria: string;
  historia?: string;
  audioUrl?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onClose: () => void;
}

export function OracionDetail({
  nombre,
  texto,
  categoria,
  historia,
  audioUrl,
  isFavorite = false,
  onToggleFavorite,
  onClose,
}: OracionDetailProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [audioUrl]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
        
        <h1 className="font-heading font-bold text-lg">{nombre}</h1>
        
        <Button
          variant="ghost"
          size="icon"
          className={cn(isFavorite && "text-destructive")}
          onClick={onToggleFavorite}
        >
          <Heart 
            className="h-5 w-5" 
            fill={isFavorite ? "currentColor" : "none"}
          />
        </Button>
      </header>

      {/* Content */}
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-lg mx-auto">
          <span className="inline-block text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full mb-4">
            {categoria}
          </span>
          
          <div className="prose prose-lg dark:prose-invert">
            {texto.split('\n').map((line, i) => (
              <p key={i} className="text-foreground leading-relaxed mb-2">
                {line}
              </p>
            ))}
          </div>

          {historia && (
            <div className="mt-8">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => setShowHistory(!showHistory)}
              >
                <Info className="h-4 w-4" />
                {showHistory ? "Ocultar historia" : "Ver historia de esta oración"}
              </Button>
              
              {showHistory && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {historia}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Audio Controls */}
      {audioUrl && (
        <div className="p-4 border-t border-border bg-card">
          <div className="max-w-lg mx-auto flex items-center justify-center gap-4">
            <Button
              size="lg"
              className="h-14 w-14 rounded-full"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-1" />
              )}
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Volume2 className="h-4 w-4" />
              <span>Escuchar oración</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
