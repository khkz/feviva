import { useNavigate } from "react-router-dom";
import { Hand, BookOpen, Flame, Moon, Play, MessageSquare, Library, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const actions = [
  { 
    icon: Hand, 
    label: "Orar ahora", 
    path: "/oraciones/app",
    gradient: "from-amber-400 to-orange-500",
    bgGradient: "from-amber-500/20 to-orange-500/20"
  },
  { 
    icon: Play, 
    label: "Evangelio", 
    path: "/evangelio",
    gradient: "from-yellow-400 to-amber-500",
    bgGradient: "from-yellow-500/20 to-amber-500/20"
  },
  { 
    icon: BookOpen, 
    label: "Lecciones", 
    path: "/library",
    gradient: "from-secondary to-amber-600",
    bgGradient: "from-secondary/20 to-amber-500/20"
  },
  { 
    icon: Sparkles, 
    label: "Santos", 
    path: "/santos/app",
    gradient: "from-sky-400 to-cyan-600",
    bgGradient: "from-sky-500/20 to-cyan-600/20"
  },
  { 
    icon: MessageSquare, 
    label: "Defender", 
    path: "/coach",
    gradient: "from-purple-400 to-purple-600",
    bgGradient: "from-purple-500/20 to-purple-600/20"
  },
  { 
    icon: Library, 
    label: "Arsenal", 
    path: "/cards",
    gradient: "from-emerald-400 to-emerald-600",
    bgGradient: "from-emerald-500/20 to-emerald-600/20"
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
      {/* Section Title */}
      <div className="mb-3 lg:mb-4">
        <h2 className="font-heading text-base lg:text-lg font-semibold text-foreground">
          Accesos rápidos
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5 lg:hidden">Lo esencial de hoy, en un toque.</p>
      </div>

      {/* Mobile: Horizontal scroll with fade indicators */}
      <div className="relative lg:hidden">
        {/* Left fade gradient */}
        <div className="absolute left-0 top-0 bottom-2 w-6 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none opacity-0 transition-opacity" />
        
        {/* Right fade gradient - indicates more content */}
        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        <motion.div 
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {actions.map((action) => (
            <motion.button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="group flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl glass-button min-w-[86px] active:scale-95 active:opacity-80 transition-all"
              variants={itemVariants}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className={`relative p-3.5 rounded-2xl bg-gradient-to-br ${action.bgGradient}`}
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.3 }}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity`} />
                <action.icon className="relative w-5 h-5 text-foreground group-hover:text-white group-active:text-white transition-colors" />
              </motion.div>
              <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                {action.label}
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Desktop: Full grid */}
      <motion.div 
        className="hidden lg:grid grid-cols-4 xl:grid-cols-7 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {actions.map((action) => (
          <motion.button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="group flex flex-col items-center gap-3 p-5 rounded-2xl glass-card hover:shadow-medium active:scale-[0.98] transition-all"
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