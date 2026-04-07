import { motion } from "framer-motion";
import { Heart, Moon, BookOpen, MessageCircle, Target, Users, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const needs = [
  {
    icon: Heart,
    title: "Quiero empezar a orar",
    problem: "No sé cómo orar o me cuesta mantener la constancia",
    solution: "Rituales guiados matutinos y nocturnos",
    feature: "150+ oraciones con audio guiado",
    color: "from-rose-500/20 to-pink-500/20",
    iconColor: "text-rose-400",
    link: "/morning"
  },
  {
    icon: Moon,
    title: "Busco paz interior",
    problem: "Ansiedad, estrés, no puedo dormir bien",
    solution: "Sleep Stories y sonidos de relajación",
    feature: "29 historias para dormir + ambient sounds",
    color: "from-indigo-500/20 to-purple-500/20",
    iconColor: "text-indigo-400",
    link: "/sleep-stories"
  },
  {
    icon: BookOpen,
    title: "Quiero entender la Biblia",
    problem: "La Biblia me parece difícil de entender",
    solution: "Plan de lectura guiado con reflexiones",
    feature: "365 días de lectura con contexto histórico",
    color: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400",
    link: "/bible"
  },
  {
    icon: MessageCircle,
    title: "Necesito respuestas",
    problem: "Tengo dudas sobre la fe, no sé qué responder",
    solution: "Coach de debate y tarjetas de argumentos",
    feature: "Practica con 4 perfiles de interlocutor",
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
    link: "/coach"
  },
  {
    icon: Target,
    title: "Quiero ser constante",
    problem: "Empiezo pero no mantengo los hábitos espirituales",
    solution: "Sistema de hábitos con rachas y logros",
    feature: "Tracking diario + medallas por constancia",
    color: "from-cyan-500/20 to-blue-500/20",
    iconColor: "text-cyan-400",
    link: "/habits"
  },
  {
    icon: Users,
    title: "Busco comunidad",
    problem: "Me siento solo en mi camino de fe",
    solution: "Comunidad de oración y testimonios",
    feature: "Comparte intenciones y lee historias de fe",
    color: "from-violet-500/20 to-fuchsia-500/20",
    iconColor: "text-violet-400",
    link: "/community"
  }
];

export const UserNeedsSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Te entendemos
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-4">
            ¿Qué estás buscando?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Identifica tu necesidad y descubre cómo podemos ayudarte.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {needs.map((need, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Card 
                onClick={() => navigate(need.link)}
                className={`group relative overflow-hidden p-5 h-full bg-gradient-to-br ${need.color} border-white/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 cursor-pointer`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-background/80 flex items-center justify-center flex-shrink-0 ${need.iconColor} group-hover:scale-110 transition-transform`}>
                    <need.icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">
                      {need.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm mb-2 italic line-clamp-1">
                      "{need.problem}"
                    </p>
                    
                    <div className="flex items-center gap-2 text-primary text-sm font-medium mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="line-clamp-1">{need.solution}</span>
                    </div>

                    {/* Mini testimonial */}
                    <p className="text-xs text-emerald-400/80 italic">
                      — "{need.testimonial}"
                    </p>
                  </div>
                </div>

                {/* Hover arrow */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
