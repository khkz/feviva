import { useState, useEffect, useMemo } from 'react';
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
  ShieldCheck,
  Trophy,
  Brain,
  ArrowLeft,
  Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BentoCard } from '@/components/frontera-final/BentoCard';
import { EscudoVerdad } from '@/components/frontera-final/EscudoVerdad';
import { SpaceGamification } from '@/components/frontera-final/SpaceGamification';
import { ApologeticsQuiz } from '@/components/frontera-final/ApologeticsQuiz';
import { LaboratorioVirtudes } from '@/components/frontera-final/LaboratorioVirtudes';
import { SonidosEspacio } from '@/components/frontera-final/SonidosEspacio';
import { ComunidadEspacial } from '@/components/frontera-final/ComunidadEspacial';
import { WelcomeModal } from '@/components/frontera-final/WelcomeModal';
import { MissionBanner } from '@/components/frontera-final/MissionBanner';
import { FactShareModal } from '@/components/frontera-final/FactShareModal';
import { SpaceShareModal } from '@/components/frontera-final/SpaceShareModal';
import { AlgorithmicDiet } from '@/components/frontera-final/AlgorithmicDiet';
import { getDailyContent, getContentLabel, DailyContent } from '@/lib/fronteraFactsData';
import { Button } from '@/components/ui/button';
import { useRosario } from '@/contexts/RosarioContext';
import { useFronteraProgress } from '@/hooks/useFronteraProgress';
import { useFronteraArticulos, FronteraArticulo } from '@/hooks/useFronteraArticulos';
import { supabase } from '@/integrations/supabase/client';

const iconMap: Record<string, LucideIcon> = {
  BookOpen, Atom, Infinity: InfinityIcon, HelpCircle,
  Telescope, Flag, Cpu,
};

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

const CATEGORY_META: Record<string, { subtitle: string; color: string }> = {
  'Cosmos y Credo': { subtitle: 'Teología', color: 'cyan' },
  'Gigantes de la Fe': { subtitle: 'Historia', color: 'amber' },
  'Ética del Futuro': { subtitle: 'Moral', color: 'purple' },
};

function articulosToCategories(articulos: FronteraArticulo[]): Category[] {
  const grouped: Record<string, CategoryCard[]> = {};
  for (const a of articulos) {
    if (!grouped[a.categoria_grupo]) grouped[a.categoria_grupo] = [];
    grouped[a.categoria_grupo].push({
      id: a.id,
      title: a.titulo,
      description: a.descripcion,
      icon: iconMap[a.icon_name] || Atom,
      size: 'normal',
      href: `/frontera-final/${a.id}`,
    });
  }
  return Object.entries(grouped).map(([title, cards]) => ({
    title,
    subtitle: CATEGORY_META[title]?.subtitle || '',
    color: CATEGORY_META[title]?.color || 'cyan',
    cards,
  }));
}

// Static fallback
const fallbackCategories: Category[] = [
  {
    title: "Cosmos y Credo", subtitle: "Teología", color: "cyan",
    cards: [
      { id: "libro-naturaleza", title: "El Libro de la Naturaleza", description: "Por qué estudiar galaxias es leer la mente de Dios.", icon: BookOpen, size: "normal", href: "/frontera-final/libro-naturaleza" },
      { id: "ajuste-fino", title: "El Ajuste Fino del Universo", description: "Por qué las constantes físicas sugieren un cosmos diseñado.", icon: Atom, size: "normal", href: "/frontera-final/ajuste-fino" },
      { id: "punto-omega", title: "El Punto Omega", description: "La teoría de Teilhard de Chardin.", icon: InfinityIcon, size: "normal", href: "/frontera-final/punto-omega" },
      { id: "bautizar-extraterrestre", title: "¿Bautizaríamos a un Extraterrestre?", description: "La postura del Vaticano sobre vida inteligente no humana.", icon: HelpCircle, size: "normal", href: "/frontera-final/bautizar-extraterrestre" },
    ]
  },
  {
    title: "Gigantes de la Fe", subtitle: "Historia", color: "amber",
    cards: [
      { id: "padre-big-bang", title: "El Padre del Big Bang", description: "Georges Lemaître: El sacerdote que corrigió a Einstein.", icon: Atom, size: "normal", href: "/frontera-final/padre-big-bang" },
      { id: "observatorio-vaticano", title: "El Observatorio Vaticano", description: "400 años mirando al cielo antes que la NASA.", icon: Telescope, size: "normal", href: "/frontera-final/observatorio-vaticano" },
    ]
  },
  {
    title: "Ética del Futuro", subtitle: "Moral", color: "purple",
    cards: [
      { id: "colonizar-conquistar", title: "Colonizar sin Conquistar", description: "Cómo evitar el pecado del colonialismo en Marte.", icon: Flag, size: "normal", href: "/frontera-final/colonizar-conquistar" },
      { id: "ia-alma", title: "IA y Alma", description: "La diferencia entre inteligencia computacional y espíritu.", icon: Cpu, size: "normal", href: "/frontera-final/ia-alma" },
    ]
  },
];

