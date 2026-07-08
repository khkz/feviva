import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Compass,
  Headphones,
  Cross,
  BookOpen,
  Sunrise,
  Moon,
  Rocket,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Compass,
    title: "Ruta del Apóstol",
    description: "Un camino gamificado de formación en apologética, de novato a apóstol.",
    href: "/auth",
  },
  {
    icon: Headphones,
    title: "Biblioteca de audio",
    description: "Más de 150 oraciones católicas con audio guiado para escuchar y rezar.",
    href: "/oraciones",
  },
  {
    icon: Cross,
    title: "Rosario y Novenas",
    description: "Rosario interactivo y novenas guiadas de nueve días, día por día.",
    href: "/novenas-publicas",
  },
  {
    icon: BookOpen,
    title: "Biblia en 365 días",
    description: "Plan de lectura anual con reflexión, contexto histórico y audio.",
    href: "/auth",
  },
  {
    icon: Sunrise,
    title: "Evangelio del día",
    description: "El evangelio de hoy con video, reflexión y oración cada mañana.",
    href: "/evangelio-del-dia",
  },
  {
    icon: Moon,
    title: "Historias para dormir",
    description: "Relatos bíblicos narrados para cerrar el día sin scroll infinito.",
    href: "/auth",
  },
  {
    icon: Rocket,
    title: "Frontera Final",
    description: "Fe, ciencia y cultura digital. Explora los desafíos del mundo moderno.",
    href: "/continente-digital",
  },
];

export const FeaturesGridSection = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-secondary font-semibold text-xs uppercase tracking-wider">
            Todo lo que incluye
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mt-3 max-w-3xl mx-auto leading-tight">
            Una sola app para{" "}
            <span className="text-gradient-gold">formarte, orar y crecer.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                to={f.href}
                className="group block h-full p-5 md:p-6 rounded-2xl bg-card border border-border hover:border-secondary/50 hover:shadow-lg hover:shadow-secondary/10 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-secondary/15 transition-transform">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base md:text-lg font-bold mb-1.5 group-hover:text-secondary transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {f.description}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                  Explorar <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
