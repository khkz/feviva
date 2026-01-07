import { motion } from "framer-motion";
import { Heart, Moon, BookOpen, MessageCircle, Target, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

const needs = [
  {
    icon: Heart,
    title: "Quiero empezar a orar",
    problem: "No sé cómo orar o me cuesta mantener la constancia",
    solution: "Rituales guiados matutinos y nocturnos",
    color: "from-rose-500/20 to-pink-500/20",
    iconColor: "text-rose-400"
  },
  {
    icon: Moon,
    title: "Busco paz interior",
    problem: "Ansiedad, estrés, no puedo dormir bien",
    solution: "Sleep Stories y sonidos de relajación",
    color: "from-indigo-500/20 to-purple-500/20",
    iconColor: "text-indigo-400"
  },
  {
    icon: BookOpen,
    title: "Quiero entender la Biblia",
    problem: "La Biblia me parece difícil de entender",
    solution: "Plan de lectura guiado con reflexiones",
    color: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400"
  },
  {
    icon: MessageCircle,
    title: "Necesito respuestas",
    problem: "Tengo dudas sobre la fe, no sé qué responder",
    solution: "Coach de debate y tarjetas de argumentos",
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400"
  },
  {
    icon: Target,
    title: "Quiero ser constante",
    problem: "Empiezo pero no mantengo los hábitos espirituales",
    solution: "Sistema de hábitos con rachas y logros",
    color: "from-cyan-500/20 to-blue-500/20",
    iconColor: "text-cyan-400"
  },
  {
    icon: Users,
    title: "Busco comunidad",
    problem: "Me siento solo en mi camino de fe",
    solution: "Comunidad de oración y testimonios",
    color: "from-violet-500/20 to-fuchsia-500/20",
    iconColor: "text-violet-400"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export const UserNeedsSection = () => {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Te entendemos
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-6">
            ¿Qué estás buscando?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Muchas personas llegan aquí buscando algo más. Identifica tu necesidad 
            y descubre cómo podemos ayudarte en tu camino espiritual.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {needs.map((need, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className={`group relative overflow-hidden p-6 h-full bg-gradient-to-br ${need.color} border-white/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 cursor-pointer`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className={`w-14 h-14 rounded-2xl bg-background/80 flex items-center justify-center mb-4 ${need.iconColor} group-hover:scale-110 transition-transform`}>
                  <need.icon className="w-7 h-7" />
                </div>
                
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {need.title}
                </h3>
                
                <p className="text-muted-foreground text-sm mb-4 italic">
                  "{need.problem}"
                </p>
                
                <div className="flex items-center gap-2 text-primary text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  {need.solution}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
