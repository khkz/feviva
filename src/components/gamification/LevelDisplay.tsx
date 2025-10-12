import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, TrendingUp } from "lucide-react";

interface LevelDisplayProps {
  nivel: number;
  puntos_totales: number;
  puntosParaSiguienteNivel: number;
  progreso: number;
}

export const LevelDisplay = ({
  nivel,
  puntos_totales,
  puntosParaSiguienteNivel,
  progreso,
}: LevelDisplayProps) => {
  const getLevelColor = (level: number) => {
    if (level >= 10) return "text-purple-500";
    if (level >= 7) return "text-yellow-500";
    if (level >= 4) return "text-blue-500";
    return "text-green-500";
  };

  const getLevelBadge = (level: number) => {
    if (level >= 10) return "Maestro";
    if (level >= 7) return "Experto";
    if (level >= 4) return "Avanzado";
    return "Principiante";
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Tu Nivel
          </CardTitle>
          <Badge variant="secondary">{getLevelBadge(nivel)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`text-5xl font-bold ${getLevelColor(nivel)}`}>
              {nivel}
            </div>
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                {puntos_totales} puntos
              </div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-4 w-4" />
                {puntosParaSiguienteNivel - puntos_totales} para nivel {nivel + 1}
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Progress value={progreso} className="h-3" />
          <p className="text-xs text-muted-foreground text-right">
            {Math.round(progreso)}% hasta el siguiente nivel
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
