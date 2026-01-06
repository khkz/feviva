import { useNavigate } from "react-router-dom";
import { Hand, BookOpen, Flame, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const actions = [
  { 
    icon: Hand, 
    label: "Orar", 
    path: "/oraciones",
    gradient: "from-amber-500/20 to-orange-500/20"
  },
  { 
    icon: BookOpen, 
    label: "Rosario", 
    path: "/rosario",
    gradient: "from-blue-500/20 to-indigo-500/20"
  },
  { 
    icon: Flame, 
    label: "Novenas", 
    path: "/novenas",
    gradient: "from-red-500/20 to-pink-500/20"
  },
  { 
    icon: MessageCircle, 
    label: "Coach", 
    path: "/coach",
    gradient: "from-emerald-500/20 to-teal-500/20"
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.8,
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
    <section className="px-5 -mt-4 relative z-20">
      <motion.div 
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {actions.map((action) => (
          <motion.button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="glass-button flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl min-w-[80px]"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className={`p-3 rounded-full bg-gradient-to-br ${action.gradient}`}>
              <action.icon className="w-6 h-6 text-foreground" />
            </div>
            <span className="text-xs font-medium text-foreground/80">{action.label}</span>
          </motion.button>
        ))}
      </motion.div>
    </section>
  );
}
