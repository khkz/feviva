import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BookHeart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { AudioPlayer } from "./AudioPlayer";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReflexionCardProps {
  contenido: string;
  audioUrl?: string | null;
}

export const ReflexionCard = ({ contenido, audioUrl }: ReflexionCardProps) => {
  const paragraphs = contenido.split('\n\n').filter(p => p.trim());

  return (
    <Card className="glass-card border-primary/20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <CardHeader className="relative pb-3">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
            <BookHeart className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              Reflexión del Día
              <Sparkles className="h-4 w-4 text-accent animate-pulse" />
            </h3>
            <p className="text-xs text-muted-foreground">Meditación guiada</p>
          </div>
        </motion.div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        <ScrollArea className="h-[280px] pr-4">
          <div className="space-y-4">
            {paragraphs.map((paragraph, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                className="text-foreground/90 leading-relaxed text-sm"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
          <div className="h-8 bg-gradient-to-t from-card to-transparent absolute bottom-0 left-0 right-4 pointer-events-none" />
        </ScrollArea>

        {audioUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AudioPlayer src={audioUrl} title="Escuchar reflexión" compact />
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
