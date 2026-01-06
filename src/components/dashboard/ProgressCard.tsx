import { Trophy, Flame, Zap, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface ProgressCardProps {
  nivel: number;
  puntosTotales: number;
  puntosParaSiguiente: number;
  progreso: number;
  racha: number;
}

const getLevelTitle = (nivel: number) => {
  if (nivel <= 2) return "Discípulo";
  if (nivel <= 5) return "Aprendiz de Fe";
  if (nivel <= 10) return "Defensor";
  if (nivel <= 20) return "Apologista";
  return "Maestro de la Fe";
};

export function ProgressCard({ 
  nivel, 
  puntosTotales, 
  puntosParaSiguiente, 
  progreso,
  racha 
}: ProgressCardProps) {
  return (
    <motion.section 
      className="px-5 py-3"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.0 }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-4">
        {/* Decorative background */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl" />
        
        <div className="relative z-10 flex items-center gap-4">
          {/* Level Badge - Compact */}
          <motion.div 
            className="relative flex-shrink-0"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring" as const, stiffness: 200, damping: 15, delay: 1.2 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-secondary-hover flex items-center justify-center shadow-lg">
              <Trophy className="w-7 h-7 text-primary" />
            </div>
            <motion.div 
              className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-card"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 10, delay: 1.4 }}
            >
              {nivel}
            </motion.div>
          </motion.div>

          {/* Progress Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="font-semibold text-foreground text-sm">Nivel {nivel}</p>
                <p className="text-xs text-muted-foreground">{getLevelTitle(nivel)}</p>
              </div>
              
              {/* Streak Badge */}
              <motion.div 
                className="flex items-center gap-1.5 bg-orange-500/10 rounded-full px-2.5 py-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.3 }}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1],
                  }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  <Flame className="w-4 h-4 text-orange-500" />
                </motion.div>
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{racha}</span>
              </motion.div>
            </div>

            {/* Progress Bar */}
            <motion.div 
              className="space-y-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.5 }}
            >
              <div className="relative">
                <Progress value={progreso} className="h-2.5" />
                <motion.div 
                  className="absolute -top-1 left-0"
                  style={{ left: `${Math.min(progreso, 95)}%` }}
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Star className="w-4 h-4 text-secondary fill-secondary" />
                </motion.div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-secondary" />
                  {puntosTotales} pts
                </span>
                <span>{Math.round(puntosParaSiguiente - puntosTotales)} para nivel {nivel + 1}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}