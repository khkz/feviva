import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Shield, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { AudioPlayer } from "./AudioPlayer";

interface TipApologeticoCardProps {
  contenido: string;
  audioUrl?: string | null;
}

export const TipApologeticoCard = ({ contenido, audioUrl }: TipApologeticoCardProps) => {
  return (
    <Card className="glass-card border-accent/20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none" />
      
      <CardHeader className="relative pb-3">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 border border-accent/30">
            <Shield className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              Tip Apologético
              <Lightbulb className="h-4 w-4 text-yellow-500 animate-pulse" />
            </h3>
            <p className="text-xs text-muted-foreground">Defiende tu fe con sabiduría</p>
          </div>
        </motion.div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20"
        >
          <p className="text-foreground/90 leading-relaxed text-sm italic">
            "{contenido}"
          </p>
        </motion.div>

        {audioUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AudioPlayer src={audioUrl} title="Escuchar tip" compact />
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
