import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Shield, BookOpen, Crown, Star, Sparkles, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSalmos } from '@/contexts/SalmosContext';

interface BiblicalRank {
  id: string;
  name: string;
  description: string;
  icon: 'eye' | 'shield' | 'book' | 'crown';
  requirement: {
    meditaciones?: number;
    articulos?: number;
  };
  color: string;
  unlocked: boolean;
}

const biblicalRanks: Omit<BiblicalRank, 'unlocked'>[] = [
  { 
    id: 'observador', 
    name: 'Observador de la Creación', 
    description: 'Completa tu primera meditación en Salmos Orbitales', 
    icon: 'eye', 
    requirement: { meditaciones: 1 }, 
    color: '#94a3b8'  // Gris plata
  },
  { 
    id: 'guardian', 
    name: 'Guardián del Edén', 
    description: 'Completa 5 meditaciones + lee 3 artículos', 
    icon: 'shield', 
    requirement: { meditaciones: 5, articulos: 3 }, 
    color: '#22c55e'  // Verde
  },
  { 
    id: 'explorador', 
    name: 'Explorador del Verbo', 
    description: 'Completa 10 meditaciones + lee todos los artículos', 
    icon: 'book', 
    requirement: { meditaciones: 10, articulos: 7 }, 
    color: '#3b82f6'  // Azul
  },
  { 
    id: 'leon', 
    name: 'León de Judá', 
    description: 'Completa todo el contenido de Frontera Final', 
    icon: 'crown', 
    requirement: { meditaciones: 25, articulos: 7 }, 
    color: '#f59e0b'  // Dorado
  },
];

const iconMap = {
  eye: Eye,
  shield: Shield,
  book: BookOpen,
  crown: Crown,
};

export function SpaceGamification() {
  const [ranks, setRanks] = useState<BiblicalRank[]>([]);
  const [stats, setStats] = useState({
    meditaciones: 0,
    articulos: 0,
    preguntas: 0,
  });
  const [loading, setLoading] = useState(true);
  const { totalProgress } = useSalmos?.() || { totalProgress: 0 };

  useEffect(() => {
    const loadStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get meditation count from context or localStorage
      const meditationCount = totalProgress || 
        parseInt(localStorage.getItem('frontera_meditations_completed') || '0');

      // For articles and questions, use localStorage
      const articlesRead = JSON.parse(localStorage.getItem('frontera_articles_read') || '[]').length;
      const questionsExplored = JSON.parse(localStorage.getItem('frontera_questions_explored') || '[]').length;

      const newStats = {
        meditaciones: meditationCount,
        articulos: articlesRead,
        preguntas: questionsExplored,
      };

      setStats(newStats);

      // Calculate ranks
      const computedRanks = biblicalRanks.map(rank => {
        const meditacionesReq = rank.requirement.meditaciones || 0;
        const articulosReq = rank.requirement.articulos || 0;
        
        const meditacionesMet = newStats.meditaciones >= meditacionesReq;
        const articulosMet = newStats.articulos >= articulosReq;
        
        return {
          ...rank,
          unlocked: meditacionesMet && articulosMet,
        };
      });

      setRanks(computedRanks);
      setLoading(false);
    };

    loadStats();
  }, [totalProgress]);

  const currentRank = [...ranks].reverse().find(r => r.unlocked) || null;
  const nextRank = ranks.find(r => !r.unlocked) || null;
  const unlockedCount = ranks.filter(r => r.unlocked).length;

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
              {stats.meditaciones}
            </div>
            <div className="text-xs text-gray-400">Meditaciones</div>
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

        {/* Current Rank Display */}
        {currentRank && (
          <div className="glass-cyber rounded-xl p-4 border-amber-400/20 mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${currentRank.color}20` }}
              >
                {(() => {
                  const IconComponent = iconMap[currentRank.icon];
                  return <IconComponent className="w-6 h-6" style={{ color: currentRank.color }} />;
                })()}
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Tu Rango Actual</p>
                <p className="font-orbitron font-bold" style={{ color: currentRank.color }}>
                  {currentRank.name}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress to next rank */}
        {nextRank && (
          <div className="text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Próximo rango:</span>
              <span className="text-white font-medium">{nextRank.name}</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(unlockedCount / ranks.length) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-cyan-400 via-amber-400 to-purple-400 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {nextRank.requirement.meditaciones && stats.meditaciones < nextRank.requirement.meditaciones && (
                <span>Necesitas {nextRank.requirement.meditaciones - stats.meditaciones} meditaciones más. </span>
              )}
              {nextRank.requirement.articulos && stats.articulos < nextRank.requirement.articulos && (
                <span>Necesitas {nextRank.requirement.articulos - stats.articulos} artículos más.</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Ranks Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ranks.map((rank, index) => {
          const IconComponent = iconMap[rank.icon];
          
          return (
            <motion.div
              key={rank.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-cyber rounded-xl p-4 border transition-all ${
                rank.unlocked
                  ? 'border-amber-400/40 hover:border-amber-400/60'
                  : 'border-white/10 opacity-60'
              }`}
            >
              <div className="text-center">
                <div 
                  className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center relative"
                  style={{ 
                    backgroundColor: rank.unlocked ? `${rank.color}20` : '#1e293b',
                  }}
                >
                  {rank.unlocked ? (
                    <IconComponent 
                      className="w-7 h-7" 
                      style={{ color: rank.color }}
                    />
                  ) : (
                    <Lock className="w-6 h-6 text-gray-600" />
                  )}
                  
                  {rank.unlocked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center"
                    >
                      <Star className="w-3 h-3 text-slate-900" />
                    </motion.div>
                  )}
                </div>

                <h4 className={`font-orbitron font-bold text-sm mb-1 ${
                  rank.unlocked ? 'text-white' : 'text-gray-500'
                }`}>
                  {rank.name}
                </h4>
                
                <p className="text-[10px] text-gray-500">
                  {rank.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}