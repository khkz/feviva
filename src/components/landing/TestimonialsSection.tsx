import { motion } from "framer-motion";
import { Star, Quote, Flame, BookOpen, Moon, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

const stats = [
  { value: "10,000+", label: "Oraciones registradas", icon: Flame },
  { value: "500+", label: "Rosarios completados", icon: Star },
  { value: "365", label: "Días de racha máxima", icon: BookOpen },
  { value: "1,000+", label: "Sleep Stories escuchadas", icon: Moon }
];

const testimonials = [
  {
    quote: "Antes no sabía cómo orar. Ahora tengo un ritual diario que me conecta con Dios cada mañana.",
    author: "María G.",
    role: "Usuaria desde hace 6 meses",
    avatar: "M"
  },
  {
    quote: "Las Sleep Stories me ayudaron con mi insomnio. Ahora duermo en paz escuchando historias bíblicas.",
    author: "Carlos R.",
    role: "Padre de familia",
    avatar: "C"
  },
  {
    quote: "El coach de debate me dio confianza para responder preguntas sobre la Resurrección en mi universidad.",
    author: "Ana L.",
    role: "Estudiante universitaria",
    avatar: "A"
  }
];

export const TestimonialsSection = () => {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto max-w-6xl">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10"
            >
              <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
              <p className="text-3xl md:text-4xl font-bold text-gradient-gold mb-1">
                {stat.value}
              </p>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Testimonios
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-6">
            Vidas transformadas
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Miles de personas han encontrado en ElRugido el acompañamiento 
            que necesitaban para fortalecer su fe.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >
              <Card className="h-full p-6 bg-card/50 backdrop-blur border-primary/10 hover:border-primary/30 transition-all duration-300">
                <Quote className="w-10 h-10 text-primary/30 mb-4" />
                
                <p className="text-foreground mb-6 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
                
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.author}</p>
                    <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Biblical Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20"
        >
          <MessageCircle className="w-12 h-12 mx-auto mb-6 text-primary/60" />
          <blockquote className="text-xl md:text-2xl font-display italic text-foreground max-w-3xl mx-auto mb-4">
            "Estad siempre preparados para presentar defensa con mansedumbre y reverencia 
            ante todo el que os demande razón de la esperanza que hay en vosotros"
          </blockquote>
          <cite className="text-primary font-medium">— 1 Pedro 3:15</cite>
        </motion.div>
      </div>
    </section>
  );
};
