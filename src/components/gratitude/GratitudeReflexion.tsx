import { motion } from "framer-motion";
import { BookOpen, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AudioPlayer } from "@/components/rituals/AudioPlayer";

interface GratitudeReflexionProps {
  titulo: string;
  descripcion: string;
  duracionMin: number;
  audioUrl?: string | null;
  sesionNumero: number;
}

export const GratitudeReflexion = ({ 
  titulo, 
  descripcion, 
  duracionMin,
  audioUrl,
  sesionNumero
}: GratitudeReflexionProps) => {
  return (
    <Card className="border-0 bg-gradient-to-br from-amber-500/5 via-background to-rose-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            Sesión {sesionNumero}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {duracionMin} min
          </span>
        </div>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <span className="text-lg">{titulo}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {audioUrl && (
          <AudioPlayer audioUrl={audioUrl} title={titulo} />
        )}
        
        <ScrollArea className="h-[280px] pr-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <p className="text-foreground leading-relaxed whitespace-pre-line">
              {descripcion}
            </p>
          </motion.div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
