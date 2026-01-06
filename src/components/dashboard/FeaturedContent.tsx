import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, BookOpen, Heart, Moon, Sun, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import libraryImage from "@/assets/library-section.jpg";
import communityImage from "@/assets/community-section.jpg";
import habitsImage from "@/assets/habits-section.jpg";
import heroBackground from "@/assets/hero-background.jpg";

interface FeaturedItem {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  sessions: number;
  gradient: string;
  path: string;
  badge?: string;
  image: string;
}

const featuredItems: FeaturedItem[] = [
  {
    id: "bible-365",
    icon: BookOpen,
    title: "La Biblia en 365 días",
    subtitle: "Plan de lectura diaria",
    sessions: 365,
    gradient: "from-indigo-600 via-purple-600 to-pink-500",
    path: "/bible-plan",
    badge: "Nuevo",
    image: heroBackground
  },
  {
    id: "gratitude",
    icon: Heart,
    title: "Diario de Gratitud",
    subtitle: "Inicia tu día bien",
    sessions: 254,
    gradient: "from-rose-500 via-pink-500 to-orange-400",
    path: "/morning",
    image: communityImage
  },
  {
    id: "homily",
    icon: Sun,
    title: "Homilía del Día",
    subtitle: "Reflexión diaria",
    sessions: 1094,
    gradient: "from-amber-500 via-orange-500 to-red-500",
    path: "/morning",
    image: libraryImage
  },
  {
    id: "sleep",
    icon: Moon,
    title: "Historias para Dormir",
    subtitle: "Descansa en paz",
    sessions: 48,
    gradient: "from-slate-700 via-indigo-800 to-purple-900",
    path: "/sleep-stories",
    image: habitsImage
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 200, damping: 20 },
  },
} as const;

export function FeaturedContent() {
  const navigate = useNavigate();

  return (
    <motion.section 
      className="px-5 py-4 lg:px-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl font-bold text-foreground">
          Para Ti
        </h2>
        <button className="text-sm text-primary font-medium hover:text-primary-hover transition-colors">
          Ver todo
        </button>
      </div>

      {/* Mobile: List view */}
      <motion.div 
        className="space-y-3 lg:hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {featuredItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => navigate(item.path)}
            className="w-full group"
            variants={itemVariants}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-medium transition-all">
              <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                <item.icon className="w-7 h-7 text-white" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{item.sessions} sesiones</span>
                </div>
              </div>
              <motion.div 
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                whileHover={{ scale: 1.1 }}
              >
                <Play className="w-4 h-4 text-primary group-hover:text-primary-foreground ml-0.5" />
              </motion.div>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Desktop: Grid with images */}
      <motion.div 
        className="hidden lg:grid grid-cols-2 xl:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {featuredItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => navigate(item.path)}
            className="group relative h-64 rounded-2xl overflow-hidden text-left"
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Background Image */}
            <img
              src={item.image}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t ${item.gradient} opacity-70 group-hover:opacity-80 transition-opacity`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Badge */}
            {item.badge && (
              <motion.div 
                className="absolute top-3 right-3 bg-secondary text-secondary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                {item.badge}
              </motion.div>
            )}

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-5">
              <motion.div 
                className={`w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3`}
                whileHover={{ rotate: 5 }}
              >
                <item.icon className="w-6 h-6 text-white" />
              </motion.div>
              
              <h3 className="font-heading text-xl font-bold text-white mb-1 group-hover:text-secondary transition-colors">
                {item.title}
              </h3>
              <p className="text-white/80 text-sm mb-2">{item.subtitle}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-white/70 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.sessions} sesiones</span>
                </div>
                
                <motion.div 
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-secondary group-hover:text-secondary-foreground transition-all"
                  whileHover={{ scale: 1.1 }}
                >
                  <Play className="w-4 h-4 text-white group-hover:text-secondary-foreground ml-0.5" />
                </motion.div>
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </motion.section>
  );
}
