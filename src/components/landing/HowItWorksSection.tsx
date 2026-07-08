import { motion } from "framer-motion";
import { Target, Sparkles, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Target,
    number: "01",
    title: "Elige tu reto",
    description: "Selecciona un oponente, un tema y un nivel. Desde tutorial guiado hasta debate intenso.",
  },
  {
    icon: Sparkles,
    number: "02",
    title: "Entrena con la IA",
    description: "10 minutos al día. La IA argumenta como lo haría un ateo real y evalúa tu razón, fe y caridad.",
  },
  {
    icon: TrendingUp,
    number: "03",
    title: "Sube de nivel",
    description: "Gana XP, desbloquea logros y avanza en la Ruta del Apóstol. Tu formación se vuelve hábito.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-secondary font-semibold text-xs uppercase tracking-wider">
            Cómo funciona
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mt-3">
            Tres pasos. Un hábito.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative">
          <div className="hidden md:block absolute top-14 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative text-center"
            >
              <div className="relative inline-flex items-center justify-center mb-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl shadow-primary/20">
                  <step.icon className="w-9 h-9 text-secondary" />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-secondary text-primary text-xs font-bold flex items-center justify-center shadow-lg">
                  {step.number}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
