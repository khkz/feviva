import { Flame } from "lucide-react";
import { motion } from "framer-motion";

interface StreakBannerProps {
  streak: number;
}

export function StreakBanner({ streak }: StreakBannerProps) {
  const safeStreak = Math.max(0, streak || 0);
  const dayWord = safeStreak === 1 ? "día" : "días";

  const title =
    safeStreak === 0
      ? "Empieza tu racha hoy"
      : `No rompas tu racha de ${safeStreak} ${dayWord}`;

  const subtitle =
    safeStreak === 0
      ? "Completa una práctica hoy y enciende la primera llama."
      : "Una práctica más hoy y la llama sigue encendida.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-5 lg:px-0"
    >
      <div className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/15 via-primary/40 to-primary/60 p-4 flex items-center gap-4">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center flex-shrink-0"
        >
          <Flame className="w-7 h-7 text-orange-400" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-bold text-white text-base leading-tight">
            {title}
          </p>
          <p className="text-white/70 text-xs mt-1">{subtitle}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-3xl font-bold text-orange-400 leading-none">{safeStreak}</p>
          <p className="text-white/60 text-[10px] uppercase tracking-wider mt-1">{dayWord}</p>
        </div>
      </div>
    </motion.div>
  );
}
