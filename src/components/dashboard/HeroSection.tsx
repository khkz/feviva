import { Sparkles, Sword, Shield, Flame, Trophy, Zap, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { DailyShareButton } from "@/components/shared/DailyShareButton";
import LogoElRugido from "@/assets/logo-elrugido.svg";

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
    return { text: "¡Levántate, Defensor!", icon: Sword, gradient: "from-rugido-gold to-rugido-fire" };
  } else if (hour >= 12 && hour < 19) {
    return { text: "¡Continúa la Batalla!", icon: Shield, gradient: "from-rugido-fire to-rugido-blood" };
  } else {
    return { text: "¡Vigila tu Fe!", icon: Crown, gradient: "from-rugido-blood to-rugido-dark" };
  }
};

export function HeroSection({ userName, verse, stats }: HeroSectionProps) {
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  return (
    <section className="relative overflow-hidden lg:min-h-[380px]">
      {/* Dark Battle Background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-rugido-dark via-rugido-blood/40 to-rugido-dark"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Animated energy particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-rugido-gold/70"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -80],
              x: [0, (Math.random() - 0.5) * 40],
              opacity: [0, 1, 0],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Lion Roar Ripples - Center effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 rounded-full border-2 border-rugido-gold/30"
            animate={{
              scale: [1, 3],
              opacity: [0.4, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Gradient Overlay for readability */}
      <div className="glass-hero-defender absolute inset-0" />

      {/* Content */}
      <div className="relative z-10 h-full">
        {/* Mobile Layout */}
        <div className="lg:hidden h-[40vh] min-h-[320px] flex flex-col justify-end p-5 pb-6">
          {/* Logo with Roar Animation */}
          <motion.div 
            className="absolute top-5 left-5 flex items-center gap-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div 
              className="relative"
              animate={{
                filter: ["drop-shadow(0 0 8px hsla(45, 95%, 58%, 0.3))", "drop-shadow(0 0 16px hsla(45, 95%, 58%, 0.6))", "drop-shadow(0 0 8px hsla(45, 95%, 58%, 0.3))"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <img src={LogoElRugido} alt="El Rugido" className="w-10 h-10" />
            </motion.div>
            <span className="text-rugido-gold font-heading font-bold text-lg">ElRugido</span>
          </motion.div>

          {/* Greeting Card with Battle Stats */}
          <motion.div 
            className="bg-rugido-dark/80 backdrop-blur-lg border border-rugido-gold/30 rounded-2xl p-4 mb-3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div 
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${greeting.gradient} flex items-center justify-center glow-lion`}
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <GreetingIcon className="w-5 h-5 text-rugido-dark" />
                </motion.div>
                <div>
                  <p className="text-rugido-gold/80 text-xs font-semibold uppercase tracking-wide">{greeting.text}</p>
                  <h1 className="font-heading text-xl font-bold text-white">
                    {userName || "Defensor"}
                  </h1>
                </div>
              </div>
              
              {/* Battle Stats Badges */}
              {stats && (
                <div className="flex gap-1.5">
                  <motion.div 
                    className="bg-rugido-fire/20 border border-rugido-fire/30 rounded-full px-2.5 py-1 flex items-center gap-1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Flame className="w-3.5 h-3.5 text-rugido-fire" />
                    <span className="text-xs font-bold text-rugido-fire">{stats.streak}</span>
                  </motion.div>
                  <motion.div 
                    className="bg-rugido-gold/20 border border-rugido-gold/30 rounded-full px-2.5 py-1 flex items-center gap-1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Trophy className="w-3.5 h-3.5 text-rugido-gold" />
                    <span className="text-xs font-bold text-rugido-gold">{stats.level}</span>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Verse - Battle Mode */}
          {verse && (
            <motion.div 
              className="bg-rugido-dark/80 backdrop-blur-lg border border-rugido-gold/20 rounded-xl p-3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <p className="text-white/90 text-sm italic leading-relaxed line-clamp-3">
                "{verse.text}"
              </p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-rugido-gold/70 text-xs font-medium">— {verse.reference}</p>
                <DailyShareButton 
                  tipo="versiculo" 
                  title=""
                  directContent={{
                    mainText: verse.text,
                    reference: verse.reference
                  }}
                  size="sm"
                  variant="ghost"
                  className="h-6 text-rugido-gold/60 hover:text-rugido-gold hover:bg-rugido-gold/10 text-xs gap-1"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex items-end min-h-[380px] p-8 pb-10">
          <div className="flex-1 max-w-7xl mx-auto grid grid-cols-12 gap-8 items-end">
            {/* Left: Greeting & Verse */}
            <motion.div 
              className="col-span-7"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center gap-4 mb-5">
                <motion.div 
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${greeting.gradient} flex items-center justify-center shadow-lg glow-lion`}
                  animate={{ 
                    rotate: [0, -5, 5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <GreetingIcon className="w-7 h-7 text-rugido-dark" />
                </motion.div>
                <div>
                  <p className="text-rugido-gold text-sm font-bold uppercase tracking-wider">{greeting.text}</p>
                  <h1 className="font-heading text-4xl font-bold text-white">
                    {userName || "Defensor"}
                  </h1>
                </div>
              </div>

              {verse && (
                <motion.div 
                  className="bg-rugido-dark/80 backdrop-blur-lg border border-rugido-gold/30 rounded-2xl p-6 max-w-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <p className="text-white/90 text-lg italic leading-relaxed">
                    "{verse.text}"
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-rugido-gold/70 text-sm font-medium">— {verse.reference}</p>
                    <DailyShareButton 
                      tipo="versiculo" 
                      title="Compartir"
                      directContent={{
                        mainText: verse.text,
                        reference: verse.reference
                      }}
                      size="sm"
                      variant="ghost"
                      className="text-rugido-gold/60 hover:text-rugido-gold hover:bg-rugido-gold/10"
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Right: Battle Stats */}
            {stats && (
              <motion.div 
                className="col-span-5 flex gap-4 justify-end"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {/* Días en Guardia (Streak) */}
                <motion.div 
                  className="bg-rugido-dark/80 backdrop-blur-lg border border-rugido-fire/30 rounded-2xl p-5 min-w-[140px] text-center"
                  whileHover={{ scale: 1.02, y: -2, borderColor: "hsla(25, 95%, 53%, 0.5)" }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Flame className="w-8 h-8 text-rugido-fire mx-auto mb-2" />
                  </motion.div>
                  <p className="text-3xl font-bold text-white">{stats.streak}</p>
                  <p className="text-rugido-fire/80 text-sm">días en guardia</p>
                </motion.div>

                {/* Rango (Level) */}
                <motion.div 
                  className="bg-rugido-dark/80 backdrop-blur-lg border border-rugido-gold/30 rounded-2xl p-5 min-w-[140px] text-center"
                  whileHover={{ scale: 1.02, y: -2, borderColor: "hsla(45, 95%, 58%, 0.5)" }}
                >
                  <Trophy className="w-8 h-8 text-rugido-gold mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{stats.level}</p>
                  <p className="text-rugido-gold/80 text-sm">rango defensor</p>
                </motion.div>

                {/* XP (Points) */}
                <motion.div 
                  className="bg-rugido-dark/80 backdrop-blur-lg border border-rugido-gold/30 rounded-2xl p-5 min-w-[140px] text-center"
                  whileHover={{ scale: 1.02, y: -2, borderColor: "hsla(45, 95%, 58%, 0.5)" }}
                >
                  <Zap className="w-8 h-8 text-rugido-gold mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{stats.points}</p>
                  <p className="text-rugido-gold/80 text-sm">XP defensor</p>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
