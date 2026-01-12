import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Lock, Flame, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  caminoPhases, 
  getCurrentPhase, 
  getPhaseProgress, 
  getDaysToNextPhase,
  type CaminoPhase 
} from "@/lib/caminoDelLeonData";

interface CaminoDelLeonCardProps {
  streakDays: number;
}

export function CaminoDelLeonCard({ streakDays }: CaminoDelLeonCardProps) {
  const navigate = useNavigate();
  const currentPhase = getCurrentPhase(streakDays);
  const progress = getPhaseProgress(streakDays, currentPhase);
  const daysToNext = getDaysToNextPhase(streakDays, currentPhase);

  const isPhaseUnlocked = (phase: CaminoPhase) => 
    streakDays >= phase.unlockRequirement.value;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="px-5 lg:px-0 mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🦁</span>
          <h2 className="font-heading text-xl lg:text-2xl font-bold text-foreground">
            El Camino del León
          </h2>
        </div>
        <Badge variant="outline" className="gap-1.5 border-primary/30">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span className="font-semibold">{streakDays} días</span>
        </Badge>
      </div>

      {/* Current Phase Card */}
      <Card className={`relative overflow-hidden p-5 mb-4 bg-gradient-to-br ${currentPhase.bgGradient} border-primary/20`}>
        <div className="flex items-start gap-4">
          <motion.div 
            className={`w-14 h-14 rounded-2xl bg-background/80 flex items-center justify-center ${currentPhase.color}`}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <currentPhase.icon className="w-7 h-7" />
          </motion.div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold uppercase tracking-wider ${currentPhase.color}`}>
                Fase {currentPhase.id}
              </span>
              <Badge className="bg-primary/20 text-primary text-xs">Actual</Badge>
            </div>
            <h3 className="font-heading text-xl font-bold text-foreground mb-1">
              {currentPhase.name}
            </h3>
            <p className="text-muted-foreground text-sm italic">
              {currentPhase.subtitle}
            </p>
          </div>
        </div>

        {/* Progress to next phase */}
        {daysToNext !== null && (
          <div className="mt-4 pt-4 border-t border-border/30">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">Progreso a siguiente fase</span>
              <span className="font-semibold text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {daysToNext} días más para desbloquear <strong>{caminoPhases[currentPhase.id]?.name}</strong>
            </p>
          </div>
        )}

        {/* Quick Actions for Current Phase */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {currentPhase.features.slice(0, 2).map((feature) => (
            <motion.button
              key={feature.path}
              onClick={() => navigate(feature.path)}
              className="flex items-center gap-2 p-3 rounded-xl bg-background/60 hover:bg-background/80 transition-colors text-left"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-sm font-medium text-foreground">{feature.name}</span>
              <ArrowRight className="w-4 h-4 text-primary ml-auto" />
            </motion.button>
          ))}
        </div>
      </Card>

      {/* Phase Timeline */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
        {caminoPhases.map((phase, index) => {
          const unlocked = isPhaseUnlocked(phase);
          const isCurrent = phase.id === currentPhase.id;
          const PhaseIcon = phase.icon;
          
          return (
            <motion.button
              key={phase.id}
              onClick={() => unlocked && navigate(phase.features[0].path)}
              disabled={!unlocked}
              className={`relative flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isCurrent 
                  ? `bg-gradient-to-br ${phase.bgGradient} border border-primary/30` 
                  : unlocked 
                    ? 'hover:bg-muted/50' 
                    : 'opacity-40'
              }`}
              whileHover={unlocked ? { scale: 1.05 } : undefined}
              whileTap={unlocked ? { scale: 0.95 } : undefined}
            >
              <div className={`relative w-10 h-10 rounded-xl ${unlocked ? phase.bgGradient : 'bg-muted'} flex items-center justify-center`}>
                {unlocked ? (
                  <PhaseIcon className={`w-5 h-5 ${phase.color}`} />
                ) : (
                  <Lock className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <span className={`text-[10px] font-semibold ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                {phase.name}
              </span>
              
              {/* Connector line */}
              {index < caminoPhases.length - 1 && (
                <div className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-1 h-1 rounded-full ${
                  isPhaseUnlocked(caminoPhases[index + 1]) ? 'bg-primary' : 'bg-muted-foreground/30'
                }`} />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
}
