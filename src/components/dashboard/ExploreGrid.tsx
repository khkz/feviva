import { useNavigate } from "react-router-dom";
import { MessageCircle, BookOpen, Users, Target, Route, Shield } from "lucide-react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import coachImage from "@/assets/coach-section.jpg";
import libraryImage from "@/assets/library-section.jpg";
import communityImage from "@/assets/community-section.jpg";
import habitsImage from "@/assets/habits-section.jpg";

interface ExploreItem {
  icon: LucideIcon;
  label: string;
  description: string;
  path: string;
  image: string;
  featured?: boolean;
}

const exploreItems: ExploreItem[] = [
  {
    icon: Route,
    label: "Ruta del Apóstol",
    description: "Tu formación completa",
    path: "/apostle-path",
    image: coachImage,
    featured: true
  },
  {
    icon: Shield,
    label: "Apologética 101",
    description: "Fundamentos de la fe",
    path: "/apologetics-intro",
    image: libraryImage
  },
  {
    icon: MessageCircle,
    label: "Coach IA",
    description: "Practica debates",
    path: "/coach",
    image: coachImage
  },
  {
    icon: BookOpen,
    label: "Biblioteca",
    description: "Lecciones de fe",
    path: "/library",
    image: libraryImage
  },
  {
    icon: Users,
    label: "Comunidad",
    description: "Comparte y ora",
    path: "/community",
    image: communityImage
  },
  {
    icon: Target,
    label: "Hábitos",
    description: "Crece cada día",
    path: "/habits",
    image: habitsImage
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 200, damping: 20 },
  },
} as const;

export function ExploreGrid() {
  const navigate = useNavigate();

  return (
    <motion.section 
      className="px-5 py-4 lg:px-0"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.4 }}
    >
      <h2 className="font-heading text-lg lg:text-xl font-semibold text-foreground mb-3">
        Explora
      </h2>

      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {exploreItems.map((item) => (
          <motion.button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="relative h-32 lg:h-44 rounded-2xl overflow-hidden group"
            variants={cardVariants}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            {/* Background Image */}
            <img
              src={item.image}
              alt={item.label}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:via-black/50 transition-all" />
            
            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end p-3 lg:p-4">
              <motion.div 
                className="flex items-center gap-2 mb-1"
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
              >
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <item.icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                </div>
                <span className="font-semibold text-white text-sm lg:text-base">{item.label}</span>
              </motion.div>
              <p className="text-white/70 text-xs lg:text-sm">{item.description}</p>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </motion.section>
  );
}
