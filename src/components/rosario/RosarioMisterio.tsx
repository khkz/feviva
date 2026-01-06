import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface RosarioMisterioProps {
  numero: number;
  titulo: string;
  fruto: string;
  meditacion: string;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

export function RosarioMisterio({
  numero,
  titulo,
  fruto,
  meditacion,
  isActive,
  isCompleted,
  onClick,
}: RosarioMisterioProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-lg border transition-smooth",
        isActive 
          ? "border-primary bg-primary/5 shadow-medium" 
          : isCompleted
            ? "border-secondary/50 bg-secondary/10"
            : "border-border hover:border-primary/30 hover:bg-muted"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
          isCompleted 
            ? "bg-secondary text-secondary-foreground"
            : isActive
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
        )}>
          {isCompleted ? <Check className="h-4 w-4" /> : numero}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-heading font-semibold",
            isActive ? "text-primary" : "text-foreground"
          )}>
            {titulo}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Fruto: {fruto}
          </p>
          {isActive && (
            <p className="text-sm text-foreground mt-2 leading-relaxed">
              {meditacion}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
