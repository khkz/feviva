import { Card, CardContent } from "@/components/ui/card";
import { AudioPlayer } from "./AudioPlayer";
import { BookOpen, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { DailyShareButton } from "@/components/shared/DailyShareButton";

interface DailyVerseProps {
  referencia: string;
  texto: string;
  audioUrl?: string | null;
}

export const DailyVerse = ({ referencia, texto, audioUrl }: DailyVerseProps) => {
  return (
    <Card className="glass-card border-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-secondary/10" />
      <CardContent className="relative pt-6 pb-6 space-y-5">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <span className="font-semibold text-primary">{referencia}</span>
        </motion.div>
        
        {/* Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Quote className="absolute -top-1 -left-1 h-8 w-8 text-secondary/30 rotate-180" />
          <blockquote className="text-lg md:text-xl text-foreground leading-relaxed pl-6 pr-2 py-2">
            {texto}
          </blockquote>
          <Quote className="absolute -bottom-1 right-0 h-8 w-8 text-secondary/30" />
        </motion.div>
        
        {/* Audio player and share */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3"
        >
          {audioUrl && (
            <div className="flex-1">
              <AudioPlayer src={audioUrl} title="Escuchar versículo" compact />
            </div>
          )}
          <DailyShareButton 
            tipo="versiculo"
            title=""
            fallbackText={`✝️ "${texto}" - ${referencia}. Encuentra más inspiración en ElRugido.`}
            variant="ghost"
            size="icon"
            className="shrink-0"
          />
        </motion.div>
      </CardContent>
    </Card>
  );
};
