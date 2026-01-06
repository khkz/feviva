import { Trophy, Flame, Zap, Star, TrendingUp } from "lucide-react";
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
      className="px-5 py-3 lg:px-0"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.0 }}
    >
      {/* Mobile Layout */}
      <div className="lg:hidden relative overflow-hidden rounded-2xl bg-card border border-border/50 p-4">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl" />
        
        <div className="relative z-10 flex items-center gap-4">
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

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="font-semibold text-foreground text-sm">Nivel {nivel}</p>
                <p className="text-xs text-muted-foreground">{getLevelTitle(nivel)}</p>
              </div>
              
              <motion.div 
                className="flex items-center gap-1.5 bg-orange-500/10 rounded-full px-2.5 py-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.3 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Flame className="w-4 h-4 text-orange-500" />
                </motion.div>
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{racha}</span>
              </motion.div>
            </div>

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

      {/* Desktop Layout - Expanded */}
      <div className="hidden lg:block relative overflow-hidden rounded-2xl bg-card border border-border/50 p-6">
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.div 
                className="relative"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 1.2 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-secondary-hover flex items-center justify-center shadow-lg">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <motion.div 
                  className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center border-2 border-card"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10, delay: 1.4 }}
                >
                  {nivel}
                </motion.div>
              </motion.div>

              <div>
                <h3 className="font-heading text-xl font-bold text-foreground">Nivel {nivel}</h3>
                <p className="text-muted-foreground">{getLevelTitle(nivel)}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Streak */}
              <motion.div 
                className="flex items-center gap-2 bg-orange-500/10 rounded-xl px-4 py-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.3 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Flame className="w-6 h-6 text-orange-500" />
                </motion.div>
                <div>
                  <span className="text-xl font-bold text-orange-600 dark:text-orange-400">{racha}</span>
                  <p className="text-xs text-orange-600/70 dark:text-orange-400/70">días</p>
                </div>
              </motion.div>

              {/* Points */}
              <div className="flex items-center gap-2 bg-secondary/10 rounded-xl px-4 py-2">
                <Zap className="w-6 h-6 text-secondary" />
                <div>
                  <span className="text-xl font-bold text-foreground">{puntosTotales}</span>
                  <p className="text-xs text-muted-foreground">puntos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progreso al nivel {nivel + 1}</span>
              <span className="font-semibold text-foreground flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-secondary" />
                {Math.round(progreso)}%
              </span>
            </div>
            <div className="relative">
              <Progress value={progreso} className="h-3" />
              <motion.div 
                className="absolute -top-1 left-0"
                style={{ left: `${Math.min(progreso, 96)}%` }}
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Star className="w-5 h-5 text-secondary fill-secondary" />
              </motion.div>
            </div>
            <p className="text-sm text-muted-foreground">
              Te faltan <span className="font-semibold text-foreground">{Math.round(puntosParaSiguiente - puntosTotales)}</span> puntos para el siguiente nivel
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
