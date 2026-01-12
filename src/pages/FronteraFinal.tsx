import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { 
  BookOpen, 
  Infinity as InfinityIcon, 
  HelpCircle, 
  Atom, 
  Telescope, 
  Flag, 
  Cpu, 
  PlayCircle,
  Sparkles,
  Shield,
  Rocket,
  Trophy
} from 'lucide-react';
import { BentoCard } from '@/components/frontera-final/BentoCard';
import { EscudoVerdad } from '@/components/frontera-final/EscudoVerdad';
import { RosarioInterstellar } from '@/components/frontera-final/RosarioInterstellar';
import { SpaceGamification } from '@/components/frontera-final/SpaceGamification';

interface CategoryCard {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  size: 'normal' | 'large';
  href?: string;
}

interface Category {
  title: string;
  subtitle: string;
  color: string;
  cards: CategoryCard[];
}

const categories: Category[] = [
  {
    title: "Cosmos y Credo",
    subtitle: "Teología",
    color: "cyan",
    cards: [
      {
        id: "libro-naturaleza",
        title: "El Libro de la Naturaleza",
        description: "Por qué estudiar galaxias es leer la mente de Dios.",
        icon: BookOpen,
        size: "normal",
        href: "/frontera-final/libro-naturaleza",
      },
      {
        id: "punto-omega",
        title: "El Punto Omega",
        description: "La teoría de Teilhard de Chardin: El universo evoluciona hacia Cristo.",
        icon: InfinityIcon,
        size: "normal",
        href: "/frontera-final/punto-omega",
      },
      {
        id: "bautizar-extraterrestre",
        title: "¿Bautizaríamos a un Extraterrestre?",
        description: "La postura del Vaticano sobre vida inteligente no humana.",
        icon: HelpCircle,
        size: "normal",
        href: "/frontera-final/bautizar-extraterrestre",
      },
    ]
  },
  {
    title: "Gigantes de la Fe",
    subtitle: "Historia",
    color: "amber",
    cards: [
      {
        id: "padre-big-bang",
        title: "El Padre del Big Bang",
        description: "Georges Lemaître: El sacerdote que corrigió a Einstein.",
        icon: Atom,
        size: "normal",
        href: "/frontera-final/padre-big-bang",
      },
      {
        id: "observatorio-vaticano",
        title: "El Observatorio Vaticano",
        description: "400 años mirando al cielo antes que la NASA.",
        icon: Telescope,
        size: "normal",
        href: "/frontera-final/observatorio-vaticano",
      },
    ]
  },
  {
    title: "Ética del Futuro",
    subtitle: "Moral",
    color: "purple",
    cards: [
      {
        id: "colonizar-conquistar",
        title: "Colonizar sin Conquistar",
        description: "Cómo evitar el pecado del colonialismo en Marte.",
        icon: Flag,
        size: "normal",
        href: "/frontera-final/colonizar-conquistar",
      },
      {
        id: "ia-alma",
        title: "IA y Alma",
        description: "La diferencia entre inteligencia computacional y espíritu.",
        icon: Cpu,
        size: "normal",
        href: "/frontera-final/ia-alma",
      },
    ]
  },
];

const floatingFacts = [
  "¿Sabías que un sacerdote católico propuso el Big Bang? - Georges Lemaître",
  "El Observatorio Vaticano fue fundado en 1891, décadas antes que la NASA",
  "35 cráteres lunares llevan nombres de científicos jesuitas",
  "Nicolás Copérnico era canónigo de la Iglesia Católica",
];

