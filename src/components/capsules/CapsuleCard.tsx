import { motion } from "framer-motion";
import type { DailyCapsule } from "@/hooks/useDailyCapsule";

interface CapsuleCardProps {
  capsule: DailyCapsule;
  variant?: "full" | "compact";
}

export const CapsuleCard = ({ capsule, variant = "full" }: CapsuleCardProps) => {
  const isCompact = variant === "compact";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl ${isCompact ? "p-4" : "p-6 md:p-8"}`}
      style={{
        background: `linear-gradient(135deg, ${capsule.color_accent}15, ${capsule.color_accent}08)`,
        borderColor: `${capsule.color_accent}30`,
        borderWidth: 1,
      }}
    >
      {/* Accent glow */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: capsule.color_accent }}
      />

      <div className="relative z-10">
        {/* Category badge */}
        {!isCompact && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{capsule.emoji_icon}</span>
            <span
              className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{
                color: capsule.color_accent,
                backgroundColor: `${capsule.color_accent}15`,
              }}
            >
              {capsule.categoria === "tech_vs_fe" ? "Tech vs Fe" :
               capsule.categoria === "dato_historico" ? "Dato Histórico" :
               capsule.categoria === "pregunta_provocadora" ? "Para Pensar" :
               capsule.categoria}
            </span>
          </div>
        )}

        {/* Main fact */}
        <p className={`font-bold text-foreground leading-tight ${isCompact ? "text-sm" : "text-lg md:text-xl"} mb-3`}>
          {isCompact && <span className="mr-1">{capsule.emoji_icon}</span>}
          {capsule.dato_impactante}
        </p>

        {/* Reflection */}
        <p className={`text-muted-foreground ${isCompact ? "text-xs line-clamp-2" : "text-sm md:text-base"} leading-relaxed`}>
          {capsule.reflexion}
        </p>

        {/* Source */}
        {!isCompact && capsule.fuente && (
          <p className="text-xs text-muted-foreground/60 mt-3">
            Fuente: {capsule.fuente}
          </p>
        )}

        {/* Branding watermark */}
        {!isCompact && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: `${capsule.color_accent}20` }}>
            <span className="text-xs text-muted-foreground/50">elrugido.com</span>
            <span className="text-xs text-muted-foreground/50">{capsule.fecha}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
