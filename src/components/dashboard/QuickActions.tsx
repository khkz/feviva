import { useNavigate } from "react-router-dom";
import { Hand, BookOpen, Flame, Moon, Play } from "lucide-react";
import { motion } from "framer-motion";

const actions = [
  { 
    icon: Play, 
    label: "Evangelio", 
    path: "/evangelio",
    gradient: "from-yellow-400 to-amber-500",
    bgGradient: "from-yellow-500/20 to-amber-500/20"
  },
  { 
    icon: Hand, 
    label: "Orar", 
    path: "/oraciones",
    gradient: "from-amber-400 to-orange-500",
    bgGradient: "from-amber-500/20 to-orange-500/20"
  },
  { 
    icon: BookOpen, 
    label: "Rosario", 
    path: "/rosario",
    gradient: "from-blue-400 to-indigo-500",
    bgGradient: "from-blue-500/20 to-indigo-500/20"
  },
  { 
    icon: Flame, 
    label: "Novenas", 
    path: "/novenas",
    gradient: "from-red-400 to-rose-500",
    bgGradient: "from-red-500/20 to-pink-500/20"
  },
  { 
    icon: Moon, 
    label: "Dormir", 
    path: "/sleep-stories",
    gradient: "from-indigo-500 to-purple-600",
    bgGradient: "from-indigo-500/20 to-purple-500/20"
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
} as const;

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <section className="px-5 -mt-3 relative z-20 lg:px-0 lg:mt-0">
      {/* Mobile: Horizontal scroll */}
      <motion.div 
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide lg:hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {actions.map((action) => (
          <motion.button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="group flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl glass-button min-w-[72px] hover:scale-105 transition-transform"
            variants={itemVariants}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div 
              className={`relative p-3 rounded-2xl bg-gradient-to-br ${action.bgGradient}`}
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3 }}
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <action.icon className="relative w-5 h-5 text-foreground group-hover:text-white transition-colors" />
            </motion.div>
            <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground transition-colors">
              {action.label}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Desktop: Full grid */}
      <motion.div 
        className="hidden lg:grid grid-cols-5 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {actions.map((action) => (
          <motion.button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="group flex flex-col items-center gap-3 p-5 rounded-2xl glass-card hover:shadow-medium transition-all"
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div 
              className={`relative p-4 rounded-2xl bg-gradient-to-br ${action.bgGradient}`}
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3 }}
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <action.icon className="relative w-7 h-7 text-foreground group-hover:text-white transition-colors" />
            </motion.div>
            <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
              {action.label}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </section>
  );
}
