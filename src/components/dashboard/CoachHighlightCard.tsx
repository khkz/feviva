import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, Sparkles, ArrowRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Tarjeta destacada del Coach de Debate.
 * El Coach es la función estrella del producto: aparece cerca de la
 * parte superior del dashboard como una acción recurrente y prominente.
 */
export const CoachHighlightCard = ({ streak }: { streak?: number }) => {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate("/coach")}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      className="group relative w-full overflow-hidden rounded-2xl border border-secondary/30 bg-gradient-to-br from-primary/90 via-primary to-primary/80 text-left shadow-lg shadow-primary/20"
    >
      {/* Glow decorativo */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-secondary/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative flex items-center gap-4 p-5 lg:p-6">
        <div className="shrink-0 w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-secondary/20 backdrop-blur-sm flex items-center justify-center ring-1 ring-secondary/30">
          <MessageSquare className="w-7 h-7 lg:w-8 lg:h-8 text-secondary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-secondary">
              <Sparkles className="w-3 h-3" />
              Función estrella
            </span>
          </div>
          <h3 className="font-heading text-lg lg:text-xl font-bold text-white leading-tight">
            Entrena hoy con el Coach
          </h3>
          <p className="text-white/80 text-xs lg:text-sm mt-1 line-clamp-2">
            Debate con una IA que piensa como un ateo real. 10 minutos y ganas
            confianza para dar razón de tu esperanza.
          </p>
        </div>

        <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
          {typeof streak === "number" && streak > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-secondary bg-secondary/10 border border-secondary/30 rounded-full px-2 py-0.5">
              <Flame className="w-3 h-3" /> {streak}d
            </span>
          )}
          <Button
            size="sm"
            className="bg-secondary hover:bg-secondary/90 text-primary font-bold group-hover:translate-x-0.5 transition-transform"
            tabIndex={-1}
          >
            Entrenar
            <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
        </div>

        <ArrowRight className="sm:hidden w-5 h-5 text-white/70 shrink-0" />
      </div>
    </motion.button>
  );
};
