import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Music, Headphones, Heart, Waves } from "lucide-react";
import { Card } from "@/components/ui/card";

interface WorshipItem {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Music;
  path: string;
  color: string;
  bgGradient: string;
}

const worshipItems: WorshipItem[] = [
  {
    id: "salmos",
    title: "Salmos Orbitales",
    subtitle: "Meditación con salmos y sonidos espaciales",
    icon: Waves,
    path: "/frontera-final",
    color: "text-violet-400",
    bgGradient: "from-violet-500/20 to-purple-500/20"
  },
  {
    id: "sleep",
    title: "Sleep Stories",
    subtitle: "Historias bíblicas para dormir en paz",
    icon: Headphones,
    path: "/sleep-stories",
    color: "text-indigo-400",
    bgGradient: "from-indigo-500/20 to-blue-500/20"
  },
  {
    id: "oraciones-audio",
    title: "Oraciones con Audio",
    subtitle: "Escucha oraciones guiadas",
    icon: Music,
    path: "/oraciones/app",
    color: "text-rose-400",
    bgGradient: "from-rose-500/20 to-pink-500/20"
  },
  {
    id: "gratitude",
    title: "Sesiones de Gratitud",
    subtitle: "Meditaciones guiadas de agradecimiento",
    icon: Heart,
    path: "/gratitude",
    color: "text-amber-400",
    bgGradient: "from-amber-500/20 to-orange-500/20"
  },
];

export function WorshipSection() {
  const navigate = useNavigate();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="px-5 lg:px-0 py-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" />
          <h2 className="font-heading text-xl lg:text-2xl font-semibold text-foreground">
            Escucha y Medita
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {worshipItems.map((item, index) => (
          <motion.button
            key={item.id}
            onClick={() => navigate(item.path)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className={`p-4 h-full bg-gradient-to-br ${item.bgGradient} border-primary/10 hover:border-primary/30 transition-all group`}>
              <div className={`w-10 h-10 rounded-xl bg-background/60 flex items-center justify-center mb-3 ${item.color} group-hover:scale-110 transition-transform`}>
                <item.icon className="w-5 h-5" />
              </div>
              
              <h3 className="font-semibold text-foreground text-sm mb-1 text-left group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-muted-foreground text-left line-clamp-2">
                {item.subtitle}
              </p>
              
              <div className="flex justify-end mt-2">
                <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Card>
          </motion.button>
        ))}
      </div>
    </motion.section>
  );
}
