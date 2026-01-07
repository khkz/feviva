import { motion } from "framer-motion";
import { Sun, Sparkles, Moon, Stars } from "lucide-react";

const journeySteps = [
  {
    time: "6-9 AM",
    icon: Sun,
    title: "Mañana",
    subtitle: "Ritual Matutino",
    items: [
      "Versículo del día personalizado",
      "Reflexión con inteligencia artificial",
      "Oración de Laudes",
      "Meta de evangelización"
    ],
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-500/10 to-orange-500/10"
  },
  {
    time: "9 AM - 6 PM",
    icon: Sparkles,
    title: "Día",
    subtitle: "Crecimiento",
    items: [
      "Lecciones de 5 minutos",
      "Tarjetas de argumento",
      "Practica con el Coach IA",
      "Diario de gratitud"
    ],
    gradient: "from-cyan-500 to-blue-500",
    bgGradient: "from-cyan-500/10 to-blue-500/10"
  },
  {
    time: "6-10 PM",
    icon: Moon,
    title: "Noche",
    subtitle: "Ritual Nocturno",
    items: [
      "Examen de conciencia",
      "Diario personal",
      "Oración de Completas",
      "Rosario guiado"
    ],
    gradient: "from-violet-500 to-purple-500",
    bgGradient: "from-violet-500/10 to-purple-500/10"
  },
  {
    time: "Antes de dormir",
    icon: Stars,
    title: "Descanso",
    subtitle: "Paz Interior",
    items: [
      "Sleep Stories bíblicas",
      "Sonidos ambientales",
      "Meditaciones guiadas",
      "Timer de sueño"
    ],
    gradient: "from-indigo-500 to-slate-500",
    bgGradient: "from-indigo-500/10 to-slate-500/10"
  }
];

export const DailyJourneySection = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/30" />
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Un acompañamiento completo
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-6">
            Tu día con ElRugido
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Desde que despiertas hasta que duermes, ElRugido te acompaña 
            con contenido diseñado para cada momento del día.
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
          
          <div className="space-y-8 lg:space-y-0">
            {journeySteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={`lg:flex items-center gap-8 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
              >
                <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                  <div className={`inline-block p-6 rounded-3xl bg-gradient-to-br ${step.bgGradient} border border-white/10`}>
                    <div className={`flex items-center gap-3 mb-4 ${index % 2 === 0 ? 'lg:justify-end' : 'lg:justify-start'}`}>
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white shadow-lg`}>
                        <step.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{step.time}</p>
                        <h3 className="text-xl font-bold">{step.title}</h3>
                      </div>
                    </div>
                    
                    <p className={`text-primary font-medium mb-3 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                      {step.subtitle}
                    </p>
                    
                    <ul className={`space-y-2 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                      {step.items.map((item, i) => (
                        <li key={i} className="text-muted-foreground text-sm flex items-center gap-2">
                          {index % 2 !== 0 && <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />}
                          <span className="flex-1">{item}</span>
                          {index % 2 === 0 && <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Timeline dot */}
                <div className="hidden lg:flex w-16 h-16 items-center justify-center">
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${step.gradient} shadow-lg shadow-primary/20`} />
                </div>
                
                <div className="flex-1 hidden lg:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
