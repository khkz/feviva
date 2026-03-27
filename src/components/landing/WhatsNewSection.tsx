import { motion } from "framer-motion";
import { Rocket, Target, Sparkles, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import fronteraHero from "@/assets/frontera-final-hero.jpg";

const newFeatures = [
  {
    icon: Rocket,
    badge: "NUEVO",
    title: "El Continente Digital",
    subtitle: "Supervivencia y Fe en la Era de la IA",
    description: "Aprende a no ser reemplazado por la IA. Domina tu dieta algorítmica, entrena con prompts maestros y recupera lo hiper-humano.",
    gradient: "from-violet-600 via-purple-600 to-indigo-600",
    link: "/frontera-final",
    highlight: true,
    image: fronteraHero
  },
  {
    icon: Target,
    badge: "NUEVO",
    title: "Misiones Diarias",
    subtitle: "Gamificación espiritual",
    description: "Completa misiones diarias, gana puntos y sube de nivel mientras creces en tu fe. ¡Haz tu camino espiritual más divertido!",
    gradient: "from-amber-500 to-orange-500",
    link: "/dashboard"
  },
  {
    icon: Sparkles,
    badge: "MEJORADO",
    title: "Onboarding Personalizado",
    subtitle: "Tu camino único",
    description: "Un proceso de bienvenida que adapta la app a tus necesidades espirituales específicas.",
    gradient: "from-emerald-500 to-teal-500",
    link: "/auth"
  }
];

export const WhatsNewSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 mb-4"
          >
            <Star className="w-4 h-4 text-violet-400 animate-pulse" />
            <span className="text-sm font-medium text-violet-300">Lo último en ElRugido</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Novedades que <span className="text-gradient-gold">transforman</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Estamos constantemente mejorando para servirte mejor en tu camino de fe.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {newFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`group relative ${feature.highlight ? 'md:row-span-1' : ''}`}
            >
              <div 
                className={`relative h-full rounded-3xl border transition-all duration-300 cursor-pointer overflow-hidden
                  ${feature.highlight 
                    ? 'bg-gradient-to-br from-violet-900/40 via-purple-900/30 to-indigo-900/40 border-violet-500/30 hover:border-violet-400/50 hover:shadow-xl hover:shadow-violet-500/10' 
                    : 'bg-card/50 border-border/50 hover:border-primary/30 hover:bg-card/80'
                  }`}
                onClick={() => navigate(feature.link)}
              >
                {/* Image for highlighted feature */}
                {feature.image && (
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-violet-900/90 via-violet-900/40 to-transparent" />
                  </div>
                )}

                <div className="p-6">
                  {/* Badge */}
                  <span className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-bold
                    ${feature.badge === 'NUEVO' ? 'bg-primary text-primary-foreground animate-pulse' : 'bg-emerald-500/20 text-emerald-400'}`}
                  >
                    {feature.badge}
                  </span>

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-primary/80 font-medium mb-3">
                    {feature.subtitle}
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {feature.description}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                    <span>Explorar</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Highlight glow effect */}
                {feature.highlight && (
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-10"
        >
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/25"
          >
            Comenzar a Explorar
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
