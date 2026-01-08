import { Flame, Trophy, CheckCircle2, Circle } from "lucide-react";
import { motion } from "framer-motion";
import { usePracticeStreaks } from "@/hooks/usePracticeStreaks";
import { Skeleton } from "@/components/ui/skeleton";

export function PracticeStreaksCard() {
  const { streaks, loading } = usePracticeStreaks();

  if (loading) {
    return (
      <section className="px-5 py-3 lg:px-0">
        <div className="rounded-2xl bg-card border border-border/50 p-4">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="grid grid-cols-5 gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      className="px-5 py-3 lg:px-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-4">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-foreground">Rachas de Prácticas</h3>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {streaks.map((streak, index) => (
              <motion.div
                key={streak.practice}
                className={`relative flex flex-col items-center p-2 rounded-xl transition-colors ${
                  streak.todayCompleted 
                    ? "bg-green-500/10 border border-green-500/30" 
                    : "bg-muted/30 border border-border/30"
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {/* Completion indicator */}
                <div className="absolute -top-1 -right-1">
                  {streak.todayCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground/40" />
                  )}
                </div>

                {/* Icon */}
                <span className="text-xl mb-1">{streak.icon}</span>

                {/* Streak count */}
                <div className="flex items-center gap-0.5">
                  {streak.currentStreak > 0 && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <Flame className="w-3 h-3 text-orange-500" />
                    </motion.div>
                  )}
                  <span className={`text-sm font-bold ${
                    streak.currentStreak > 0 ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground"
                  }`}>
                    {streak.currentStreak}
                  </span>
                </div>

                {/* Label */}
                <span className="text-[10px] text-muted-foreground text-center leading-tight mt-0.5">
                  {streak.label}
                </span>

                {/* Max streak badge */}
                {streak.maxStreak >= 7 && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-amber-500/20 rounded-full px-1.5 py-0.5">
                    <Trophy className="w-2.5 h-2.5 text-amber-500" />
                    <span className="text-[8px] text-amber-600 dark:text-amber-400 font-medium">
                      {streak.maxStreak}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {streaks.filter(s => s.todayCompleted).length}/{streaks.length} completadas hoy
            </span>
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500" />
              {streaks.filter(s => s.currentStreak > 0).length} rachas activas
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
