import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, CheckCircle2, Flame, Gift, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  type: "prayer" | "reading" | "gratitude" | "reflection";
}

const todayChallenges: Challenge[] = [
  {
    id: "1",
    title: "Oración matutina",
    description: "Completa la oración de Laudes",
    points: 15,
    completed: false,
    type: "prayer"
  },
  {
    id: "2",
    title: "Lectura bíblica",
    description: "Lee el evangelio del día",
    points: 20,
    completed: false,
    type: "reading"
  },
  {
    id: "3",
    title: "Gratitud diaria",
    description: "Escribe 3 cosas por las que agradecer",
    points: 10,
    completed: false,
    type: "gratitude"
  },
];

export function DailyChallenge() {
  const [challenges, setChallenges] = useState(todayChallenges);
  const [expanded, setExpanded] = useState(false);
  
  const completedCount = challenges.filter(c => c.completed).length;
  const totalPoints = challenges.reduce((acc, c) => acc + (c.completed ? c.points : 0), 0);
  const maxPoints = challenges.reduce((acc, c) => acc + c.points, 0);
  const progress = (completedCount / challenges.length) * 100;

  const toggleChallenge = (id: string) => {
    setChallenges(prev => 
      prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c)
    );
  };

  const getTypeColor = (type: Challenge["type"]) => {
    switch (type) {
      case "prayer": return "from-amber-500 to-orange-500";
      case "reading": return "from-blue-500 to-indigo-500";
      case "gratitude": return "from-emerald-500 to-teal-500";
      case "reflection": return "from-purple-500 to-pink-500";
    }
  };

  return (
    <motion.section 
      className="px-5 py-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
    >
      <motion.div 
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/80 p-5"
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
        
        {/* Header */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
              >
                <Target className="w-6 h-6 text-secondary" />
              </motion.div>
              <div>
                <h3 className="font-heading text-lg font-bold text-white">
                  Desafío Diario
                </h3>
                <p className="text-white/70 text-sm">
                  {completedCount}/{challenges.length} completados
                </p>
              </div>
            </div>
            
            <motion.div 
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5"
              animate={{ scale: totalPoints > 0 ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              <Gift className="w-4 h-4 text-secondary" />
              <span className="text-white font-semibold text-sm">{totalPoints}</span>
              <span className="text-white/60 text-xs">pts</span>
            </motion.div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-secondary to-secondary-hover rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Challenges list */}
          <AnimatePresence>
            {(expanded || completedCount < challenges.length) && (
              <motion.div 
                className="space-y-2"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                {challenges.slice(0, expanded ? challenges.length : 2).map((challenge, index) => (
                  <motion.button
                    key={challenge.id}
                    onClick={() => toggleChallenge(challenge.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                      challenge.completed 
                        ? "bg-white/20 backdrop-blur-sm" 
                        : "bg-white/10 backdrop-blur-sm hover:bg-white/15"
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div 
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getTypeColor(challenge.type)} flex items-center justify-center flex-shrink-0`}
                      animate={challenge.completed ? { scale: [1, 1.2, 1] } : {}}
                    >
                      {challenge.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-white/60" />
                      )}
                    </motion.div>
                    
                    <div className="flex-1 text-left">
                      <p className={`font-medium text-sm ${challenge.completed ? "text-white/60 line-through" : "text-white"}`}>
                        {challenge.title}
                      </p>
                      <p className="text-white/50 text-xs">{challenge.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-1 text-secondary">
                      <Flame className="w-3 h-3" />
                      <span className="text-xs font-semibold">+{challenge.points}</span>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* See all button */}
          {challenges.length > 2 && (
            <Button
              variant="ghost"
              onClick={() => setExpanded(!expanded)}
              className="w-full mt-3 text-white/70 hover:text-white hover:bg-white/10"
            >
              {expanded ? "Ver menos" : "Ver todos los desafíos"}
              <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${expanded ? "rotate-90" : ""}`} />
            </Button>
          )}
        </div>
      </motion.div>
    </motion.section>
  );
}