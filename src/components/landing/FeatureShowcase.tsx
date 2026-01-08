import { motion } from "framer-motion";
import { LucideIcon, Heart, Moon, BookOpen, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Import feature images
import featurePrayer from "@/assets/feature-prayer.jpg";
import featureSleep from "@/assets/feature-sleep.jpg";
import featureBible from "@/assets/feature-bible.jpg";
import featureDebate from "@/assets/feature-debate.jpg";
import featureDevotional from "@/assets/feature-devotional.jpg";

interface FeatureShowcaseProps {
  icon: LucideIcon;
  title: string;
  problem: string;
  solution: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  gradient: string;
  reverse?: boolean;
  image?: string;
}

const FeatureShowcaseItem = ({ 
  icon: Icon, 
  title, 
  problem, 
  solution, 
  features, 
  ctaText, 
  ctaLink,
  gradient,
  reverse,
  image
}: FeatureShowcaseProps) => {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 py-16`}
    >
      {/* Content */}
      <div className="flex-1 space-y-6">
        <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r ${gradient} text-white`}>
          <Icon className="w-5 h-5" />
          <span className="font-medium text-sm">{title}</span>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-2xl md:text-3xl font-display font-bold">
            {problem}
          </h3>
          <p className="text-muted-foreground text-lg">
            {solution}
          </p>
        </div>
        
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-primary" />
              </span>
              <span className="text-foreground">{feature}</span>
            </motion.li>
          ))}
        </ul>
        
        <Button 
          onClick={() => navigate(ctaLink)}
          className={`bg-gradient-to-r ${gradient} hover:opacity-90 text-white shadow-lg`}
          size="lg"
        >
          {ctaText}
        </Button>
      </div>
      
      {/* Visual */}
      <div className="flex-1 w-full max-w-md">
        <div className={`relative aspect-[4/3] rounded-3xl bg-gradient-to-br ${gradient} p-1 overflow-hidden`}>
          {image ? (
            <img 
              src={image} 
              alt={title}
              loading="lazy"
              decoding="async"
              className="absolute inset-1 rounded-[22px] w-[calc(100%-8px)] h-[calc(100%-8px)] object-cover"
            />
          ) : (
            <div className="absolute inset-1 rounded-[22px] bg-background/95 backdrop-blur flex items-center justify-center">
              <div className="text-center p-8">
                <Icon className="w-20 h-20 mx-auto mb-4 text-primary/60" />
                <p className="text-muted-foreground text-sm">
                  Vista previa de {title}
                </p>
              </div>
            </div>
          )}
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/20 rounded-full blur-2xl" />
        </div>
      </div>
    </motion.div>
  );
};

const showcaseData: FeatureShowcaseProps[] = [
  {
    icon: Heart,
    title: "Oración y Rituales",
    problem: "¿No sabes cómo empezar a orar?",
    solution: "Nuestros rituales guiados te llevan paso a paso por una experiencia de oración profunda, con oraciones tradicionales adaptadas para el mundo moderno.",
    features: [
      "Ritual matutino con versículo y reflexión del día",
      "Laudes y Completas de la Liturgia de las Horas",
      "Rosario interactivo con los 4 misterios",
      "Diario personal y examen de conciencia"
    ],
    ctaText: "Empieza tu primer ritual",
    ctaLink: "/auth",
    gradient: "from-rose-500 to-pink-500",
    image: featurePrayer
  },
  {
    icon: Moon,
    title: "Paz Interior y Sueño",
    problem: "¿Ansiedad? ¿No puedes dormir?",
    solution: "Descubre historias bíblicas narradas con voces relajantes y sonidos ambientales diseñados para llevarte a un sueño profundo y reparador.",
    features: [
      "Sleep Stories de historias bíblicas",
      "Sonidos ambientales: lluvia, olas, piano, naturaleza",
      "Mezclador de sonidos personalizable",
      "Timer de sueño automático"
    ],
    ctaText: "Duerme en paz",
    ctaLink: "/auth",
    gradient: "from-indigo-500 to-purple-500",
    image: featureSleep
  },
  {
    icon: BookOpen,
    title: "Estudio Bíblico",
    problem: "¿La Biblia te parece difícil?",
    solution: "Un plan de lectura de 365 días con reflexiones diarias, videos explicativos y notas personales. Entiende la Biblia como nunca antes.",
    features: [
      "Plan de lectura en 1 año completo",
      "Videos explicativos por libro bíblico",
      "Reflexiones generadas por IA",
      "Notas personales y progreso guardado"
    ],
    ctaText: "Comienza tu plan bíblico",
    ctaLink: "/auth",
    gradient: "from-amber-500 to-orange-500",
    image: featureBible
  },
  {
    icon: MessageCircle,
    title: "Apologética y Debate",
    problem: "¿Te hacen preguntas difíciles sobre tu fe?",
    solution: "Practica con nuestro coach de IA, estudia más de 50 tarjetas de argumentos y aprende a responder con fe, razón y amor.",
    features: [
      "Coach de debate con inteligencia artificial",
      "50+ tarjetas de argumentos organizadas",
      "Respuestas en formato 30s, 2min y 5min",
      "Práctica con diferentes perfiles de interlocutor"
    ],
    ctaText: "Practica con el coach",
    ctaLink: "/auth",
    gradient: "from-emerald-500 to-teal-500",
    image: featureDebate
  },
  {
    icon: Sparkles,
    title: "Devocionales Especiales",
    problem: "¿Buscas algo más profundo?",
    solution: "Novenas de 9 días, oraciones tradicionales, diario de gratitud con reflexiones bíblicas y recordatorios personalizados.",
    features: [
      "Novenas completas de 9 días con recordatorios",
      "Oraciones tradicionales organizadas por categoría",
      "Diario de gratitud con reflexiones de IA",
      "Peticiones de oración con seguimiento"
    ],
    ctaText: "Explora los devocionales",
    ctaLink: "/auth",
    gradient: "from-violet-500 to-fuchsia-500",
    image: featureDevotional
  }
];

export const FeatureShowcase = () => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Todo lo que necesitas
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-6">
            Soluciones para tu vida espiritual
          </h2>
        </motion.div>
        
        <div className="divide-y divide-border/50">
          {showcaseData.map((data, index) => (
            <FeatureShowcaseItem 
              key={index} 
              {...data} 
              reverse={index % 2 !== 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
