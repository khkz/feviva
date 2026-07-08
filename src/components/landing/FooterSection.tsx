import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Church, BookOpen, Sparkles, MapPin, ShieldCheck, Instagram, Mail, Scale } from "lucide-react";
import logoElRugido from "@/assets/logo-elrugido.png";

const popularSaints = [
  { name: "Virgen de Guadalupe", slug: "virgen-de-guadalupe-061a968f" },
  { name: "San Francisco de Asís", slug: "san-francisco-de-asis-19ace8a4" },
  { name: "Santa Teresa de Jesús", slug: "santa-teresa-de-jesus-10832ac0" },
  { name: "San Juan Pablo II", slug: "san-juan-pablo-ii-3f8d969c" },
  { name: "San José", slug: "san-jose-307af056" },
  { name: "Santa Rosa de Lima", slug: "santa-rosa-de-lima-d2af02bd" },
];

const popularPrayers = [
  { name: "Padre Nuestro", slug: "padre-nuestro" },
  { name: "Ave María", slug: "ave-maria" },
  { name: "Gloria", slug: "gloria" },
  { name: "Credo de los Apóstoles", slug: "credo-de-los-apostoles" },
  { name: "Salve Regina", slug: "salve-regina" },
  { name: "Oración a San Miguel Arcángel", slug: "oracion-a-san-miguel-arcangel" },
];

const patronsByCountry = [
  { name: "México", saint: "Virgen de Guadalupe", slug: "virgen-de-guadalupe-061a968f" },
  { name: "Argentina", saint: "Nuestra Señora de Luján", slug: "nuestra-senora-de-lujan-826ada82" },
  { name: "España", saint: "Santiago Apóstol", slug: "santiago-apostol-12e29c61" },
  { name: "Perú", saint: "Santa Rosa de Lima", slug: "santa-rosa-de-lima-d2af02bd" },
  { name: "Colombia", saint: "Virgen de Chiquinquirá", slug: "virgen-de-chiquinquira-5a36a7e5" },
  { name: "Brasil", saint: "Nuestra Señora Aparecida", slug: "nuestra-senora-aparecida-21f9efa5" },
];

export const FooterSection = () => {
  return (
    <footer className="py-12 px-4 border-t border-border/50 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand + About */}
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
              Plataforma católica digital creada en 2025 por un equipo de católicos, teólogos y desarrolladores. 
              Nuestro contenido se basa en el Catecismo de la Iglesia Católica, documentos del Vaticano II y la Sagrada Escritura.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span>Contenido verificado con fuentes eclesiales</span>
            </div>
          </motion.div>

          {/* Santos Populares */}
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
                  <Link to={`/santo/${saint.slug}`} className="hover:text-foreground transition-colors">
                    {saint.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Patronos por País */}
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
                  <Link to={`/santo/${item.slug}`} className="hover:text-foreground transition-colors" title={`Santo patrono de ${item.name}`}>
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
              Contenido Público
            </h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li><Link to="/santos" className="hover:text-foreground transition-colors">Calendario de santos</Link></li>
              <li><Link to="/santos?tab=patrons" className="hover:text-foreground transition-colors">Santos patronos</Link></li>
              <li><Link to="/evangelio-del-dia" className="hover:text-foreground transition-colors">Evangelio del día</Link></li>
              <li><Link to="/novenas-publicas" className="hover:text-foreground transition-colors">Novenas católicas</Link></li>
              <li><Link to="/capsula-del-dia" className="hover:text-foreground transition-colors">Cápsula del día</Link></li>
              <li><Link to="/continente-digital" className="hover:text-foreground transition-colors">El Continente Digital</Link></li>
            </ul>
          </motion.div>

          {/* Oraciones Populares */}
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
                  <Link to={`/oracion/${prayer.slug}`} className="hover:text-foreground transition-colors">
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
