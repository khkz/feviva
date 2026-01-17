import { Swords, Users, ChevronRight, Shield, Flame, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const battleTopics = [
  {
    tema: "¿Por qué los católicos rezan a María?",
    dificultad: "Intermedio",
    defensoresActivos: 24,
    victorias: 78,
  },
  {
    tema: "La autoridad del Papa en la Iglesia",
    dificultad: "Avanzado",
    defensoresActivos: 15,
    victorias: 65,
  },
  {
    tema: "Sola Scriptura vs Tradición",
    dificultad: "Intermedio",
    defensoresActivos: 32,
    victorias: 82,
  },
  {
    tema: "Los Santos y la intercesión",
    dificultad: "Principiante",
    defensoresActivos: 41,
    victorias: 91,
  },
];

export function NextBattleCard() {
  const navigate = useNavigate();
  
  // Seleccionar tema del día basado en la fecha
  const todayIndex = new Date().getDate() % battleTopics.length;
  const battle = battleTopics[todayIndex];

  const getDifficultyColor = (dificultad: string) => {
    switch (dificultad) {
      case "Principiante":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "Intermedio":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "Avanzado":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-secondary/20 text-secondary border-secondary/30";
    }
  };

  return (
    <motion.section 
      className="px-5 py-4 lg:px-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <motion.div 
        className="relative overflow-hidden rounded-2xl border border-rugido-gold/30 cursor-pointer group"
        onClick={() => navigate('/coach')}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Background with battle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-rugido-dark via-rugido-blood/80 to-rugido-dark" />
        
        {/* Animated fire particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-rugido-gold/60"
              style={{
                left: `${15 + i * 15}%`,
                bottom: "10%",
              }}
              animate={{
                y: [-10, -60, -10],
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            />
          ))}
        </div>

        {/* Pulse effect */}
        <motion.div
          className="absolute inset-0 bg-rugido-gold/5"
          animate={{
            opacity: [0, 0.1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />

        <div className="relative z-10 p-5 lg:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-rugido-gold to-rugido-fire flex items-center justify-center shadow-lg glow-lion"
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Swords className="w-6 h-6 text-rugido-dark" />
              </motion.div>
              <div>
                <p className="text-rugido-gold/80 text-xs font-semibold uppercase tracking-wider">
                  Próxima Batalla
                </p>
                <h3 className="font-heading text-lg lg:text-xl font-bold text-white">
                  Debate del Día
                </h3>
              </div>
            </div>
            
            <Badge 
              variant="outline" 
              className={`${getDifficultyColor(battle.dificultad)} border font-semibold`}
            >
              <Target className="w-3 h-3 mr-1" />
              {battle.dificultad}
            </Badge>
          </div>

          {/* Battle Topic */}
          <div className="mb-4">
            <h4 className="font-heading text-xl lg:text-2xl font-bold text-white leading-tight">
              {battle.tema}
            </h4>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 mb-5">
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
              <Users className="w-4 h-4 text-rugido-gold" />
              <span className="text-sm text-white/90 font-medium">
                {battle.defensoresActivos} defensores activos
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-white/90 font-medium">
                {battle.victorias}% victorias
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <Button 
            className="w-full bg-gradient-to-r from-rugido-gold to-rugido-fire text-rugido-dark font-bold hover:from-rugido-fire hover:to-rugido-gold group-hover:shadow-lg transition-all"
            size="lg"
          >
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ x: 3 }}
            >
              <Flame className="w-5 h-5" />
              <span>Entrar en Batalla</span>
              <ChevronRight className="w-5 h-5" />
            </motion.div>
          </Button>
        </div>

        {/* Bottom accent line */}
        <motion.div 
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-rugido-gold via-rugido-fire to-rugido-gold"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </motion.div>
    </motion.section>
  );
}