export default function FronteraFinal() {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isFactShareOpen, setIsFactShareOpen] = useState(false);
  
  // Contenido del día basado en la fecha actual
  const [dailyContent] = useState<DailyContent>(() => getDailyContent());
  
  // Stats for sharing
  const [rosariosCompletados, setRosariosCompletados] = useState(0);
  const [logrosDesbloqueados, setLogrosDesbloqueados] = useState(0);
  const [puntosCósmicos, setPuntosCósmicos] = useState(0);
  
  const { open: openRosario } = useRosario();
  const { markQuizCompleted, progress } = useFronteraProgress();
  const { data: articulosData } = useFronteraArticulos();
  const categories = useMemo(
    () => articulosData ? articulosToCategories(articulosData) : fallbackCategories,
    [articulosData]
  );

  // Fetch user stats
  useEffect(() => {
    const fetchStats = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return;

      try {
        // Count rosarios - use rpc or simple fetch to avoid deep type issue
        const { data: rosarios } = await (supabase
          .from('user_rosario_progress') as any)
          .select('id')
          .eq('user_id', user.id)
          .eq('completed', true);
        
        setRosariosCompletados(rosarios?.length || 0);

        // Count achievements
        const { data: achievements } = await supabase
          .from('user_achievements')
          .select('id')
          .eq('user_id', user.id);
        
        setLogrosDesbloqueados(achievements?.length || 0);

        // Get points
        const { data: stats } = await supabase
          .from('user_stats')
          .select('puntos_totales')
          .eq('user_id', user.id)
          .maybeSingle();
        
        setPuntosCósmicos(stats?.puntos_totales || 0);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <Helmet>
        <title>El Continente Digital - El Rugido</title>
        <meta name="description" content="Manual de Supervivencia y Fe en la Era de la IA. Aprende a no ser reemplazado e inyecta la luz de Cristo en el algoritmo." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        {/* Back button */}
        <Link 
          to="/dashboard" 
          className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Inicio</span>
        </Link>

        {/* Neural network background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Neural nodes */}
          {[...Array(20)].map((_, i) => {
            const x = 10 + (i % 5) * 20 + Math.random() * 10;
            const y = 10 + Math.floor(i / 5) * 25 + Math.random() * 10;
            return (
              <motion.div
                key={`node-${i}`}
                className="absolute w-2 h-2 rounded-full bg-amber-400/30"
                style={{ left: `${x}%`, top: `${y}%` }}
                animate={{
                  opacity: [0.2, 0.6, 0.2],
                  scale: [1, 1.3, 1],
                  boxShadow: [
                    '0 0 4px rgba(251,191,36,0.1)',
                    '0 0 12px rgba(251,191,36,0.4)',
                    '0 0 4px rgba(251,191,36,0.1)',
                  ],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                }}
              />
            );
          })}
          {/* Connecting lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full opacity-10">
            {[...Array(12)].map((_, i) => (
              <motion.line
                key={`line-${i}`}
                x1={`${15 + Math.random() * 70}%`}
                y1={`${10 + Math.random() * 40}%`}
                x2={`${15 + Math.random() * 70}%`}
                y2={`${10 + Math.random() * 40}%`}
                stroke="rgb(251,191,36)"
                strokeWidth="0.5"
                animate={{ opacity: [0.1, 0.4, 0.1] }}
                transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
              />
            ))}
          </svg>
        </div>

        {/* HERO SECTION */}
        <section className="relative min-h-[50vh] flex flex-col items-center justify-center px-4 pt-16 pb-8">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-950/10 via-transparent to-transparent" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-6"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(251,191,36,0.2)',
                    '0 0 40px rgba(251,191,36,0.4)',
                    '0 0 20px rgba(251,191,36,0.2)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/30 flex items-center justify-center"
              >
                <ShieldCheck className="w-10 h-10 text-amber-400" />
              </motion.div>
            </motion.div>

            <h1 className="font-orbitron text-4xl md:text-6xl font-bold text-white mb-4 tracking-wide leading-tight">
              <span className="bg-gradient-to-r from-amber-400 via-white to-amber-400 bg-clip-text text-transparent">
                El Continente Digital
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg md:text-xl text-gray-400 font-light tracking-wide mb-2"
            >
              Manual de Supervivencia y Fe en la Era de la IA
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-sm text-gray-500 max-w-lg mx-auto"
            >
              No dejes que el algoritmo piense por ti. Aprende a ser libre e inyecta la luz de Cristo en cada byte.
            </motion.p>
          </motion.div>
        </section>

        {/* ALGORITHMIC DIET */}
        <section className="relative z-10 px-4 md:px-8 py-8 max-w-7xl mx-auto">
          <AlgorithmicDiet />
        </section>

        {/* MISSION BANNER */}
        <section className="relative z-10 px-4 md:px-8 max-w-3xl mx-auto -mt-4 mb-8">
          <MissionBanner onRosarioClick={openRosario} />
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
              onClick={openRosario}
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

          {/* LABORATORIO DE VIRTUDES */}
          <LaboratorioVirtudes />

          {/* SONIDOS DEL ESPACIO */}
          <SonidosEspacio />
        </section>

        {/* COMUNIDAD GALÁCTICA */}
        <section className="relative z-10 px-4 md:px-8 py-12 max-w-5xl mx-auto">
          <ComunidadEspacial />
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

          {/* Quiz Button */}
          <div className="mt-8 text-center">
            <Button
              onClick={() => setIsQuizOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-orbitron"
              size="lg"
            >
              <Brain className="w-5 h-5 mr-2" />
              Probar Quiz de Apologética
            </Button>
          </div>
        </section>

        {/* Progress indicator */}
        {progress.progressPercentage > 0 && (
          <section className="relative z-10 px-4 md:px-8 py-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-cyber rounded-2xl p-6 border-cyan-400/20"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm">Tu progreso espacial</span>
                <span className="text-cyan-400 font-orbitron text-sm">{progress.progressPercentage}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.progressPercentage}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <div className="flex justify-between mt-3 text-xs text-gray-500">
                <span>{progress.articlesRead.length}/7 artículos</span>
                <span>{progress.rosarioCompleted ? '✓' : '○'} Rosario</span>
                <span>{progress.quizCompleted ? '✓' : '○'} Quiz</span>
              </div>
              
              {/* Share button */}
              <Button
                onClick={() => setIsShareModalOpen(true)}
                className="w-full mt-4 bg-gradient-to-r from-amber-500 to-cyan-500 hover:from-amber-600 hover:to-cyan-600 text-white font-orbitron"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartir mi Viaje Cósmico
              </Button>
            </motion.div>
          </section>
        )}

        {/* Bottom spacing */}
        <div className="h-24" />
      </div>

      {/* Welcome Modal - First time visitors */}
      <WelcomeModal />

      {/* Quiz Modal */}
      <ApologeticsQuiz
        isOpen={isQuizOpen}
        onClose={() => {
          setIsQuizOpen(false);
          markQuizCompleted();
        }}
      />

      {/* Space Share Modal */}
      <SpaceShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        rosariosCompletados={rosariosCompletados}
        logrosDesbloqueados={logrosDesbloqueados}
        totalLogros={6}
        puntosCósmicos={puntosCósmicos}
        articulosLeidos={progress.articlesRead.length}
      />

      {/* Fact Share Modal */}
      <FactShareModal
        isOpen={isFactShareOpen}
        onClose={() => setIsFactShareOpen(false)}
        content={dailyContent}
      />
    </>
  );
}
