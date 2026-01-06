import { Sparkles, Sun, Moon, CloudSun } from "lucide-react";
import { motion } from "framer-motion";
import heroBackground from "@/assets/hero-background.jpg";

interface HeroSectionProps {
  userName: string;
  verse?: {
    text: string;
    reference: string;
  };
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return { text: "Buenos días", icon: Sun, gradient: "from-amber-400 to-orange-500" };
  } else if (hour >= 12 && hour < 19) {
    return { text: "Buenas tardes", icon: CloudSun, gradient: "from-blue-400 to-indigo-500" };
  } else {
    return { text: "Buenas noches", icon: Moon, gradient: "from-indigo-500 to-purple-600" };
  }
};

export function HeroSection({ userName, verse }: HeroSectionProps) {
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  return (
    <section className="relative h-[40vh] min-h-[300px] overflow-hidden">
      {/* Background Image */}
      <motion.div 
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <img
          src={heroBackground}
          alt="Contemplative mountain landscape"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="glass-hero absolute inset-0" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-5 pb-6">
        {/* Logo */}
        <motion.div 
          className="absolute top-5 left-5 flex items-center gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div 
            className="glass-button rounded-full p-2"
            whileHover={{ scale: 1.1, rotate: 10 }}
          >
            <Sparkles className="w-5 h-5 text-secondary" />
          </motion.div>
          <span className="text-foreground/80 font-heading font-bold text-lg">FeViva</span>
        </motion.div>

        {/* Greeting Card - Modernized */}
        <motion.div 
          className="glass-card rounded-2xl p-5 mb-3"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-1">
            <motion.div 
              className={`w-8 h-8 rounded-full bg-gradient-to-br ${greeting.gradient} flex items-center justify-center`}
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            >
              <GreetingIcon className="w-4 h-4 text-white" />
            </motion.div>
            <p className="text-white/80 text-sm font-medium">{greeting.text}</p>
          </div>
          <h1 className="font-heading text-2xl font-bold text-white">
            {userName || "Peregrino"}
          </h1>
        </motion.div>

        {/* Verse of the Day - Compact */}
        {verse && (
          <motion.div 
            className="glass-card rounded-xl p-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <p className="text-white/90 text-sm italic leading-relaxed line-clamp-2">
              "{verse.text}"
            </p>
            <p className="text-white/60 text-xs mt-1.5 font-medium">— {verse.reference}</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}