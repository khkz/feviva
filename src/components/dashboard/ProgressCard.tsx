import { Trophy, Flame, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProgressCardProps {
  nivel: number;
  puntosTotales: number;
  puntosParaSiguiente: number;
  progreso: number;
  racha: number;
}

export function ProgressCard({ 
  nivel, 
  puntosTotales, 
  puntosParaSiguiente, 
  progreso,
  racha 
}: ProgressCardProps) {
  return (
    <section className="px-5 py-4">
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          {/* Level Badge */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-secondary-hover flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {nivel}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Nivel {nivel}</p>
              <p className="text-xs text-muted-foreground">Defensor de la Fe</p>
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-2 glass-button rounded-full px-3 py-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-semibold text-foreground">{racha}</span>
            <span className="text-xs text-muted-foreground">días</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3 text-secondary" />
              {puntosTotales} pts
            </span>
            <span className="text-muted-foreground">{puntosParaSiguiente} pts</span>
          </div>
          <Progress value={progreso} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            {Math.round(puntosParaSiguiente - puntosTotales)} pts para nivel {nivel + 1}
          </p>
        </div>
      </div>
    </section>
  );
}
