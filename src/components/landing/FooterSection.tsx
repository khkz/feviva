import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Church, BookOpen, Sparkles, MapPin, Globe } from "lucide-react";
import logoElRugido from "@/assets/logo-elrugido.svg";

// Popular saints for SEO links
const popularSaints = [
  { name: "Virgen de Guadalupe", slug: "virgen-de-guadalupe" },
  { name: "San Francisco de Asís", slug: "san-francisco-de-asis" },
  { name: "Santa Teresa de Jesús", slug: "santa-teresa-de-jesus" },
  { name: "San Juan Pablo II", slug: "san-juan-pablo-ii" },
  { name: "San José", slug: "san-jose" },
  { name: "Santa Rosa de Lima", slug: "santa-rosa-de-lima" },
];

// Popular prayers for SEO links
const popularPrayers = [
  { name: "Padre Nuestro", slug: "padre-nuestro" },
  { name: "Ave María", slug: "ave-maria" },
  { name: "Gloria al Padre", slug: "gloria-al-padre" },
  { name: "Credo de los Apóstoles", slug: "credo-de-los-apostoles" },
  { name: "Salve Regina", slug: "salve-regina" },
  { name: "Oración a San Miguel", slug: "oracion-a-san-miguel-arcangel" },
];

// Patron saints by country for SEO
const patronsByCountry = [
  { name: "México", saint: "Virgen de Guadalupe", slug: "virgen-de-guadalupe" },
  { name: "Argentina", saint: "Virgen de Luján", slug: "virgen-de-lujan" },
  { name: "España", saint: "Santiago Apóstol", slug: "santiago-apostol" },
  { name: "Perú", saint: "Santa Rosa de Lima", slug: "santa-rosa-de-lima" },
  { name: "Colombia", saint: "Virgen del Rosario", slug: "nuestra-senora-del-rosario-de-chiquinquira" },
  { name: "Brasil", saint: "Nuestra Señora Aparecida", slug: "nuestra-senora-aparecida" },
];

export const FooterSection = () => {
  return (
    <footer className="py-12 px-4 border-t border-border/50 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-4 lg:col-span-1"
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

          {/* Santos Populares - SEO Links */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <h4 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Santos Populares
            </h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {popularSaints.map((saint) => (
                <li key={saint.slug}>
                  <Link 
                    to={`/santo/${saint.slug}`} 
                    className="hover:text-foreground transition-colors"
                  >
                    {saint.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Patronos por País - SEO Links */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="space-y-3"
          >
            <h4 className="font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Patronos por País
            </h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {patronsByCountry.map((item) => (
                <li key={item.slug}>
                  <Link 
                    to={`/santo/${item.slug}`} 
                    className="hover:text-foreground transition-colors"
                    title={`Santo patrono de ${item.name}`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Calendario */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h4 className="font-semibold flex items-center gap-2">
              <Church className="h-4 w-4 text-primary" />
              Calendario Litúrgico
            </h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>
                <Link to="/santos" className="hover:text-foreground transition-colors">
                  Todos los santos
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
              <li>
                <Link to="/santos?tab=month" className="hover:text-foreground transition-colors">
                  Santos del mes
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Oraciones Populares - SEO Links */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            className="space-y-3"
          >
            <h4 className="font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Oraciones Populares
            </h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {popularPrayers.map((prayer) => (
                <li key={prayer.slug}>
                  <Link 
                    to={`/oracion/${prayer.slug}`} 
                    className="hover:text-foreground transition-colors"
                  >
                    {prayer.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/oraciones" className="hover:text-foreground transition-colors font-medium text-primary">
                  Ver todas →
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
