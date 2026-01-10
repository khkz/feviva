import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Church, BookOpen, Sparkles } from "lucide-react";
import logoElRugido from "@/assets/logo-elrugido.svg";

export const FooterSection = () => {
  return (
    <footer className="py-12 px-4 border-t border-border/50 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <img src={logoElRugido} alt="ElRugido" className="w-10 h-10" />
              <div>
                <span className="font-display font-bold text-xl">ElRugido</span>
                <p className="text-xs text-muted-foreground">elrugido.com</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Tu compañero diario para crecer en la fe católica.
            </p>
          </motion.div>

          {/* Santos del Calendario */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <h4 className="font-semibold flex items-center gap-2">
              <Church className="h-4 w-4 text-primary" />
              Santos del Calendario
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/santos" className="hover:text-foreground transition-colors">
                  Calendario completo
                </Link>
              </li>
              <li>
                <Link to="/santos?tab=patrons" className="hover:text-foreground transition-colors">
                  Santos patronos
                </Link>
              </li>
              <li>
                <Link to="/santos?tab=today" className="hover:text-foreground transition-colors">
                  Santos de hoy
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Recursos */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h4 className="font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Recursos
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/auth" className="hover:text-foreground transition-colors">
                  Oraciones guiadas
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-foreground transition-colors">
                  Rosario interactivo
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-foreground transition-colors">
                  Novenas
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Comunidad */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h4 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Únete
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/auth" className="hover:text-foreground transition-colors">
                  Crear cuenta gratis
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-foreground transition-colors">
                  Iniciar sesión
                </Link>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
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
            © {new Date().getFullYear()} ElRugido. Todos los derechos reservados.
          </motion.p>
        </div>
      </div>
    </footer>
  );
};
