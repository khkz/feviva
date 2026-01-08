import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Clock, Volume2, Sparkles, ImageOff } from "lucide-react";
import { SleepStory } from "@/hooks/useSleepStories";
import { motion } from "framer-motion";
import { useState } from "react";

interface SleepStoryCardProps {
  story: SleepStory;
  onClick: () => void;
  onGenerateImage?: () => Promise<void>;
}

export const SleepStoryCard = ({ story, onClick, onGenerateImage }: SleepStoryCardProps) => {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const handleGenerateImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onGenerateImage) return;
    
    setIsGeneratingImage(true);
    try {
      await onGenerateImage();
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const getCategoryColor = (categoria: string) => {
    const colors: Record<string, string> = {
      'Antiguo Testamento': 'from-amber-500/80 to-orange-600/80',
      'Nuevo Testamento': 'from-blue-500/80 to-cyan-600/80',
      'Salmos': 'from-purple-500/80 to-violet-600/80',
      'Parábolas': 'from-green-500/80 to-emerald-600/80',
      'default': 'from-indigo-500/80 to-purple-600/80'
    };
    return colors[categoria] || colors.default;
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card 
        className="overflow-hidden glass-card border-border/30 cursor-pointer group"
        onClick={onClick}
      >
        {/* Image Section */}
        <div className="relative aspect-[16/9] bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-slate-900/40 overflow-hidden">
          {story.imagen_url ? (
            <>
              <img 
                src={story.imagen_url} 
                alt={story.titulo}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <Moon className="w-8 h-8 text-indigo-400/60" />
              </div>
              {onGenerateImage && (
                <Button
                  variant="outline"
                  size="sm"
                  className="glass-button text-xs gap-1.5"
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                >
                  {isGeneratingImage ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </motion.div>
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  Generar imagen
                </Button>
              )}
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-2 left-2">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium text-white bg-gradient-to-r ${getCategoryColor(story.categoria)} backdrop-blur-sm`}>
              {story.categoria}
            </span>
          </div>

          {/* Audio Available Indicator */}
          {story.audio_url && (
            <div className="absolute top-2 right-2">
              <div className="w-7 h-7 rounded-full bg-green-500/20 backdrop-blur-sm flex items-center justify-center">
                <Volume2 className="w-3.5 h-3.5 text-green-400" />
              </div>
            </div>
          )}

          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-[10px] text-white">
              <Clock className="w-3 h-3" />
              {story.duracion_estimada} min
            </div>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
            {story.titulo}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {story.descripcion}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};
