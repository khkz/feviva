import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { AudioPlayer } from "./AudioPlayer";

interface LaudesOracionProps {
  contenido: string;
  audioUrl?: string | null;
  tipo?: 'laudes' | 'completas';
}

export const LaudesOracion = ({ contenido, audioUrl, tipo = 'laudes' }: LaudesOracionProps) => {
  const paragraphs = contenido.split('\n').filter(p => p.trim());
  const isLaudes = tipo === 'laudes';
  const Icon = isLaudes ? Sun : Moon;

  const getStyle = (paragraph: string) => {
    if (paragraph.startsWith('R.')) {
      return 'text-accent font-medium italic pl-4 border-l-2 border-accent/50';
    }
    if (paragraph.startsWith('V.')) {
      return 'text-primary font-medium';
    }
    if (paragraph.startsWith('##') || paragraph.startsWith('**')) {
      return 'text-foreground font-semibold text-base';
    }
    return 'text-foreground/90';
  };

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
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">
              {isLaudes ? 'Oración de Laudes' : 'Oración de Completas'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isLaudes ? 'Oración de la mañana' : 'Oración de la noche'}
            </p>
          </div>
        </motion.div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {paragraphs.map((paragraph, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`text-sm leading-relaxed ${getStyle(paragraph)}`}
              >
                {paragraph.replace(/^##\s*/, '').replace(/^\*\*|\*\*$/g, '')}
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
            <AudioPlayer src={audioUrl} title={`Escuchar ${isLaudes ? 'laudes' : 'completas'}`} compact />
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};