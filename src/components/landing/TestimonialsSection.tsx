import { motion } from "framer-motion";
import { Star, Quote, BookOpen, Moon, MessageCircle, Heart, Flame, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Real stats fetched from database
const useRealStats = () => {
  return useQuery({
    queryKey: ['landing-real-stats'],
    queryFn: async () => {
      const [oraciones, santos, novenas] = await Promise.all([
        supabase.from('oraciones').select('*', { count: 'exact', head: true }),
        supabase.from('calendar_saints').select('*', { count: 'exact', head: true }),
        supabase.from('novenas').select('*', { count: 'exact', head: true }),
      ]);
      return {
        oraciones: oraciones.count || 0,
        santos: santos.count || 0,
        novenas: novenas.count || 0,
      };
    },
    staleTime: 60 * 60 * 1000,
  });
};

const testimonials = [
  {
    quote: "Antes rezaba el Padre Nuestro de memoria sin pensar. Ahora con las reflexiones diarias, entiendo lo que estoy diciendo. Suena simple, pero me cambió la oración.",
    author: "Usuario de ElRugido",
    role: "Ejemplo de experiencia típica",
    avatar: "🙏"
  },
  {
    quote: "Mi hijo de 16 años me preguntó por qué creo en Dios. Gracias al coach de apologética practiqué cómo responder sin discutir. Tuvimos la mejor conversación de nuestras vidas.",
    author: "Usuario de ElRugido",
    role: "Ejemplo de experiencia típica",
    avatar: "💬"
  },
  {
    quote: "Las historias para dormir bíblicas son lo único que me ha funcionado para no quedarme pegado al celular hasta las 2am. Ahora duermo antes de medianoche.",
    author: "Usuario de ElRugido",
    role: "Ejemplo de experiencia típica",
    avatar: "🌙"
  }
];

export const TestimonialsSection = () => {
  const { data: stats } = useRealStats();

  const realStats = [
    { value: stats?.oraciones || 150, suffix: "+", label: "Oraciones con texto completo", icon: Heart },
    { value: stats?.santos || 420, suffix: "+", label: "Santos del calendario", icon: Flame },
    { value: 365, suffix: "", label: "Días de lectura bíblica", icon: BookOpen },
    { value: stats?.novenas || 9, suffix: "", label: "Novenas guiadas de 9 días", icon: Moon },
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto max-w-6xl">
        {/* Real Stats from Database */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {realStats.map((stat, index) => (
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
                {stat.value.toLocaleString()}{stat.suffix}
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
            Experiencias
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-6">
            Para qué sirve ElRugido
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Estos ejemplos representan el tipo de impacto que buscamos generar. 
            ElRugido es una herramienta joven y en crecimiento.
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
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.author}</p>
                    <p className="text-muted-foreground text-xs italic">{testimonial.role}</p>
                  </div>
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
