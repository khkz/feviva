import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, BookOpen, Flame, Target } from "lucide-react";

interface StatsOverviewProps {
  debates_completados: number;
  lecciones_completadas: number;
  racha_actual_dias: number;
  racha_maxima_dias: number;
}

export const StatsOverview = ({
  debates_completados,
  lecciones_completadas,
  racha_actual_dias,
  racha_maxima_dias,
}: StatsOverviewProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Debates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">{debates_completados}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Lecciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-secondary">{lecciones_completadas}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Flame className="h-4 w-4" />
            Racha Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-500">{racha_actual_dias}</div>
          <p className="text-xs text-muted-foreground mt-1">días consecutivos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Target className="h-4 w-4" />
            Racha Máxima
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-500">{racha_maxima_dias}</div>
          <p className="text-xs text-muted-foreground mt-1">récord personal</p>
        </CardContent>
      </Card>
    </div>
  );
};
