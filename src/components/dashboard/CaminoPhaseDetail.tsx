import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { caminoPhases, type CaminoPhase } from "@/lib/caminoDelLeonData";

interface CaminoPhaseDetailProps {
  streakDays: number;
}

export function CaminoPhaseDetail({ streakDays }: CaminoPhaseDetailProps) {
  const navigate = useNavigate();

  const isPhaseUnlocked = (phase: CaminoPhase) => 
    streakDays >= phase.unlockRequirement.value;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="px-5 lg:px-0"
    >
      <div className="space-y-4">
        {caminoPhases.map((phase, index) => {
          const unlocked = isPhaseUnlocked(phase);
          const PhaseIcon = phase.icon;
          
          return (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative overflow-hidden ${
                unlocked 
                  ? `bg-gradient-to-r ${phase.bgGradient} border-primary/20` 
                  : 'bg-muted/30 border-muted'
              }`}>
                <div className="p-4">
                  {/* Phase Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl ${
                      unlocked ? `bg-gradient-to-br ${phase.bgGradient}` : 'bg-muted'
                    } flex items-center justify-center flex-shrink-0`}>
                      {unlocked ? (
                        <PhaseIcon className={`w-6 h-6 ${phase.color}`} />
                      ) : (
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${
                          unlocked ? phase.color : 'text-muted-foreground'
                        }`}>
                          Fase {phase.id}
                        </span>
                        {!unlocked && (
                          <Badge variant="secondary" className="text-xs">
                            {phase.unlockRequirement.value} días
                          </Badge>
                        )}
                      </div>
                      <h3 className={`font-heading text-lg font-bold ${
                        unlocked ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {phase.name}
                      </h3>
                      <p className={`text-sm ${unlocked ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
                        {phase.description}
                      </p>
                    </div>
                  </div>

                  {/* Features Grid */}
                  {unlocked && (
                    <div className="grid grid-cols-2 gap-2">
                      {phase.features.map((feature) => (
                        <motion.button
                          key={feature.path}
                          onClick={() => navigate(feature.path)}
                          className="flex items-center justify-between p-3 rounded-xl bg-background/60 hover:bg-background/80 transition-colors text-left group"
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div>
                            <span className="text-sm font-medium text-foreground block">
                              {feature.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {feature.description}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
