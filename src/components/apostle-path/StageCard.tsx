import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Lock, ChevronRight, Sparkles } from 'lucide-react';
import { Stage, StageRequirement } from '@/hooks/useApostlePath';
import { cn } from '@/lib/utils';

interface StageCardProps {
  stage: Stage;
  isUnlocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  progress: number;
  completedActivities: string[];
  onContinue: () => void;
  onActivityClick: (requirement: StageRequirement) => void;
}

export const StageCard = ({
  stage,
  isUnlocked,
  isCompleted,
  isCurrent,
  progress,
  completedActivities,
  onContinue,
  onActivityClick,
}: StageCardProps) => {
  const isActivityDone = (req: StageRequirement) => {
    const activityId = req.id || req.titulo.toLowerCase().replace(/\s+/g, '-');
    return completedActivities.includes(activityId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={cn(
        'relative overflow-hidden transition-all',
        isCurrent && 'ring-2 ring-primary shadow-lg',
        !isUnlocked && 'opacity-60'
      )}>
        {/* Gradient header */}
        <div className={cn(
          'h-2 w-full',
          isUnlocked ? `bg-gradient-to-r ${stage.color}` : 'bg-muted'
        )} />

        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{stage.icono}</span>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {stage.nombre}
                  {isCompleted && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Completado
                    </Badge>
                  )}
                  {isCurrent && !isCompleted && (
                    <Badge className="animate-pulse">
                      <Sparkles className="w-3 h-3 mr-1" />
                      En progreso
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{stage.subtitulo}</p>
              </div>
            </div>
            {!isUnlocked && <Lock className="w-5 h-5 text-muted-foreground" />}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{stage.descripcion}</p>

          {isUnlocked && (
            <>
              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progreso</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Requirements list */}
              <div className="space-y-2">
                {stage.requisitos.map((req, index) => {
                  const done = isActivityDone(req);
                  return (
                    <button
                      key={index}
                      onClick={() => !done && onActivityClick(req)}
                      disabled={done || isCompleted}
                      className={cn(
                        'w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors',
                        done 
                          ? 'bg-green-50 dark:bg-green-950/30' 
                          : 'hover:bg-muted/50 cursor-pointer',
                        (isCompleted || done) && 'cursor-default'
                      )}
                    >
                      {done ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm font-medium truncate',
                          done && 'line-through text-muted-foreground'
                        )}>
                          {req.titulo}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {req.descripcion}
                        </p>
                      </div>
                      {!done && !isCompleted && (
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Reward info */}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">
                  Recompensa: <span className="font-medium text-primary">+{stage.recompensa_puntos} pts</span>
                </span>
                {isCurrent && !isCompleted && (
                  <Button size="sm" onClick={onContinue}>
                    Continuar
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </>
          )}

          {!isUnlocked && (
            <p className="text-sm text-muted-foreground italic">
              Completa la etapa anterior para desbloquear
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
