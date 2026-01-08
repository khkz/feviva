import { motion } from "framer-motion";
import { Award, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface StreakMedal {
  practice: string;
  practiceLabel: string;
  practiceIcon: string;
  currentStreak: number;
  maxStreak: number;
  medals: {
    days: number;
    name: string;
    icon: string;
    unlocked: boolean;
    unlockedAt?: string;
  }[];
}

interface StreakMedalsProps {
  medals: StreakMedal[];
  totalUnlocked: number;
  totalMedals: number;
}

const medalTiers = {
  7: { color: "from-amber-600 to-amber-400", label: "Bronce", ringColor: "ring-amber-500" },
  21: { color: "from-gray-300 to-gray-100", label: "Plata", ringColor: "ring-gray-400" },
  40: { color: "from-yellow-400 to-yellow-200", label: "Oro", ringColor: "ring-yellow-500" },
};

export function StreakMedals({ medals, totalUnlocked, totalMedals }: StreakMedalsProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.button
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 hover:border-amber-500/50 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
            {totalUnlocked}/{totalMedals}
          </span>
        </motion.button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Medallas de Rachas Espirituales
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Summary */}
          <div className="flex items-center justify-center gap-6 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {totalUnlocked}
              </div>
              <div className="text-xs text-muted-foreground">Desbloqueadas</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-center">
              <div className="text-3xl font-bold text-muted-foreground">
                {totalMedals - totalUnlocked}
              </div>
              <div className="text-xs text-muted-foreground">Por conseguir</div>
            </div>
          </div>

          {/* Medals by practice */}
          {medals.map((practice, idx) => (
            <motion.div
              key={practice.practice}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{practice.practiceIcon}</span>
                <span className="font-medium text-foreground">{practice.practiceLabel}</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  Racha actual: {practice.currentStreak} días
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {practice.medals.map((medal, medalIdx) => {
                  const tier = medalTiers[medal.days as keyof typeof medalTiers];
                  
                  return (
                    <motion.div
                      key={medal.days}
                      className={`relative flex flex-col items-center p-3 rounded-xl border transition-all ${
                        medal.unlocked
                          ? `bg-gradient-to-br ${tier.color} border-transparent ring-2 ${tier.ringColor}`
                          : "bg-muted/30 border-border/50"
                      }`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: idx * 0.1 + medalIdx * 0.05 }}
                      whileHover={{ scale: medal.unlocked ? 1.05 : 1 }}
                    >
                      {/* Lock overlay for locked medals */}
                      {!medal.unlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl">
                          <Lock className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}

                      <span className={`text-2xl mb-1 ${!medal.unlocked && "opacity-30"}`}>
                        {medal.icon}
                      </span>
                      
                      <span className={`text-[10px] font-bold ${
                        medal.unlocked 
                          ? "text-foreground" 
                          : "text-muted-foreground"
                      }`}>
                        {medal.days} DÍAS
                      </span>
                      
                      <span className={`text-[9px] mt-0.5 text-center leading-tight ${
                        medal.unlocked 
                          ? "text-foreground/80" 
                          : "text-muted-foreground/60"
                      }`}>
                        {medal.name}
                      </span>

                      {/* Progress indicator for locked medals */}
                      {!medal.unlocked && practice.maxStreak > 0 && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-background border border-border rounded-full">
                          <span className="text-[8px] text-muted-foreground">
                            {Math.min(practice.maxStreak, medal.days)}/{medal.days}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-border/50">
            {Object.entries(medalTiers).map(([days, tier]) => (
              <div key={days} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${tier.color}`} />
                <span className="text-[10px] text-muted-foreground">
                  {tier.label} ({days}d)
                </span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
