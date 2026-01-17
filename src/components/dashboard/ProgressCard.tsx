import { Flame, Zap, Star, TrendingUp, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { DefenderLevelBadge, getDefenderRank } from "./DefenderLevelBadge";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const currentRank = getDefenderRank(nivel);
  const nextRank = getDefenderRank(nivel + 1);

  return (
    <motion.section 
      className="px-5 py-3 lg:px-0"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
    >
      {/* Mobile Layout */}
      <motion.div 
        className="lg:hidden relative overflow-hidden rounded-2xl bg-rugido-dark border border-rugido-gold/30 p-4 cursor-pointer"
        onClick={() => navigate('/gamification')}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Background glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rugido-gold/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-rugido-fire/10 rounded-full blur-2xl" />
        
        <div className="relative z-10 flex items-center gap-4">
          <DefenderLevelBadge nivel={nivel} size="sm" showTitle={false} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="font-heading font-bold text-white text-sm">Rango {nivel}</p>
                <p className="text-xs text-rugido-gold">{currentRank.title}</p>
              </div>
              
              <motion.div 
                className="flex items-center gap-1.5 bg-rugido-fire/20 border border-rugido-fire/30 rounded-full px-2.5 py-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Flame className="w-4 h-4 text-rugido-fire" />
                </motion.div>
                <span className="text-sm font-bold text-rugido-fire">{racha}</span>
              </motion.div>
            </div>

            <motion.div 
              className="space-y-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="relative">
                <div className="h-2.5 bg-rugido-dark rounded-full overflow-hidden border border-rugido-gold/20">
                  <motion.div 
                    className="h-full progress-fire rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progreso}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <motion.div 
                  className="absolute -top-1 left-0"
                  style={{ left: `${Math.min(progreso, 95)}%` }}
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Star className="w-4 h-4 text-rugido-gold fill-rugido-gold" />
                </motion.div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-rugido-gold">
                  <Zap className="w-3 h-3" />
                  {puntosTotales} XP
                </span>
                <span className="text-white/60">{Math.round(puntosParaSiguiente - puntosTotales)} para rango {nivel + 1}</span>
              </div>
            </motion.div>
          </div>

          <ChevronRight className="w-5 h-5 text-rugido-gold/50" />
        </div>
      </motion.div>

      {/* Desktop Layout - Expanded */}
      <motion.div 
        className="hidden lg:block relative overflow-hidden rounded-2xl bg-rugido-dark border border-rugido-gold/30 p-6 cursor-pointer"
        onClick={() => navigate('/gamification')}
        whileHover={{ scale: 1.01, borderColor: "hsla(45, 95%, 58%, 0.5)" }}
      >
        {/* Background effects */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-rugido-gold/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-rugido-fire/10 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <DefenderLevelBadge nivel={nivel} size="md" showTitle={true} />

            <div className="flex items-center gap-6">
              {/* Días en Guardia */}
              <motion.div 
                className="flex items-center gap-2 bg-rugido-fire/20 border border-rugido-fire/30 rounded-xl px-4 py-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Flame className="w-6 h-6 text-rugido-fire" />
                </motion.div>
                <div>
                  <span className="text-xl font-bold text-rugido-fire">{racha}</span>
                  <p className="text-xs text-rugido-fire/70">días en guardia</p>
                </div>
              </motion.div>

              {/* XP Defensor */}
              <div className="flex items-center gap-2 bg-rugido-gold/20 border border-rugido-gold/30 rounded-xl px-4 py-2">
                <Zap className="w-6 h-6 text-rugido-gold" />
                <div>
                  <span className="text-xl font-bold text-white">{puntosTotales}</span>
                  <p className="text-xs text-rugido-gold/70">XP defensor</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress to next rank */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">Progreso a <span className="text-rugido-gold font-semibold">{nextRank.title}</span></span>
              <span className="font-semibold text-white flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-rugido-gold" />
                {Math.round(progreso)}%
              </span>
            </div>
            <div className="relative">
              <div className="h-3 bg-rugido-dark rounded-full overflow-hidden border border-rugido-gold/20">
                <motion.div 
                  className="h-full progress-fire rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progreso}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
              <motion.div 
                className="absolute -top-1 left-0"
                style={{ left: `${Math.min(progreso, 96)}%` }}
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Star className="w-5 h-5 text-rugido-gold fill-rugido-gold" />
              </motion.div>
            </div>
            <p className="text-sm text-white/60">
              Te faltan <span className="font-semibold text-rugido-gold">{Math.round(puntosParaSiguiente - puntosTotales)} XP</span> para alcanzar el siguiente rango
            </p>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
