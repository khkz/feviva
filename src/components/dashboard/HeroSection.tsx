import { Sparkles, Sun, Moon, CloudSun, Flame, Trophy, Zap, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { DailyShareButton } from "@/components/shared/DailyShareButton";
import heroBackground from "@/assets/hero-background.jpg";

interface HeroSectionProps {
  userName: string;
  verse?: {
    text: string;
    reference: string;
  };
  stats?: {
    streak: number;
    level: number;
    points: number;
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

export function HeroSection({ userName, verse, stats }: HeroSectionProps) {
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  return (
    <section className="relative overflow-hidden lg:min-h-[360px]">
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

      {/* Content - Different layouts for mobile and desktop */}
      <div className="relative z-10 h-full">
        {/* Mobile Layout */}
        <div className="lg:hidden h-[40vh] min-h-[300px] flex flex-col justify-end p-5 pb-6">
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
            <span className="text-foreground/80 font-heading font-bold text-lg">ElRugido</span>
          </motion.div>

          {/* Greeting Card */}
          <motion.div 
            className="glass-card rounded-2xl p-5 mb-3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-1">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${greeting.gradient} flex items-center justify-center`}>
                <GreetingIcon className="w-4 h-4 text-white" />
              </div>
              <p className="text-white/80 text-sm font-medium">{greeting.text}</p>
            </div>
            <h1 className="font-heading text-2xl font-bold text-white">
              {userName || "Peregrino"}
            </h1>
          </motion.div>

          {/* Verse */}
          {verse && (
            <motion.div 
              className="glass-card rounded-xl p-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <p className="text-white/90 text-sm italic leading-relaxed">
                "{verse.text}"
              </p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-white/60 text-xs font-medium">— {verse.reference}</p>
                <DailyShareButton 
                  tipo="versiculo" 
                  title=""
                  fallbackText={verse.text}
                  size="sm"
                  variant="ghost"
                  className="h-6 text-white/60 hover:text-white hover:bg-white/10 text-xs gap-1"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex items-end min-h-[360px] p-8 pb-10">
          <div className="flex-1 max-w-7xl mx-auto grid grid-cols-12 gap-8 items-end">
            {/* Left: Greeting & Verse */}
            <motion.div 
              className="col-span-7"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${greeting.gradient} flex items-center justify-center shadow-lg`}>
                <GreetingIcon className="w-6 h-6 text-white" />
              </div>
                <div>
                  <p className="text-white/70 text-sm font-medium">{greeting.text}</p>
                  <h1 className="font-heading text-4xl font-bold text-white">
                    {userName || "Peregrino"}
                  </h1>
                </div>
              </div>

              {verse && (
                <motion.div 
                  className="glass-card rounded-2xl p-6 max-w-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <p className="text-white/90 text-lg italic leading-relaxed">
                    "{verse.text}"
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-white/60 text-sm font-medium">— {verse.reference}</p>
                    <DailyShareButton 
                      tipo="versiculo" 
                      title="Compartir"
                      fallbackText={verse.text}
                      size="sm"
                      variant="ghost"
                      className="text-white/60 hover:text-white hover:bg-white/10"
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Right: Quick Stats */}
            {stats && (
              <motion.div 
                className="col-span-5 flex gap-4 justify-end"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {/* Streak */}
                <motion.div 
                  className="glass-card rounded-2xl p-5 min-w-[140px] text-center"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{stats.streak}</p>
                  <p className="text-white/60 text-sm">días de racha</p>
                </motion.div>

                {/* Level */}
                <motion.div 
                  className="glass-card rounded-2xl p-5 min-w-[140px] text-center"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <Trophy className="w-8 h-8 text-secondary mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{stats.level}</p>
                  <p className="text-white/60 text-sm">nivel</p>
                </motion.div>

                {/* Points */}
                <motion.div 
                  className="glass-card rounded-2xl p-5 min-w-[140px] text-center"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <Zap className="w-8 h-8 text-secondary mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{stats.points}</p>
                  <p className="text-white/60 text-sm">puntos</p>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
