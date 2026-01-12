import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Rocket, BookOpen, Shield, Sparkles, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SpaceAchievement {
  id: string;
  name: string;
  description: string;
  icon: 'star' | 'rocket' | 'book' | 'shield' | 'trophy';
  requirement: number;
  type: 'rosarios' | 'articulos' | 'preguntas';
  planet: string;
  color: string;
  unlocked: boolean;
}

const spaceAchievements: Omit<SpaceAchievement, 'unlocked'>[] = [
  // Rosarios
  { id: 'mercurio', name: 'Explorador de Mercurio', description: 'Completa tu primer rosario interestelar', icon: 'rocket', requirement: 1, type: 'rosarios', planet: 'Mercurio', color: '#94a3b8' },
  { id: 'venus', name: 'Peregrino de Venus', description: 'Completa 5 rosarios interestelares', icon: 'star', requirement: 5, type: 'rosarios', planet: 'Venus', color: '#fbbf24' },
  { id: 'tierra', name: 'Guardián de la Tierra', description: 'Completa 10 rosarios interestelares', icon: 'shield', requirement: 10, type: 'rosarios', planet: 'Tierra', color: '#22c55e' },
  { id: 'marte', name: 'Misionero de Marte', description: 'Completa 25 rosarios interestelares', icon: 'rocket', requirement: 25, type: 'rosarios', planet: 'Marte', color: '#ef4444' },
  { id: 'jupiter', name: 'Conquistador de Júpiter', description: 'Completa 50 rosarios interestelares', icon: 'trophy', requirement: 50, type: 'rosarios', planet: 'Júpiter', color: '#f97316' },
  { id: 'saturno', name: 'Señor de los Anillos', description: 'Completa 100 rosarios interestelares', icon: 'trophy', requirement: 100, type: 'rosarios', planet: 'Saturno', color: '#eab308' },
  
  // Artículos
  { id: 'lector-estelar', name: 'Lector Estelar', description: 'Lee tu primer artículo', icon: 'book', requirement: 1, type: 'articulos', planet: 'Luna', color: '#a1a1aa' },
  { id: 'explorador-cosmico', name: 'Explorador Cósmico', description: 'Lee todos los artículos de Frontera Final', icon: 'book', requirement: 7, type: 'articulos', planet: 'Nebulosa', color: '#8b5cf6' },
  
  // Preguntas FAQ
  { id: 'buscador', name: 'Buscador de Verdad', description: 'Explora 5 preguntas del Escudo de la Verdad', icon: 'shield', requirement: 5, type: 'preguntas', planet: 'Asteroide', color: '#06b6d4' },
  { id: 'apologista', name: 'Apologista Cósmico', description: 'Explora todas las preguntas del Escudo', icon: 'shield', requirement: 12, type: 'preguntas', planet: 'Constelación', color: '#a855f7' },
];

const iconMap = {
  star: Star,
  rocket: Rocket,
  book: BookOpen,
  shield: Shield,
  trophy: Trophy,
};

export function SpaceGamification() {
  const [achievements, setAchievements] = useState<SpaceAchievement[]>([]);
  const [stats, setStats] = useState({
    rosarios: 0,
    articulos: 0,
    preguntas: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Count rosarios
      const { count: rosarioCount } = await supabase
        .from('user_rosario_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('completado', true);

      // For articles and questions, we'll use localStorage for now
      const articlesRead = JSON.parse(localStorage.getItem('frontera_articles_read') || '[]').length;
      const questionsExplored = JSON.parse(localStorage.getItem('frontera_questions_explored') || '[]').length;

      const newStats = {
        rosarios: rosarioCount || 0,
        articulos: articlesRead,
        preguntas: questionsExplored,
      };

      setStats(newStats);

      // Calculate achievements
      const computedAchievements = spaceAchievements.map(achievement => ({
        ...achievement,
        unlocked: newStats[achievement.type] >= achievement.requirement,
      }));

      setAchievements(computedAchievements);
      setLoading(false);
    };

    loadStats();
  }, []);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements.filter(a => a.unlocked).reduce((acc, a) => acc + a.requirement * 10, 0);

  if (loading) {
    return (
      <div className="glass-cyber rounded-2xl p-8 border-amber-400/30 animate-pulse">
        <div className="h-8 bg-slate-700 rounded w-1/2 mx-auto mb-4" />
        <div className="h-4 bg-slate-700 rounded w-1/3 mx-auto" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Stats Overview */}
      <div className="glass-cyber rounded-2xl p-6 border-amber-400/30">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-amber-400" />
          <h3 className="font-orbitron text-xl font-bold text-white">
            Tu Viaje Cósmico
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-orbitron font-bold text-cyan-400">
              {stats.rosarios}
            </div>
            <div className="text-xs text-gray-400">Rosarios</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-orbitron font-bold text-amber-400">
              {stats.articulos}
            </div>
            <div className="text-xs text-gray-400">Artículos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-orbitron font-bold text-purple-400">
              {stats.preguntas}
            </div>
            <div className="text-xs text-gray-400">Preguntas</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            {unlockedCount} de {achievements.length} logros
          </span>
          <span className="text-amber-400 font-medium">
            {totalPoints} puntos cósmicos
          </span>
        </div>

        <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-cyan-400 via-amber-400 to-purple-400 rounded-full"
          />
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {achievements.map((achievement, index) => {
          const IconComponent = iconMap[achievement.icon];
          
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`glass-cyber rounded-xl p-4 border transition-all ${
                achievement.unlocked
                  ? 'border-amber-400/40 hover:border-amber-400/60'
                  : 'border-white/10 opacity-60'
              }`}
            >
              <div className="text-center">
                <div 
                  className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center relative"
                  style={{ 
                    backgroundColor: achievement.unlocked ? `${achievement.color}20` : '#1e293b',
                  }}
                >
                  {achievement.unlocked ? (
                    <IconComponent 
                      className="w-6 h-6" 
                      style={{ color: achievement.color }}
                    />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-600" />
                  )}
                  
                  {achievement.unlocked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center"
                    >
                      <Star className="w-3 h-3 text-slate-900" />
                    </motion.div>
                  )}
                </div>

                <h4 className={`font-medium text-xs mb-1 ${
                  achievement.unlocked ? 'text-white' : 'text-gray-500'
                }`}>
                  {achievement.name}
                </h4>
                
                <p className="text-[10px] text-gray-500 mb-2">
                  {achievement.planet}
                </p>

                {!achievement.unlocked && (
                  <div className="text-[10px] text-gray-600">
                    {stats[achievement.type]}/{achievement.requirement}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}