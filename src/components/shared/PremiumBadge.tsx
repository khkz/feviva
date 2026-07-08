import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
  className?: string;
  label?: string;
  /** compact: solo icono + "Premium" en tamaño mínimo. */
  size?: "sm" | "md";
}

/**
 * Badge sutil que comunica valor Premium sin bloquear el acceso.
 * Todo el contenido sigue disponible; el badge solo anticipa qué
 * módulos serán de pago en el futuro.
 */
export const PremiumBadge = ({
  className,
  label = "Premium",
  size = "sm",
}: PremiumBadgeProps) => {
  const isSm = size === "sm";
  return (
    <span
      title="Función que será Premium en el futuro. Hoy sigue accesible para todos."
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-secondary/40 bg-secondary/10 text-secondary font-semibold uppercase tracking-wider",
        isSm ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]",
        className,
      )}
    >
      <Crown className={cn(isSm ? "w-2.5 h-2.5" : "w-3 h-3")} />
      {label}
    </span>
  );
};
