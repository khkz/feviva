import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Flame, CheckCircle2, Sparkles } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useUserStats } from '@/hooks/useUserStats';
import { useToast } from '@/hooks/use-toast';

interface DietItem {
  id: string;
  label: string;
  description: string;
  points: number;
}

const DIET_ITEMS: DietItem[] = [
  {
    id: 'no-doomscrolling',
    label: 'Sin doomscrolling',
    description: 'Hoy no consumí noticias catastróficas ni scrolleé sin propósito.',
    points: 5,
  },
  {
    id: 'silenciar-ira',
    label: 'Silencié la ira',
    description: 'Silencié o dejé de seguir una cuenta que me generaba ira o ansiedad.',
    points: 5,
  },
  {
    id: 'contenido-edifica',
    label: 'Contenido que edifica',
    description: 'Consumí solo contenido que edifica mi mente y mi espíritu.',
    points: 5,
  },
];

const STORAGE_KEY = 'elrugido-diet-';

function getTodayKey(): string {
  return STORAGE_KEY + new Date().toISOString().split('T')[0];
}

function getStreakKey(): string {
  return 'elrugido-diet-streak';
}

function loadChecks(): Record<string, boolean> {
  try {
    const saved = localStorage.getItem(getTodayKey());
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function loadStreak(): number {
  try {
    const data = localStorage.getItem(getStreakKey());
    if (!data) return 0;
    const { count, lastDate } = JSON.parse(data);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (lastDate === today) return count;
    if (lastDate === yesterday) return count;
    return 0;
  } catch {
    return 0;
  }
}

export function AlgorithmicDiet() {
  const [checks, setChecks] = useState<Record<string, boolean>>(loadChecks);
  const [streak, setStreak] = useState(loadStreak);
  const [celebrated, setCelebrated] = useState(false);
  const { addPoints } = useUserStats();
  const { toast } = useToast();

  const completedCount = DIET_ITEMS.filter(item => checks[item.id]).length;
  const allCompleted = completedCount === DIET_ITEMS.length;
  const alreadyRewarded = !!localStorage.getItem(getTodayKey() + '-rewarded');

  useEffect(() => {
    localStorage.setItem(getTodayKey(), JSON.stringify(checks));
  }, [checks]);

  useEffect(() => {
    if (allCompleted && !alreadyRewarded && !celebrated) {
      setCelebrated(true);
      localStorage.setItem(getTodayKey() + '-rewarded', 'true');

      // Update streak
      const today = new Date().toISOString().split('T')[0];
      const streakData = localStorage.getItem(getStreakKey());
      let newStreak = 1;
      if (streakData) {
        const { count, lastDate } = JSON.parse(streakData);
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (lastDate === yesterday) newStreak = count + 1;
        else if (lastDate === today) newStreak = count;
      }
      localStorage.setItem(getStreakKey(), JSON.stringify({ count: newStreak, lastDate: today }));
      setStreak(newStreak);

      addPoints(15, '🧘 Dieta algorítmica completada');
    }
  }, [allCompleted, alreadyRewarded, celebrated, addPoints]);

  const handleCheck = useCallback((id: string, checked: boolean) => {
    if (alreadyRewarded) return; // Already completed today
    setChecks(prev => ({ ...prev, [id]: checked }));
    if (checked) {
      const item = DIET_ITEMS.find(i => i.id === id);
      if (item) {
        toast({ title: `+${item.points} puntos`, description: item.label });
      }
    }
  }, [alreadyRewarded, toast]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-8 rounded-full bg-gradient-to-b from-amber-400 to-amber-600" />
        <div>
          <h2 className="font-orbitron text-2xl font-bold text-white">
            Ascesis Digital
          </h2>
          <p className="text-gray-400 text-sm">
            El algoritmo te quiere asustado; Dios te da paz.
          </p>
        </div>
      </div>

      <div className="relative rounded-2xl border border-amber-400/20 bg-slate-900/80 backdrop-blur-md p-6 overflow-hidden">
        {/* Subtle glow background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-transparent to-slate-950/50 pointer-events-none" />

        {/* Streak badge */}
        {streak > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative z-10 flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 w-fit"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-xs font-semibold">
              Racha: {streak} {streak === 1 ? 'día' : 'días'}
            </span>
          </motion.div>
        )}

        {/* Checklist */}
        <div className="relative z-10 space-y-4">
          {DIET_ITEMS.map((item, i) => {
            const isChecked = !!checks[item.id];
            return (
              <motion.label
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                  isChecked
                    ? 'bg-amber-400/10 border-amber-400/30'
                    : 'bg-slate-800/50 border-slate-700/50 hover:border-amber-400/20'
                } ${alreadyRewarded && !isChecked ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(checked) => handleCheck(item.id, !!checked)}
                  disabled={alreadyRewarded && !isChecked}
                  className="mt-0.5 border-amber-400/50 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm ${isChecked ? 'text-amber-400' : 'text-gray-200'}`}>
                      {item.label}
                    </span>
                    <span className="text-[10px] font-mono text-amber-400/60 bg-amber-400/10 px-1.5 py-0.5 rounded">
                      +{item.points} XP
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                {isChecked && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                  </motion.div>
                )}
              </motion.label>
            );
          })}
        </div>

        {/* Completion celebration */}
        <AnimatePresence>
          {allCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="relative z-10 mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-400/30 text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="font-orbitron font-bold text-amber-400">
                  ¡Dieta completada!
                </span>
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-gray-300 text-sm">
                Hoy elegiste la paz sobre el ruido. +15 XP ganados.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        <div className="relative z-10 mt-5">
          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
            <span>Progreso del día</span>
            <span>{completedCount}/{DIET_ITEMS.length}</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / DIET_ITEMS.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
