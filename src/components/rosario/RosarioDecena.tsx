import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RosarioDecenaProps {
  completadas: number;
  onComplete: () => void;
}

export function RosarioDecena({ completadas, onComplete }: RosarioDecenaProps) {
  const cuentas = Array.from({ length: 10 }, (_, i) => i);
  
  return (
    <div className="flex flex-col items-center gap-8">
      {/* Visual bead counter - Rosary style layout */}
      <div className="relative">
        {/* Circular arrangement for beads */}
        <div className="flex flex-wrap justify-center gap-3 max-w-xs">
          {cuentas.map((i) => {
            const isCompleted = i < completadas;
            const isCurrent = i === completadas;
            
            return (
              <motion.button
                key={i}
                onClick={isCurrent ? onComplete : undefined}
                disabled={!isCurrent}
                className={cn(
                  "relative w-12 h-12 rounded-full border-2 transition-all duration-300",
                  "flex items-center justify-center font-heading font-bold text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:ring-offset-2 focus:ring-offset-background",
                  isCompleted
                    ? "bg-gradient-to-br from-secondary to-secondary-hover border-secondary text-secondary-foreground shadow-lg shadow-secondary/30"
                    : isCurrent
                      ? "bg-gradient-to-br from-primary to-primary-hover border-primary text-primary-foreground cursor-pointer shadow-xl shadow-primary/40"
                      : "bg-muted/30 border-border/50 text-muted-foreground/50 cursor-not-allowed"
                )}
                whileHover={isCurrent ? { scale: 1.15 } : {}}
                whileTap={isCurrent ? { scale: 0.95 } : {}}
                animate={isCurrent ? {
                  boxShadow: [
                    "0 0 20px hsla(45, 95%, 58%, 0.4)",
                    "0 0 40px hsla(45, 95%, 58%, 0.6)",
                    "0 0 20px hsla(45, 95%, 58%, 0.4)",
                  ],
                } : {}}
                transition={isCurrent ? {
                  boxShadow: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                } : {}}
              >
                {/* Bead number */}
                <span className="relative z-10">{i + 1}</span>
                
                {/* Glow effect for current bead */}
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-secondary/20"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
                
                {/* Completed checkmark overlay */}
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-background rounded-full flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
      
      {/* Progress indicator */}
      <div className="w-full max-w-xs">
        <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-secondary to-secondary-hover rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(completadas / 10) * 100}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>
      
      {/* Progress text */}
      <div className="text-center space-y-2">
        <p className="text-2xl font-heading font-bold text-foreground">
          {completadas} <span className="text-muted-foreground text-lg">de 10</span>
        </p>
        <p className="text-sm text-secondary font-medium">
          Avemarías
        </p>
        {completadas < 10 && (
          <motion.p 
            className="text-xs text-muted-foreground mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Toca la cuenta brillante para rezar
          </motion.p>
        )}
      </div>
    </div>
  );
}
