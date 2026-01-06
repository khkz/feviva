import { useState } from "react";
import { X, Heart, Play, Pause, Volume2, Info, Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useOracionAudio } from "@/hooks/useOracionAudio";
import { ShareModal } from "@/components/shared/ShareModal";
import { cn } from "@/lib/utils";

interface OracionDetailProps {
  id: string;
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
  id,
  nombre,
  texto,
  categoria,
  historia,
  audioUrl: existingAudioUrl,
  isFavorite = false,
  onToggleFavorite,
  onClose,
}: OracionDetailProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const {
    isGenerating,
    isPlaying,
    progress,
    toggle,
    hasAudio,
  } = useOracionAudio({
    oracionId: id,
    nombre,
    texto,
    existingAudioUrl,
  });

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
        
        <h1 className="font-heading font-bold text-lg">{nombre}</h1>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowShareModal(true)}
          >
            <Share2 className="h-5 w-5" />
          </Button>
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
        </div>
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
      <div className="p-4 border-t border-border bg-card">
        <div className="max-w-lg mx-auto">
          {/* Progress bar */}
          {(isPlaying || progress > 0) && (
            <Progress value={progress} className="h-1 mb-4" />
          )}
          
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              className="h-14 w-14 rounded-full"
              onClick={toggle}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-1" />
              )}
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Volume2 className="h-4 w-4" />
              <span>
                {isGenerating 
                  ? "Generando audio..." 
                  : isPlaying 
                    ? "Reproduciendo" 
                    : hasAudio 
                      ? "Escuchar oración" 
                      : "Generar y escuchar"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={nombre}
        text={texto}
        reference={categoria}
      />
    </div>
  );
}
