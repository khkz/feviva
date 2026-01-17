import { BookOpen, MessageSquare, GraduationCap, Star, Search } from "lucide-react";
import { motion } from "framer-motion";

interface PreparationBadgeProps {
  level: number;
  size?: "sm" | "md" | "lg";
  showTitle?: boolean;
}

const getRankData = (level: number) => {
  if (level <= 2) return { 
    title: "El Curioso", 
    description: "Comenzando a explorar",
    icon: Search, 
    color: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-500/20",
    textColor: "text-blue-400"
  };
  if (level <= 5) return { 
    title: "El Estudiante", 
    description: "Aprendiendo fundamentos",
    icon: BookOpen, 
    color: "from-emerald-400 to-emerald-600",
    bgColor: "bg-emerald-500/20",
    textColor: "text-emerald-400"
  };
  if (level <= 10) return { 
    title: "El Practicante", 
    description: "Practicando el diálogo",
    icon: MessageSquare, 
    color: "from-purple-400 to-purple-600",
    bgColor: "bg-purple-500/20",
    textColor: "text-purple-400"
  };
  if (level <= 20) return { 
    title: "El Apologista", 
    description: "Defendiendo con conocimiento",
    icon: GraduationCap, 
    color: "from-secondary to-amber-600",
    bgColor: "bg-secondary/20",
    textColor: "text-secondary"
  };
  return { 
    title: "El Maestro", 
    description: "Formando a otros",
    icon: Star, 
    color: "from-yellow-400 to-orange-500",
    bgColor: "bg-yellow-500/20",
    textColor: "text-yellow-400"
  };
};

const sizeClasses = {
  sm: {
    container: "w-8 h-8",
    icon: "w-4 h-4",
    badge: "w-5 h-5 text-[10px] -bottom-1 -right-1",
  },
  md: {
    container: "w-12 h-12",
    icon: "w-6 h-6",
    badge: "w-6 h-6 text-xs -bottom-1 -right-1",
  },
  lg: {
    container: "w-16 h-16",
    icon: "w-8 h-8",
    badge: "w-8 h-8 text-sm -bottom-2 -right-2",
  },
};

export function PreparationBadge({ level, size = "md", showTitle = false }: PreparationBadgeProps) {
  const rankData = getRankData(level);
  const Icon = rankData.icon;
  const sizes = sizeClasses[size];

  return (
    <div className="flex items-center gap-3">
      <motion.div 
        className="relative"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <div className={`${sizes.container} rounded-xl bg-gradient-to-br ${rankData.color} flex items-center justify-center shadow-lg`}>
          <Icon className={`${sizes.icon} text-white`} />
        </div>
        <motion.div 
          className={`absolute ${sizes.badge} bg-primary text-primary-foreground font-bold rounded-full flex items-center justify-center border-2 border-card`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.2 }}
        >
          {level}
        </motion.div>
      </motion.div>

      {showTitle && (
        <div>
          <p className={`font-semibold ${rankData.textColor}`}>{rankData.title}</p>
          <p className="text-xs text-muted-foreground">{rankData.description}</p>
        </div>
      )}
    </div>
  );
}