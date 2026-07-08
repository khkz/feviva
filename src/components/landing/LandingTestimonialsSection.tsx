import { motion } from "framer-motion";
import { Quote, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

// Testimonios reales tomados de "Historias de Fe" (sección Comunidad)
const testimonials = [
  {
    quote:
      "Buscando a una amiga por los conventos de Murcia, Dios me encontró a mí. Pasé nueve días en la hospedería y sentí por primera vez una paz que no venía de fuera, sino de dentro. Hoy llevo 17 años como Hermana Pobre de Santa Clara. Cristo es la felicidad. Descúbrelo, que te lo digo yo, vale la pena.",
    author: "Hermana Leo",
    role: "Hermanas Pobres de Santa Clara · Murcia, España",
    initials: "L",
  },
  {
    quote:
      "En una librería, una luz caía sobre una Biblia didáctica con una palmera en la portada — Tamara significa palmera en hebreo. La compré y esa noche empecé a leerla. Descubrí el amor de Jesús a través de la Virgen, me confesé, me confirmé, y aquí estoy.",
    author: "Tamara Falcó",
    role: "Diseñadora y comunicadora · Madrid",
    initials: "TF",
  },
  {
    quote:
      "Pasé 257 días secuestrado en un cuarto de un metro por tres. Un día oí una voz: 'Ofrécemelo. Es lo único que depende de ti.' Recuperé mi libertad interior. En Nochebuena recé con mis secuestradores y fue la Navidad más feliz de mi vida.",
    author: "Bosco Gutiérrez",
    role: "Arquitecto, esposo y padre de 9 hijos · México",
    initials: "BG",
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
            Contenido basado en el Catecismo, la Sagrada Escritura y el Magisterio de la Iglesia.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
