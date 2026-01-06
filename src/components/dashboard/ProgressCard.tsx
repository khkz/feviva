import { Trophy, Flame, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

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
    <motion.section 
      className="px-5 py-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.0 }}
    >
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          {/* Level Badge */}
          <div className="flex items-center gap-3">
            <motion.div 
              className="relative"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 1.2 }}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-secondary-hover flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary-foreground" />
              </div>
              <motion.div 
                className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10, delay: 1.4 }}
              >
                {nivel}
              </motion.div>
            </motion.div>
            <div>
              <p className="text-sm font-semibold text-foreground">Nivel {nivel}</p>
              <p className="text-xs text-muted-foreground">Defensor de la Fe</p>
            </div>
          </div>

          {/* Streak */}
          <motion.div 
            className="flex items-center gap-2 glass-button rounded-full px-3 py-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.3 }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                repeatDelay: 2
              }}
            >
              <Flame className="w-4 h-4 text-orange-500" />
            </motion.div>
            <span className="text-sm font-semibold text-foreground">{racha}</span>
            <span className="text-xs text-muted-foreground">días</span>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
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
        </motion.div>
      </div>
    </motion.section>
  );
}
