import { cn } from "@/lib/utils";

interface RosarioDecenaProps {
  completadas: number;
  onComplete: () => void;
}

export function RosarioDecena({ completadas, onComplete }: RosarioDecenaProps) {
  const cuentas = Array.from({ length: 10 }, (_, i) => i);
  
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Visual bead counter */}
      <div className="flex flex-wrap justify-center gap-3 max-w-xs">
        {cuentas.map((i) => (
          <button
            key={i}
            onClick={onComplete}
            disabled={i !== completadas}
            className={cn(
              "w-10 h-10 rounded-full border-2 transition-smooth flex items-center justify-center font-medium text-sm",
              i < completadas
                ? "bg-secondary border-secondary text-secondary-foreground"
                : i === completadas
                  ? "bg-primary border-primary text-primary-foreground animate-pulse cursor-pointer hover:scale-110"
                  : "bg-muted/50 border-border text-muted-foreground cursor-not-allowed"
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>
      
      {/* Progress text */}
      <div className="text-center">
        <p className="text-lg font-heading font-bold text-foreground">
          {completadas} de 10 Avemarías
        </p>
        {completadas < 10 && (
          <p className="text-sm text-muted-foreground mt-1">
            Toca la cuenta dorada para avanzar
          </p>
        )}
      </div>
    </div>
  );
}
