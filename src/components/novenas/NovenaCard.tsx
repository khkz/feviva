import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Play, CheckCircle2 } from "lucide-react";
import { Novena, UserNovenaProgress } from "@/hooks/useNovenas";

interface NovenaCardProps {
  novena: Novena;
  progress?: UserNovenaProgress;
  onStart: () => void;
  onContinue: () => void;
}

export const NovenaCard = ({ novena, progress, onStart, onContinue }: NovenaCardProps) => {
  const progressPercent = progress 
    ? (progress.dias_completados.length / 9) * 100 
    : 0;

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case "mariana":
        return "from-blue-500/20 to-blue-600/20";
      case "cristologica":
        return "from-red-500/20 to-red-600/20";
      case "espiritu_santo":
        return "from-orange-500/20 to-orange-600/20";
      default:
        return "from-primary/20 to-primary/30";
    }
  };

  const getCategoriaLabel = (categoria: string) => {
    switch (categoria) {
      case "mariana":
        return "Mariana";
      case "cristologica":
        return "Cristológica";
      case "espiritu_santo":
        return "Espíritu Santo";
      default:
        return "General";
    }
  };

  return (
    <Card className={`overflow-hidden bg-gradient-to-br ${getCategoriaColor(novena.categoria)} border-border/50`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {getCategoriaLabel(novena.categoria)}
            </span>
            <h3 className="font-semibold text-foreground mt-1">{novena.titulo}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {novena.descripcion}
            </p>
          </div>
          <div className="p-2 rounded-full bg-background/50">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
        </div>

        {progress && !progress.completada && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Día {progress.dia_actual} de 9</span>
              <span>{progress.dias_completados.length}/9 completados</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {progress?.completada && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">Novena completada</span>
          </div>
        )}

        <div className="flex gap-2">
          {!progress ? (
            <Button onClick={onStart} className="w-full" size="sm">
              <Play className="h-4 w-4 mr-2" />
              Comenzar Novena
            </Button>
          ) : !progress.completada ? (
            <Button onClick={onContinue} className="w-full" size="sm">
              Continuar Día {progress.dia_actual}
            </Button>
          ) : (
            <Button onClick={onStart} variant="outline" className="w-full" size="sm">
              Repetir Novena
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
