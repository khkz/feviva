import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartHandshake, 
  MessageCircle, 
  Hammer, 
  Baby, 
  Church, 
  HandHeart,
  Sparkles,
  Trophy,
  Check
} from 'lucide-react';
import { useUserStats } from '@/hooks/useUserStats';
import { useToast } from '@/hooks/use-toast';

interface Quest {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  basePoints: number;
  multiplier: number;
  category: 'servicio' | 'relacion' | 'trabajo';
}

const QUESTS: Quest[] = [
  {
    id: 'visitar-enfermo',
    title: 'Visitar a un enfermo',
    description: 'Dedica tiempo a alguien que sufre. Lleva tu presencia, no tu teléfono.',
    icon: HeartHandshake,
    basePoints: 15,
    multiplier: 3,
    category: 'servicio',
  },
  {
    id: 'charla-sin-pantallas',
    title: 'Charla de 30 min sin pantallas',
    description: 'Una conversación real, mirando a los ojos, sin notificaciones.',
    icon: MessageCircle,
    basePoints: 15,
    multiplier: 3,
    category: 'relacion',
  },
  {
    id: 'trabajo-manual',
    title: 'Hacer un trabajo manual',
    description: 'Cocinar, reparar, limpiar, crear con tus manos. La IA no puede hacer esto por ti.',
    icon: Hammer,
    basePoints: 15,
    multiplier: 3,
    category: 'trabajo',
  },
  {
    id: 'jugar-hijos',
    title: 'Jugar con un niño 1 hora',
    description: 'Sin tablets. Juegos de mesa, parque, imaginación pura.',
    icon: Baby,
    basePoints: 15,
    multiplier: 3,
    category: 'relacion',
  },
  {
    id: 'misa-presencial',
    title: 'Asistir a Misa presencialmente',
    description: 'No basta el streaming. El Cuerpo de Cristo se recibe en persona.',
    icon: Church,
    basePoints: 15,
    multiplier: 3,
    category: 'servicio',
  },
  {
    id: 'acto-caridad',
    title: 'Acto de caridad anónimo',
    description: 'Haz algo por alguien sin que se entere. Sin foto. Sin post.',
    icon: HandHeart,
    basePoints: 15,
    multiplier: 3,
    category: 'servicio',
  },
];

const STORAGE_KEY = 'hyper-human-quests';

interface CompletedQuests {
  date: string;
  ids: string[];
}

export function HyperHumanQuests() {
  const [completed, setCompleted] = useState<string[]>([]);
  const { addPoints } = useUserStats();
  const { toast } = useToast();

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const stored: CompletedQuests = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (stored.date === today) {
        setCompleted(stored.ids || []);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, ids: [] }));
      }
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, ids: [] }));
    }
  }, []);

  const handleComplete = async (quest: Quest) => {
    if (completed.includes(quest.id)) return;

    const newCompleted = [...completed, quest.id];
    setCompleted(newCompleted);
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, ids: newCompleted }));

    const totalPoints = quest.basePoints * quest.multiplier;
    await addPoints(totalPoints, `🤲 Misión física: ${quest.title} (×3 XP)`);

    toast({
      title: `🏆 +${totalPoints} XP (×3 multiplicador)`,
      description: `"${quest.title}" — Lo hiper-humano vale triple.`,
    });
  };

  const totalEarned = completed.length * 45; // 15 * 3

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-2 h-8 rounded-full bg-gradient-to-b from-amber-400 to-rose-500" />
        <div>
          <h2 className="font-orbitron text-2xl md:text-3xl font-bold text-white">
            Paso 3: Lo Hiper-Humano
          </h2>
          <p className="text-gray-400 text-sm">La IA procesa datos, pero no puede amar. Tú sí.</p>
        </div>
      </div>

      {/* XP multiplier badge */}
      <div className="flex items-center gap-4 mb-6 ml-5">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/30">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-amber-300 text-sm font-bold">×3 XP</span>
          <span className="text-gray-400 text-sm">por misión física</span>
        </div>
        {totalEarned > 0 && (
          <div className="flex items-center gap-1.5 text-emerald-400 text-sm">
            <Trophy className="w-4 h-4" />
            <span className="font-medium">+{totalEarned} XP hoy</span>
          </div>
        )}
      </div>

      {/* Quests grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {QUESTS.map((quest, i) => {
          const Icon = quest.icon;
          const isDone = completed.includes(quest.id);
          return (
            <motion.button
              key={quest.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              whileHover={!isDone ? { scale: 1.02 } : {}}
              whileTap={!isDone ? { scale: 0.98 } : {}}
              onClick={() => handleComplete(quest)}
              disabled={isDone}
              className={`relative text-left rounded-2xl border p-5 transition-all duration-300 ${
                isDone
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-slate-700/50 bg-slate-800/30 hover:border-amber-400/40 hover:bg-slate-800/60'
              }`}
            >
              {/* 3x badge */}
              <div className="absolute top-3 right-3">
                {isDone ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                  </motion.div>
                ) : (
                  <div className="px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/30">
                    <span className="text-amber-400 text-[10px] font-bold">×3</span>
                  </div>
                )}
              </div>

              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                isDone ? 'bg-emerald-500/10' : 'bg-slate-700/50'
              }`}>
                <Icon className={`w-5 h-5 ${isDone ? 'text-emerald-400' : 'text-amber-400'}`} />
              </div>

              {/* Text */}
              <h3 className={`font-semibold text-base mb-1 ${isDone ? 'text-emerald-300' : 'text-white'}`}>
                {quest.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{quest.description}</p>

              {/* Points */}
              <div className="mt-3 flex items-center gap-2">
                <span className={`text-xs font-medium ${isDone ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isDone ? `+${quest.basePoints * quest.multiplier} XP ganados` : `+${quest.basePoints * quest.multiplier} XP`}
                </span>
                {!isDone && (
                  <span className="text-[10px] text-gray-600 line-through">
                    +{quest.basePoints} XP normal
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Philosophy note */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 text-center"
      >
        <p className="text-gray-500 text-sm italic">
          "El mundo real es el activo más valioso. Por eso las misiones físicas valen <span className="text-amber-400 font-semibold">triple</span>."
        </p>
        <p className="text-gray-600 text-xs mt-1">— Regla de gamificación de El Continente Digital</p>
      </motion.div>
    </motion.div>
  );
}
