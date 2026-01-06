import { Card, CardContent } from "@/components/ui/card";
import { AudioPlayer } from "./AudioPlayer";
import { BookOpen } from "lucide-react";

interface DailyVerseProps {
  referencia: string;
  texto: string;
  audioUrl?: string | null;
}

export const DailyVerse = ({ referencia, texto, audioUrl }: DailyVerseProps) => {
  return (
    <Card className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-primary/20">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <BookOpen className="h-5 w-5" />
          <span className="font-semibold">{referencia}</span>
        </div>
        
        <blockquote className="text-lg md:text-xl italic text-foreground leading-relaxed border-l-4 border-primary/50 pl-4">
          "{texto}"
        </blockquote>
        
        {audioUrl && (
          <AudioPlayer src={audioUrl} title="Escuchar versículo" compact />
        )}
      </CardContent>
    </Card>
  );
};
