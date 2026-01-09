import { useNavigate } from "react-router-dom";
import { ChevronRight, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface NovenaProgress {
  dia_actual: number;
  completada: boolean;
}

interface Novena {
  id: string;
  titulo: string;
  intencion: string;
  imagen_url: string | null;
}

interface NovenaCarouselProps {
  novenas: Novena[];
  getProgress: (id: string) => NovenaProgress | null;
  loading: boolean;
}

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

const cardVariants = {
  hidden: { opacity: 0, x: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 200, damping: 20 },
  },
} as const;

export function NovenaCarousel({ novenas, getProgress, loading }: NovenaCarouselProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <section className="px-5 py-4 lg:px-0">
        <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-48 lg:w-auto h-56 rounded-2xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  const activeNovenas = novenas.filter(n => {
    const progress = getProgress(n.id);
    return progress && !progress.completada;
  });

  const displayNovenas = activeNovenas.length > 0 ? activeNovenas : novenas.slice(0, 6);

  return (
    <motion.section 
      className="py-4 lg:px-0"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="flex items-center justify-between px-5 lg:px-0 mb-3">
        <h2 className="font-heading text-lg lg:text-xl font-semibold text-foreground">
          {activeNovenas.length > 0 ? "Continúa tu Camino" : "Novenas Destacadas"}
        </h2>
        <motion.button 
          onClick={() => navigate("/novenas")}
          className="flex items-center gap-1 text-sm text-primary"
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.95 }}
        >
          Ver todas
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Mobile: Horizontal scroll */}
      <motion.div 
        className="flex gap-4 overflow-x-auto px-5 pb-2 scrollbar-hide lg:hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {displayNovenas.map((novena) => {
          const progress = getProgress(novena.id);
          const progressPercent = progress ? (progress.dia_actual / 9) * 100 : 0;

          return (
            <motion.button
              key={novena.id}
              onClick={() => navigate("/novenas")}
              className="flex-shrink-0 w-44 glass-card rounded-2xl overflow-hidden text-left"
              variants={cardVariants}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative h-28 bg-gradient-to-br from-primary/30 to-secondary/30">
                {novena.imagen_url ? (
                  <img 
                    src={novena.imagen_url} 
                    alt={novena.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-muted-foreground/40" />
                  </div>
                )}
                {progress && !progress.completada && (
                  <motion.div 
                    className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.5 }}
                  >
                    Día {progress.dia_actual}/9
                  </motion.div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium text-sm text-foreground line-clamp-2 mb-1">
                  {novena.titulo}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                  {novena.intencion}
                </p>
                {progress && !progress.completada && (
                  <Progress value={progressPercent} className="h-1" />
                )}
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Desktop: Grid */}
      <motion.div 
        className="hidden lg:grid grid-cols-3 xl:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {displayNovenas.map((novena) => {
          const progress = getProgress(novena.id);
          const progressPercent = progress ? (progress.dia_actual / 9) * 100 : 0;

          return (
            <motion.button
              key={novena.id}
              onClick={() => navigate("/novenas")}
              className="glass-card rounded-2xl overflow-hidden text-left group"
              variants={cardVariants}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative h-36 lg:h-40 bg-gradient-to-br from-primary/30 to-secondary/30">
                {novena.imagen_url ? (
                  <img 
                    src={novena.imagen_url} 
                    alt={novena.titulo}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground/40" />
                  </div>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {progress && !progress.completada && (
                  <motion.div 
                    className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-xs font-medium px-2.5 py-1.5 rounded-full backdrop-blur-sm"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.5 }}
                  >
                    Día {progress.dia_actual}/9
                  </motion.div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-base text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                  {novena.titulo}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {novena.intencion}
                </p>
                {progress && !progress.completada && (
                  <div className="space-y-1">
                    <Progress value={progressPercent} className="h-1.5" />
                    <p className="text-xs text-muted-foreground">{Math.round(progressPercent)}% completado</p>
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
