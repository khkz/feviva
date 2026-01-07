import { motion } from "framer-motion";
import { Flame, Heart } from "lucide-react";

export const FooterSection = () => {
  return (
    <footer className="py-12 px-4 border-t border-border/50">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-xl">FeViva</span>
              <p className="text-xs text-muted-foreground">Entrena tu fe. Ilumina el mundo.</p>
            </div>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-muted-foreground text-sm flex items-center gap-1"
          >
            Hecho con <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> para la gloria de Dios
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-muted-foreground text-sm"
          >
            © {new Date().getFullYear()} FeViva. Todos los derechos reservados.
          </motion.p>
        </div>
      </div>
    </footer>
  );
};
