import { motion } from "framer-motion";
import { LucideIcon, Heart, Rocket, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Import feature images
import featurePrayer from "@/assets/feature-prayer.jpg";
import featureDebate from "@/assets/feature-debate.jpg";

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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-10 py-12`}
    >
      {/* Content */}
      <div className="flex-1 space-y-5">
        <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r ${gradient} text-white shadow-lg`}>
          <Icon className="w-5 h-5" />
          <span className="font-medium text-sm">{title}</span>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-2xl md:text-3xl font-display font-bold">
            {problem}
          </h3>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {solution}
          </p>
        </div>
        
        <ul className="space-y-2">
          {features.slice(0, 4).map((feature, index) => (
            <li
              key={index}
              className="flex items-center gap-3"
            >
              <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              </span>
              <span className="text-foreground text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          onClick={() => navigate(ctaLink)}
          className={`bg-gradient-to-r ${gradient} hover:opacity-90 text-white shadow-lg`}
          size="lg"
        >
          {ctaText}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
      
      {/* Visual */}
      <div className="flex-1 w-full max-w-md">
        <div className={`relative aspect-[4/3] rounded-3xl bg-gradient-to-br ${gradient} p-1 overflow-hidden shadow-2xl`}>
          {image ? (
            <img 
              src={image} 
              alt={title}
              loading="lazy"
              decoding="async"
              className="absolute inset-1 rounded-[20px] w-[calc(100%-8px)] h-[calc(100%-8px)] object-cover"
            />
          ) : (
            <div className="absolute inset-1 rounded-[20px] bg-background/95 backdrop-blur flex items-center justify-center">
              <Icon className="w-20 h-20 text-primary/40" />
            </div>
          )}
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
    solution: "Rituales guiados que te llevan paso a paso por una experiencia de oración profunda. Laudes, Completas, Rosario interactivo y más.",
    features: [
      "Ritual matutino con versículo y reflexión del día",
      "Rosario interactivo con los 4 misterios",
      "Novenas completas de 9 días",
      "Diario de gratitud con reflexiones de IA"
    ],
    ctaText: "Empieza tu primer ritual",
    ctaLink: "/auth",
    gradient: "from-rose-500 to-pink-500",
    image: featurePrayer
  },
  {
    icon: MessageCircle,
    title: "Coach de Apologética",
    problem: "¿Te hacen preguntas difíciles sobre tu fe?",
    solution: "Practica con nuestro coach de IA y aprende a responder con fe, razón y amor. Más de 50 tarjetas de argumentos.",
    features: [
      "Coach de debate con inteligencia artificial",
      "50+ tarjetas de argumentos organizadas",
      "Respuestas en formato 30s, 2min y 5min",
      "Práctica con diferentes perfiles"
    ],
    ctaText: "Practica con el coach",
    ctaLink: "/auth",
    gradient: "from-emerald-500 to-teal-500",
    image: featureDebate
  },
  {
    icon: Rocket,
    title: "Frontera Final",
    problem: "¿Puede la ciencia y la fe coexistir?",
    solution: "Descubre cómo la ciencia moderna confirma la fe católica. Explora el Big Bang, la IA, el cosmos y más desde una perspectiva de fe.",
    features: [
      "El Padre del Big Bang: Georges Lemaître",
      "¿Puede una IA tener alma?",
      "El Observatorio Vaticano",
      "El Libro de la Naturaleza"
    ],
    ctaText: "Explorar el cosmos",
    ctaLink: "/frontera-final",
    gradient: "from-violet-600 to-purple-600"
  }
];

export const FeatureShowcase = () => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Lo más destacado
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-4">
            Herramientas para tu <span className="text-gradient-gold">fe</span>
          </h2>
        </motion.div>
        
        <div className="divide-y divide-border/30">
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
