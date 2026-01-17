import { BookOpen, Sun, Moon, CloudSun, Flame, GraduationCap, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { DailyShareButton } from "@/components/shared/DailyShareButton";
import lionLogo from "@/assets/logo-elrugido.svg";

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
    return { text: "Buenos días, Apologista", subtext: "Prepárate para dar razón de tu fe", icon: Sun, gradient: "from-secondary to-secondary-hover" };
  } else if (hour >= 12 && hour < 19) {
    return { text: "Continúa tu formación", subtext: "El conocimiento fortalece la fe", icon: CloudSun, gradient: "from-secondary to-amber-600" };
  } else {
    return { text: "Reflexiona y prepárate", subtext: "La sabiduría viene de la meditación", icon: Moon, gradient: "from-indigo-400 to-secondary" };
  }
};

const getDefenderRank = (level: number) => {
  if (level <= 2) return { title: "El Curioso", icon: BookOpen };
  if (level <= 5) return { title: "El Estudiante", icon: BookOpen };
  if (level <= 10) return { title: "El Practicante", icon: MessageSquare };
  if (level <= 20) return { title: "El Apologista", icon: GraduationCap };
  return { title: "El Maestro", icon: GraduationCap };
};

export function HeroSection({ userName, verse, stats }: HeroSectionProps) {
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;
  const rank = stats ? getDefenderRank(stats.level) : null;

  return (
    <section className="relative overflow-hidden lg:min-h-[380px]">
      {/* Intense Dark Gradient Background with Golden Glow */}
      <div className="absolute inset-0 hero-rugido">
        {/* Animated particles/sparks */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-secondary rounded-full"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Content - Different layouts for mobile and desktop */}
      <div className="relative z-10 h-full">
        {/* Mobile Layout */}
        <div className="lg:hidden h-[38vh] min-h-[300px] flex flex-col justify-end p-5 pb-6">
          {/* Animated Lion Logo with Voice Waves */}
          <motion.div 
            className="absolute top-5 left-5 flex items-center gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              {/* Voice wave rings */}
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border border-secondary/40"
                  animate={{
                    scale: [1, 1.8, 2.2],
                    opacity: [0.5, 0.2, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.6,
                  }}
                />
              ))}
              <motion.div 
                className="relative w-12 h-12 p-1.5 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/30"
                animate={{ 
                  boxShadow: ["0 0 15px hsla(45, 95%, 58%, 0.3)", "0 0 25px hsla(45, 95%, 58%, 0.5)", "0 0 15px hsla(45, 95%, 58%, 0.3)"]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <img src={lionLogo} alt="El Rugido" className="w-full h-full" />
              </motion.div>
            </div>
            <span className="text-white/90 font-heading font-bold text-lg">El Rugido</span>
          </motion.div>

          {/* Greeting Card */}
          <motion.div 
            className="glass-card rounded-2xl p-4 mb-3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${greeting.gradient} flex items-center justify-center`}>
                  <GreetingIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="font-heading text-lg font-bold text-white">
                    {userName || "Apologista"}
                  </h1>
                  <p className="text-white/60 text-xs">{greeting.subtext}</p>
                </div>
              </div>
              
              {/* Mini Stats */}
              {stats && (
                <div className="flex gap-1.5">
                  <motion.div 
                    className="glass-button rounded-full px-2.5 py-1 flex items-center gap-1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-xs font-semibold text-white">{stats.streak}</span>
                  </motion.div>
                  <motion.div 
                    className="glass-button rounded-full px-2.5 py-1 flex items-center gap-1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-secondary" />
                    <span className="text-xs font-semibold text-white">{stats.level}</span>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Verse with 1 Pedro 3:15 emphasis */}
          {verse && (
            <motion.div 
              className="glass-card rounded-xl p-3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <p className="text-white/90 text-sm italic leading-relaxed line-clamp-3">
                "{verse.text}"
              </p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-secondary/80 text-xs font-medium">— {verse.reference}</p>
                <DailyShareButton 
                  tipo="versiculo" 
                  title=""
                  directContent={{
                    mainText: verse.text,
                    reference: verse.reference
                  }}
                  size="sm"
                  variant="ghost"
                  className="h-6 text-white/60 hover:text-white hover:bg-white/10 text-xs gap-1"
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
                {/* Animated Lion with Voice Waves */}
                <div className="relative">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 rounded-full border border-secondary/30"
                      animate={{
                        scale: [1, 2, 2.5],
                        opacity: [0.4, 0.15, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.7,
                      }}
                    />
                  ))}
                  <motion.div 
                    className="relative w-16 h-16 p-2 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/40"
                    animate={{ 
                      boxShadow: ["0 0 20px hsla(45, 95%, 58%, 0.3)", "0 0 35px hsla(45, 95%, 58%, 0.5)", "0 0 20px hsla(45, 95%, 58%, 0.3)"]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <img src={lionLogo} alt="El Rugido" className="w-full h-full" />
                  </motion.div>
                </div>
                
                <div>
                  <p className="text-secondary/90 text-sm font-medium">{greeting.text}</p>
                  <h1 className="font-heading text-4xl font-bold text-white">
                    {userName || "Apologista"}
                  </h1>
                  <p className="text-white/50 text-sm mt-1">{greeting.subtext}</p>
                </div>
              </div>

              {verse && (
                <motion.div 
                  className="glass-card rounded-2xl p-6 max-w-xl border-secondary/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <p className="text-white/90 text-lg italic leading-relaxed">
                    "{verse.text}"
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-secondary/80 text-sm font-medium">— {verse.reference}</p>
                    <DailyShareButton 
                      tipo="versiculo" 
                      title="Compartir"
                      directContent={{
                        mainText: verse.text,
                        reference: verse.reference
                      }}
                      size="sm"
                      variant="ghost"
                      className="text-white/60 hover:text-white hover:bg-white/10"
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Right: Stats with Academic Theme */}
            {stats && (
              <motion.div 
                className="col-span-5 flex gap-4 justify-end"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {/* Study Streak */}
                <motion.div 
                  className="glass-card rounded-2xl p-5 min-w-[140px] text-center border-orange-500/20"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{stats.streak}</p>
                  <p className="text-white/60 text-sm">días de estudio</p>
                </motion.div>

                {/* Preparation Level */}
                <motion.div 
                  className="glass-card rounded-2xl p-5 min-w-[140px] text-center border-secondary/20"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <GraduationCap className="w-8 h-8 text-secondary mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{stats.level}</p>
                  <p className="text-white/60 text-sm">{rank?.title}</p>
                </motion.div>

                {/* XP */}
                <motion.div 
                  className="glass-card rounded-2xl p-5 min-w-[140px] text-center border-secondary/20"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <BookOpen className="w-8 h-8 text-secondary mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{stats.points}</p>
                  <p className="text-white/60 text-sm">XP aprendizaje</p>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}