import { motion } from "framer-motion";
import { 
  Moon, 
  Cloud, 
  Shield, 
  Smartphone, 
  Zap,
  Bell,
  Download,
  Globe
} from "lucide-react";

const features = [
  {
    icon: Moon,
    title: "Modo Oscuro",
    description: "Cuida tus ojos con un tema oscuro elegante"
  },
  {
    icon: Cloud,
    title: "Sincronización",
    description: "Tu progreso guardado en la nube"
  },
  {
    icon: Shield,
    title: "100% Privado",
    description: "Tus datos personales protegidos"
  },
  {
    icon: Smartphone,
    title: "Responsive",
    description: "Funciona en móvil, tablet y desktop"
  },
  {
    icon: Zap,
    title: "Sin Anuncios",
    description: "Experiencia limpia sin interrupciones"
  },
  {
    icon: Bell,
    title: "Recordatorios",
    description: "Notificaciones para tus rituales"
  },
  {
    icon: Download,
    title: "Modo Offline",
    description: "Próximamente: acceso sin internet"
  },
  {
    icon: Globe,
    title: "Español Nativo",
    description: "Contenido en español latinoamericano"
  }
];

export const TechFeaturesSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Diseñado para ti
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold mt-4 mb-4">
            Características técnicas
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Una aplicación moderna, rápida y segura para tu vida espiritual.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group p-4 rounded-2xl bg-muted/30 hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all duration-300 text-center"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
              <p className="text-muted-foreground text-xs">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
