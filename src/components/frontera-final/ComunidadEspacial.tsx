import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Lock, CheckCircle2 } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  requirement: string;
}

const badges: Badge[] = [
  {
    id: 'mercurio',
    name: 'Explorador Novato',
    description: 'Completaste tu primera actividad espacial',
    icon: '☿️',
    color: '#94a3b8',
    unlocked: true,
    requirement: '1 actividad',
  },
  {
    id: 'marte',
    name: 'Misionero Rojo',
    description: 'Completaste 7 días de oración espacial',
    icon: '🔴',
    color: '#ef4444',
    unlocked: true,
    requirement: '7 días',
  },
  {
    id: 'jupiter',
    name: 'Gigante de Oración',
    description: 'Rezaste el rosario completo 10 veces',
    icon: '♃',
    color: '#f59e0b',
    unlocked: false,
    requirement: '10 rosarios',
  },
  {
    id: 'constelacion',
    name: 'Apologista Cósmico',
    description: 'Dominaste todas las preguntas del Escudo',
    icon: '⭐',
    color: '#8b5cf6',
    unlocked: false,
    requirement: '100% quiz',
  },
];

export function ComunidadEspacial() {
  const [activeExplorers, setActiveExplorers] = useState(342);
  const [radarAngle, setRadarAngle] = useState(0);

  // Simular exploradores activos fluctuando
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveExplorers(prev => prev + Math.floor(Math.random() * 10) - 4);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Animar el radar
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarAngle(prev => (prev + 3) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-8 rounded-full bg-gradient-to-b from-green-400 to-emerald-400" />
        <div>
          <h2 className="font-orbitron text-2xl font-bold text-white">
            Comunidad Galáctica
          </h2>
          <p className="text-gray-400 text-sm">Logros & Conexión</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Radar Widget */}
        <div className="glass-cyber rounded-2xl p-6 border-green-400/30">
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              {/* Radar circles */}
              {[1, 2, 3].map((ring) => (
                <div
                  key={ring}
                  className="absolute rounded-full border border-green-500/20"
                  style={{
                    width: `${ring * 33}%`,
                    height: `${ring * 33}%`,
                    top: `${50 - ring * 16.5}%`,
                    left: `${50 - ring * 16.5}%`,
                  }}
                />
              ))}

              {/* Cross lines */}
              <div className="absolute top-0 left-1/2 w-px h-full bg-green-500/20" />
              <div className="absolute top-1/2 left-0 w-full h-px bg-green-500/20" />

              {/* Radar sweep */}
              <motion.div
                className="absolute top-1/2 left-1/2 w-1/2 h-px origin-left"
                style={{
                  background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.8), transparent)',
                  rotate: radarAngle,
                }}
              />

              {/* Blips (dots representing users) */}
              {[...Array(8)].map((_, i) => {
                const angle = (i * 45 + radarAngle * 0.5) * (Math.PI / 180);
                const distance = 20 + Math.random() * 50;
                const x = 50 + Math.cos(angle) * distance * 0.8;
                const y = 50 + Math.sin(angle) * distance * 0.8;

                return (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-green-400"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                );
              })}

              {/* Center */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-green-400 shadow-lg shadow-green-400/50" />
            </div>
          </div>

          <div className="text-center mt-4">
            <div className="flex items-center justify-center gap-2 text-green-400">
              <Users className="w-5 h-5" />
              <span className="font-orbitron text-2xl font-bold">{activeExplorers}</span>
            </div>
            <p className="text-gray-400 text-sm">Exploradores orando ahora</p>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="glass-cyber rounded-2xl p-6 border-amber-400/30">
          <h3 className="font-orbitron text-lg font-bold text-white mb-4">
            🏅 Tus Medallas
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            {badges.map((badge) => (
              <motion.div
                key={badge.id}
                whileHover={badge.unlocked ? { scale: 1.05 } : {}}
                className={`relative rounded-xl p-4 text-center transition-all ${
                  badge.unlocked
                    ? 'glass-cyber border-2'
                    : 'bg-slate-800/50 border border-slate-700/50 opacity-60'
                }`}
                style={{
                  borderColor: badge.unlocked ? `${badge.color}60` : undefined,
                }}
              >
                {/* Lock overlay for locked badges */}
                {!badge.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 rounded-xl">
                    <Lock className="w-6 h-6 text-slate-500" />
                  </div>
                )}

                {/* Unlocked indicator */}
                {badge.unlocked && (
                  <div className="absolute -top-1 -right-1">
                    <CheckCircle2 
                      className="w-5 h-5" 
                      style={{ color: badge.color }}
                    />
                  </div>
                )}

                <div className="text-3xl mb-2">{badge.icon}</div>
                <p 
                  className="font-orbitron text-xs font-bold mb-1"
                  style={{ color: badge.unlocked ? badge.color : '#64748b' }}
                >
                  {badge.name}
                </p>
                <p className="text-gray-500 text-[10px]">{badge.requirement}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
