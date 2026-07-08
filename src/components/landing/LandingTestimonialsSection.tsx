import { motion } from "framer-motion";
import { Quote, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

const testimonials = [
  {
    quote:
      "Practiqué con el coach una semana. Cuando mi cuñado me sacó el tema en la sobremesa, no discutí: escuché y respondí con calma. Fue otro nivel de conversación.",
    author: "Testimonio de un usuario",
    role: "Argentina",
    initials: "MP",
  },
  {
    quote:
      "Nunca supe cómo empezar a defender lo que creo sin ponerme a la defensiva. En 10 minutos al día, aprendí a distinguir un argumento de una descalificación.",
    author: "Testimonio de un usuario",
    role: "México",
    initials: "JR",
  },
  {
    quote:
      "El coach no te dice lo que querés oír: te corrige. Eso me obligó a estudiar de verdad la fe, no solo a repetirla.",
    author: "Testimonio de un usuario",
    role: "España",
    initials: "LS",
  },
];

export const LandingTestimonialsSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-secondary font-semibold text-xs uppercase tracking-wider">
            Prueba social
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mt-3">
            Formación que se nota en la conversación real.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6 mb-10">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <Card className="h-full p-6 bg-card border-border hover:border-secondary/40 transition-colors">
                <Quote className="w-8 h-8 text-secondary/40 mb-4" />
                <blockquote className="text-sm md:text-base text-foreground leading-relaxed mb-5 italic">
                  "{t.quote}"
                </blockquote>
                <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-secondary/70 text-primary font-bold text-sm flex items-center justify-center">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-primary/5 border border-primary/15 max-w-2xl mx-auto text-center"
        >
          <ShieldCheck className="w-5 h-5 text-secondary flex-shrink-0" />
          <p className="text-sm md:text-base text-foreground">
            Contenido <strong>fiel al Magisterio</strong>, revisado por nuestro asesor teológico.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
