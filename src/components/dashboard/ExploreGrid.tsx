import { useNavigate } from "react-router-dom";
import { MessageCircle, BookOpen, Users, Target, Route, Shield, Sparkles, Bot } from "lucide-react";
import { STAGES } from "@/hooks/useApostlePath";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import coachImage from "@/assets/coach-section.jpg";
import libraryImage from "@/assets/library-section.jpg";
import communityImage from "@/assets/community-section.jpg";
import habitsImage from "@/assets/habits-section.jpg";
import { PremiumBadge } from "@/components/shared/PremiumBadge";

interface ExploreItem {
  icon: LucideIcon;
  label: string;
  description: string;
  path: string;
  image: string;
  badge?: string;
  stats?: string;
  /** Anticipación de valor: marcada como Premium en el futuro. Hoy sigue accesible. */
  premium?: boolean;
  premiumLabel?: string;
}

const exploreItems: ExploreItem[] = [
  {
    icon: Route,
    label: "Ruta del Apóstol",
    description: `${STAGES.length} etapas para defender tu fe con confianza`,
    path: "/apostle-path",
    image: coachImage,
    badge: "Popular",
    stats: `${STAGES.length} etapas`
  },
  {
    icon: Shield,
    label: "Apologética 101",
    description: "Fundamentos y objeciones más comunes. Muy pronto disponible.",
    // El módulo aún no existe: mientras tanto redirigimos a la Biblioteca
    // para evitar cualquier 404.
    path: "/library",
    image: libraryImage,
    badge: "Muy pronto",
    stats: "Próximamente"
  },
  {
    icon: Bot,
    label: "Pupilo Digital",
    description: "Enséñale a una IA fría sobre el amor humano",
    path: "/coach?mode=pupilo",
    image: communityImage,
    badge: "Nuevo",
    stats: "Misión"
  },
  {
    icon: MessageCircle,
    label: "Coach IA",
    description: "Entrena con IA para conversaciones reales",
    path: "/coach",
    image: coachImage,
    stats: "Ilimitado"
  },
  {
    icon: BookOpen,
    label: "Biblioteca",
    description: "40+ lecciones en audio sobre doctrina católica",
    path: "/library",
    image: libraryImage,
    stats: "40+ lecciones"
  },
  {
    icon: Users,
    label: "Comunidad",
    description: "Conecta con otros católicos en tu camino",
    path: "/community",
    image: communityImage,
    stats: "Activa"
  },
  {
    icon: Target,
    label: "Hábitos",
    description: "Construye hábitos espirituales que duran",
    path: "/habits",
    image: habitsImage,
    stats: "Diario"
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 180, damping: 18 },
  },
} as const;

export function ExploreGrid() {
  const navigate = useNavigate();

  return (
    <motion.section 
      className="px-5 py-6 lg:px-0"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="font-heading text-xl lg:text-2xl font-semibold text-foreground">
          Explora tu Formación
        </h2>
      </div>

      <motion.div 
        className="grid grid-cols-2 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {exploreItems.map((item) => (
          <motion.button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="relative h-48 lg:h-56 rounded-2xl overflow-hidden group text-left"
            variants={cardVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.97 }}
          >
            {/* Background Image */}
            <img
              src={item.image}
              alt={item.label}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 group-hover:via-black/60 transition-all" />
            
            {/* Badge */}
            {item.badge && (
              <motion.div 
                className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.3 }}
              >
                {item.badge}
              </motion.div>
            )}
            
            {/* Stats Badge */}
            {item.stats && (
              <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                {item.stats}
              </div>
            )}
            
            {/* Content */}
            <div className="absolute inset-x-0 bottom-0 p-4 lg:p-5">
              <motion.div 
                className="flex items-center gap-2.5 mb-2"
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
              >
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary/80 transition-colors">
                  <item.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <span className="font-bold text-white text-base lg:text-lg">{item.label}</span>
              </motion.div>
              <p className="text-white/80 text-sm lg:text-base leading-relaxed line-clamp-2 group-hover:text-white transition-colors">
                {item.description}
              </p>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </motion.section>
  );
}
