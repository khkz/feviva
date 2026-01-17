import { Shield, Sword, Crown, Trophy, Star, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface DefenderRank {
  title: string;
  icon: LucideIcon;
  color: string;
  glowColor: string;
}

export const getDefenderRank = (nivel: number): DefenderRank => {
  if (nivel <= 2) {
    return { 
      title: "Escudero de la Fe", 
      icon: Shield,
      color: "from-slate-400 to-slate-500",
      glowColor: "hsla(215, 15%, 50%, 0.4)"
    };
  }
  if (nivel <= 5) {
    return { 
      title: "Soldado de Cristo", 
      icon: Sword,
      color: "from-amber-500 to-orange-600",
      glowColor: "hsla(38, 92%, 50%, 0.4)"
    };
  }
  if (nivel <= 10) {
    return { 
      title: "Caballero Defensor", 
      icon: Crown,
      color: "from-rugido-gold to-rugido-fire",
      glowColor: "hsla(45, 95%, 58%, 0.5)"
    };
  }
  if (nivel <= 20) {
    return { 
      title: "Paladín Apologista", 
      icon: Trophy,
      color: "from-purple-500 to-pink-600",
      glowColor: "hsla(270, 60%, 50%, 0.4)"
    };
  }
  return { 
    title: "Campeón de la Verdad", 
    icon: Star,
    color: "from-rugido-gold via-white to-rugido-gold",
    glowColor: "hsla(45, 95%, 70%, 0.6)"
  };
};

interface DefenderLevelBadgeProps {
  nivel: number;
  size?: "sm" | "md" | "lg";
  showTitle?: boolean;
  animate?: boolean;
}

export function DefenderLevelBadge({ 
  nivel, 
  size = "md", 
  showTitle = true,
  animate = true 
}: DefenderLevelBadgeProps) {
  const rank = getDefenderRank(nivel);
  const RankIcon = rank.icon;

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-10 h-10",
  };

  const badgeSizes = {
    sm: "w-5 h-5 text-[10px]",
    md: "w-7 h-7 text-xs",
    lg: "w-9 h-9 text-sm",
  };

  return (
    <div className="flex items-center gap-3">
      <motion.div 
        className="relative flex-shrink-0"
        initial={animate ? { scale: 0, rotate: -180 } : undefined}
        animate={animate ? { scale: 1, rotate: 0 } : undefined}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
      >
        {/* Glow effect */}
        <motion.div 
          className={`absolute inset-0 ${sizeClasses[size]} rounded-2xl blur-lg`}
          style={{ background: rank.glowColor }}
          animate={animate ? { 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          } : undefined}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Main badge */}
        <div className={`relative ${sizeClasses[size]} rounded-2xl bg-gradient-to-br ${rank.color} flex items-center justify-center shadow-lg`}>
          <RankIcon className={`${iconSizes[size]} text-rugido-dark`} />
          
          {/* Sparkle effects for high levels */}
          {nivel > 10 && animate && (
            <>
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ 
                  rotate: [0, 180, 360],
                  scale: [0.8, 1, 0.8]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-3 h-3 text-white" />
              </motion.div>
            </>
          )}
        </div>
        
        {/* Level number badge */}
        <motion.div 
          className={`absolute -bottom-1 -right-1 bg-rugido-dark text-rugido-gold font-bold rounded-full ${badgeSizes[size]} flex items-center justify-center border-2 border-rugido-gold/50`}
          initial={animate ? { scale: 0 } : undefined}
          animate={animate ? { scale: 1 } : undefined}
          transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.4 }}
        >
          {nivel}
        </motion.div>
      </motion.div>

      {showTitle && (
        <div>
          <p className="font-heading text-lg font-bold text-foreground">Rango {nivel}</p>
          <p className="text-sm text-rugido-gold font-medium">{rank.title}</p>
        </div>
      )}
    </div>
  );
}
