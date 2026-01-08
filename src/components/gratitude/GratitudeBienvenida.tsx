import { motion } from "framer-motion";
import { Sun, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface GratitudeBienvenidaProps {
  nombre?: string;
  sesionActual: number;
  totalSesiones: number;
  tituloSesion: string;
}

export const GratitudeBienvenida = ({ 
  nombre, 
  sesionActual, 
  totalSesiones,
  tituloSesion 
}: GratitudeBienvenidaProps) => {
  return (
    <Card className="border-0 overflow-hidden bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-background">
      <CardContent className="pt-8 pb-8 text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="relative mx-auto w-24 h-24"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-rose-500 rounded-full animate-pulse opacity-50" />
          <div className="absolute inset-2 bg-background rounded-full flex items-center justify-center">
            <Sun className="h-10 w-10 text-amber-500" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Bienvenido, {nombre?.split(' ')[0] || 'peregrino'}
          </h2>
          <p className="text-muted-foreground capitalize">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              day: 'numeric',
              month: 'long'
            })}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400"
        >
          <Flame className="h-4 w-4" />
          <span className="font-semibold text-sm">Sesión {sesionActual} de {totalSesiones}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-muted/50 rounded-xl p-5 text-left space-y-4"
        >
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
            "{tituloSesion}"
          </p>
          <div className="space-y-3 text-sm text-muted-foreground italic leading-relaxed">
            <p>Señor, gracias por cada respiro, por la luz que ilumina mi día y por las bendiciones que me das en lo cotidiano.</p>
            <p>Ayúdame a ver todo con ojos de fe y a vivir con gratitud, paz y esperanza.</p>
            <p className="text-foreground">En el nombre del Padre, del Hijo y del Espíritu Santo. Amén.</p>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};