export default function FronteraFinal() {
  const [isRosarioOpen, setIsRosarioOpen] = useState(false);
  const [currentFact] = useState(() => 
    floatingFacts[Math.floor(Math.random() * floatingFacts.length)]
  );

  return (
    <>
      <Helmet>
        <title>Frontera Final - El Rugido</title>
        <meta name="description" content="Donde la Fe conquista el Vacío. Explora la intersección entre ciencia, cosmos y catolicismo." />
      </Helmet>

      <div className="min-h-screen cyber-sacra-bg relative overflow-hidden">
        {/* Noise overlay */}
        <div className="noise-overlay absolute inset-0 pointer-events-none" />
        
        {/* Animated stars background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* HERO SECTION */}
        <section className="relative min-h-[50vh] flex flex-col items-center justify-center px-4 pt-16 pb-8">
          {/* Nebula gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/30 via-purple-950/20 to-transparent" />
          
          {/* Orbital rings decoration */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div 
              className="w-[600px] h-[600px] border border-cyan-400/10 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute w-[400px] h-[400px] border border-amber-400/10 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute w-[200px] h-[200px] border border-purple-400/10 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-4"
            >
              <Rocket className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
            </motion.div>

            <h1 className="font-orbitron text-5xl md:text-7xl font-bold text-white mb-4 tracking-wider">
              <span className="bg-gradient-to-r from-cyan-400 via-white to-amber-400 bg-clip-text text-transparent glow-cyan-text">
                FRONTERA FINAL
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl md:text-2xl text-gray-300 font-light tracking-wide"
            >
              Donde la Fe conquista el Vacío
            </motion.p>
          </motion.div>

          {/* Floating Fact Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="relative z-10 mt-12"
          >
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="glass-cyber rounded-2xl p-6 max-w-md mx-auto border-amber-400/30"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Dato del Día
                  </p>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    {currentFact}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* BENTO GRID DASHBOARD */}
        <section className="relative z-10 px-4 md:px-8 py-12 max-w-7xl mx-auto">
          {categories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: categoryIndex * 0.1, duration: 0.6 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-2 h-8 rounded-full ${
                  category.color === 'cyan' ? 'bg-cyan-400' :
                  category.color === 'amber' ? 'bg-amber-400' :
                  'bg-purple-400'
                }`} />
                <div>
                  <h2 className="font-orbitron text-2xl font-bold text-white">
                    {category.title}
                  </h2>
                  <p className="text-gray-400 text-sm">{category.subtitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.cards.map((card, cardIndex) => (
                  <BentoCard
                    key={card.id}
                    {...card}
                    color={category.color}
                    delay={cardIndex * 0.1}
                  />
                ))}
              </div>
            </motion.div>
          ))}

          {/* Oratorio Orbital - Featured Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 rounded-full bg-gradient-to-b from-amber-400 to-cyan-400" />
              <div>
                <h2 className="font-orbitron text-2xl font-bold text-white">
                  Oratorio Orbital
                </h2>
                <p className="text-gray-400 text-sm">Espiritualidad</p>
              </div>
            </div>

            <motion.button
              onClick={() => setIsRosarioOpen(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full md:w-auto glass-cyber rounded-2xl p-8 border-amber-400/40 hover:border-amber-400/60 transition-all duration-300 group cursor-pointer text-left"
            >
              <div className="flex items-center gap-6">
                <div className="relative">
                  <motion.div
                    animate={{ 
                      boxShadow: [
                        "0 0 20px rgba(251, 191, 36, 0.3)",
                        "0 0 40px rgba(251, 191, 36, 0.5)",
                        "0 0 20px rgba(251, 191, 36, 0.3)",
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center"
                  >
                    <PlayCircle className="w-10 h-10 text-slate-900" />
                  </motion.div>
                </div>
                <div>
                  <h3 className="font-orbitron text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                    Rosario Interestelar
                  </h3>
                  <p className="text-gray-300 text-lg">
                    Reza contemplando la creación. Una experiencia de oración cósmica.
                  </p>
                </div>
              </div>
            </motion.button>
          </motion.div>
        </section>

        {/* GAMIFICACIÓN ESPACIAL */}
        <section className="relative z-10 px-4 md:px-8 py-12 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <Trophy className="w-12 h-12 mx-auto text-amber-400 mb-4" />
            <h2 className="font-orbitron text-3xl font-bold text-white mb-2">
              Logros Espaciales
            </h2>
            <p className="text-gray-400">Tu progreso en la conquista cósmica</p>
          </motion.div>

          <SpaceGamification />
        </section>

        {/* ESCUDO DE LA VERDAD - FAQ */}
        <section className="relative z-10 px-4 md:px-8 py-12 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <Shield className="w-12 h-12 mx-auto text-amber-400 mb-4" />
            <h2 className="font-orbitron text-3xl font-bold text-white mb-2">
              Escudo de la Verdad
            </h2>
            <p className="text-gray-400">Apologética para la era espacial</p>
          </motion.div>

          <EscudoVerdad />
        </section>

        {/* Bottom spacing */}
        <div className="h-24" />
      </div>

      {/* Rosario Modal */}
      <RosarioInterstellar 
        isOpen={isRosarioOpen} 
        onClose={() => setIsRosarioOpen(false)} 
      />
    </>
  );
}