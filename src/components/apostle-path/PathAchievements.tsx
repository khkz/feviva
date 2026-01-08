import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Lock } from 'lucide-react';
import { Stage } from '@/hooks/useApostlePath';
import { cn } from '@/lib/utils';

interface PathAchievementsProps {
  stages: Stage[];
  isStageCompleted: (etapa: number) => boolean;
}

export const PathAchievements = ({ stages, isStageCompleted }: PathAchievementsProps) => {
  const completedCount = stages.filter(s => isStageCompleted(s.numero)).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Logros de la Ruta
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            {completedCount}/{stages.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2">
          {stages.map((stage, index) => {
            const completed = isStageCompleted(stage.numero);
            return (
              <motion.div
                key={stage.numero}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, type: 'spring' }}
                className={cn(
                  'relative aspect-square rounded-full flex items-center justify-center text-2xl',
                  'border-2 transition-all',
                  completed
                    ? `bg-gradient-to-br ${stage.color} border-transparent shadow-lg`
                    : 'bg-muted border-muted-foreground/20'
                )}
                title={completed ? `${stage.nombre} - ¡Desbloqueado!` : `${stage.nombre} - Bloqueado`}
              >
                {completed ? (
                  <span>{stage.icono}</span>
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground/50" />
                )}
                
                {/* Shine effect for completed */}
                {completed && (
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {stages.map((stage) => {
            const completed = isStageCompleted(stage.numero);
            return (
              <span
                key={stage.numero}
                className={cn(
                  'text-xs px-2 py-1 rounded-full',
                  completed
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {stage.icono} {stage.nombre}
              </span>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
