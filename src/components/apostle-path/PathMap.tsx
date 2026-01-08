import { motion } from 'framer-motion';
import { Lock, CheckCircle2, Play } from 'lucide-react';
import { Stage } from '@/hooks/useApostlePath';
import { cn } from '@/lib/utils';

interface PathMapProps {
  stages: Stage[];
  currentStage: number;
  isStageCompleted: (etapa: number) => boolean;
  isStageUnlocked: (etapa: number) => boolean;
  getStageProgress: (etapa: number) => number;
  onStageClick: (stage: Stage) => void;
}

export const PathMap = ({
  stages,
  currentStage,
  isStageCompleted,
  isStageUnlocked,
  getStageProgress,
  onStageClick,
}: PathMapProps) => {
  return (
    <div className="relative py-8">
      {/* Connection line */}
      <div className="absolute top-1/2 left-0 right-0 h-2 bg-muted rounded-full -translate-y-1/2 hidden md:block" />
      
      {/* Mobile vertical line */}
      <div className="absolute top-0 bottom-0 left-8 w-2 bg-muted rounded-full md:hidden" />

      <div className="relative flex flex-col md:flex-row md:justify-between gap-6 md:gap-4">
        {stages.map((stage, index) => {
          const completed = isStageCompleted(stage.numero);
          const unlocked = isStageUnlocked(stage.numero);
          const isCurrent = stage.numero === currentStage;
          const progress = getStageProgress(stage.numero);

          return (
            <motion.div
              key={stage.numero}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex md:flex-col items-center gap-4 md:gap-2"
            >
              {/* Progress fill for connection (desktop) */}
              {index > 0 && (
                <div
                  className="absolute top-1/2 right-full h-2 bg-primary rounded-full -translate-y-1/2 hidden md:block"
                  style={{
                    width: isStageUnlocked(stage.numero) ? '100%' : '0%',
                    marginRight: '-2px',
                  }}
                />
              )}

              {/* Stage node */}
              <motion.button
                onClick={() => unlocked && onStageClick(stage)}
                disabled={!unlocked}
                whileHover={unlocked ? { scale: 1.1 } : {}}
                whileTap={unlocked ? { scale: 0.95 } : {}}
                className={cn(
                  'relative z-10 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-2xl md:text-3xl shadow-lg transition-all',
                  completed && 'bg-gradient-to-br ring-4 ring-primary/30',
                  isCurrent && !completed && 'bg-gradient-to-br ring-4 ring-primary animate-pulse',
                  !unlocked && 'bg-muted text-muted-foreground cursor-not-allowed',
                  unlocked && !completed && !isCurrent && 'bg-card border-2 border-primary/50 hover:border-primary',
                  stage.color && (completed || isCurrent) && `bg-gradient-to-br ${stage.color}`
                )}
              >
                {!unlocked ? (
                  <Lock className="w-6 h-6 text-muted-foreground" />
                ) : completed ? (
                  <span className="relative">
                    {stage.icono}
                    <CheckCircle2 className="absolute -bottom-1 -right-1 w-5 h-5 text-white bg-green-500 rounded-full" />
                  </span>
                ) : isCurrent ? (
                  <span className="relative">
                    {stage.icono}
                    <Play className="absolute -bottom-1 -right-1 w-4 h-4 text-white fill-white" />
                  </span>
                ) : (
                  stage.icono
                )}

                {/* Progress ring */}
                {unlocked && !completed && progress > 0 && (
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="3"
                      strokeDasharray={`${progress * 2.83} 283`}
                      className="opacity-50"
                    />
                  </svg>
                )}
              </motion.button>

              {/* Stage info */}
              <div className="flex-1 md:text-center">
                <p className={cn(
                  'font-semibold text-sm',
                  isCurrent && 'text-primary',
                  !unlocked && 'text-muted-foreground'
                )}>
                  {stage.nombre}
                </p>
                <p className="text-xs text-muted-foreground hidden md:block">
                  {stage.subtitulo}
                </p>
                {unlocked && !completed && (
                  <p className="text-xs text-primary font-medium">
                    {progress}%
                  </p>
                )}
                {completed && (
                  <p className="text-xs text-green-500 font-medium">
                    ✓ Completado
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
