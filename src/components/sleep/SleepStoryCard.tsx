import { Card, CardContent } from "@/components/ui/card";
import { Moon, Clock } from "lucide-react";
import { SleepStory } from "@/hooks/useSleepStories";

interface SleepStoryCardProps {
  story: SleepStory;
  onClick: () => void;
}

export const SleepStoryCard = ({ story, onClick }: SleepStoryCardProps) => {
  return (
    <Card 
      className="bg-card/50 border-border/30 hover:bg-card/70 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/30 transition-colors">
            <Moon className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{story.titulo}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {story.descripcion}
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{story.duracion_estimada} min</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
