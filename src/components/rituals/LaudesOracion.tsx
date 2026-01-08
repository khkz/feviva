import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sun, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface LaudesOracionProps {
  contenido: string;
}

export const LaudesOracion = ({ contenido }: LaudesOracionProps) => {
  const paragraphs = contenido.split('\n').filter(p => p.trim());

  return (
    <Card className="glass-card border-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/15 via-transparent to-primary/5" />
      <CardHeader className="relative pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary/30 to-secondary/10 flex items-center justify-center">
            <Heart className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <span className="text-foreground">Oración de Laudes</span>
            <p className="text-xs font-normal text-muted-foreground mt-0.5">Alabanza matutina</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <ScrollArea className="h-[280px] pr-4">
          <div className="space-y-4 text-foreground">
            {paragraphs.map((paragraph, index) => {
              const isResponse = paragraph.startsWith('R.');
              const isVersicle = paragraph.startsWith('V.');
              const isTitle = paragraph.startsWith('##') || paragraph.startsWith('**');
              
              return (
                <motion.p 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`leading-relaxed ${
                    isResponse 
                      ? 'font-semibold text-primary pl-4 border-l-2 border-secondary' 
                      : isVersicle
                        ? 'font-medium text-muted-foreground'
                        : isTitle
                          ? 'font-bold text-lg text-foreground'
                          : ''
                  }`}
                >
                  {paragraph.replace(/^##\s*/, '').replace(/\*\*/g, '')}
                </motion.p>
              );
            })}
          </div>
        </ScrollArea>
        
        {/* Fade overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
      </CardContent>
    </Card>
  );
};
