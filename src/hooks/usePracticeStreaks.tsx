import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PracticeStreak {
  practice: string;
  label: string;
  icon: string;
  currentStreak: number;
  maxStreak: number;
  lastActivity: string | null;
  todayCompleted: boolean;
}

interface StreakAchievement {
  id: string;
  codigo: string;
  nombre: string;
  icono: string;
  racha_requerida: number;
  categoria: string;
}

interface StreakMedal {
  practice: string;
  practiceLabel: string;
  practiceIcon: string;
  currentStreak: number;
  maxStreak: number;
  medals: {
    days: number;
    name: string;
    icon: string;
    unlocked: boolean;
    unlockedAt?: string;
  }[];
}

export const usePracticeStreaks = () => {
  const [streaks, setStreaks] = useState<PracticeStreak[]>([]);
  const [medals, setMedals] = useState<StreakMedal[]>([]);
  const [totalUnlocked, setTotalUnlocked] = useState(0);
  const [totalMedals, setTotalMedals] = useState(0);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const practiceCategories: Record<string, { label: string; icon: string; achievementCategory: string }> = {
    rosario: { label: "Rosario", icon: "🙏", achievementCategory: "racha_rosario" },
    examen: { label: "Examen", icon: "🌙", achievementCategory: "racha_examen" },
    laudes: { label: "Laudes", icon: "☀️", achievementCategory: "racha_laudes" },
    biblia: { label: "Biblia", icon: "📖", achievementCategory: "racha_biblia" },
    gratitud: { label: "Gratitud", icon: "❤️", achievementCategory: "racha_gratitud" },
  };

  const calculateStreak = (dates: string[]): { current: number; max: number } => {
    if (!dates || dates.length === 0) return { current: 0, max: 0 };

    const sortedDates = [...new Set(dates)].sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    for (const dateStr of sortedDates) {
      const date = new Date(dateStr);
      
      if (lastDate === null) {
        // First date - check if it's today or yesterday
        if (dateStr === today || dateStr === yesterday) {
          tempStreak = 1;
          currentStreak = 1;
        } else {
          tempStreak = 1;
          currentStreak = 0; // Streak broken
        }
      } else {
        const diffDays = Math.floor((lastDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
          if (currentStreak > 0) currentStreak = tempStreak;
        } else {
          maxStreak = Math.max(maxStreak, tempStreak);
          tempStreak = 1;
        }
      }
      
      lastDate = date;
    }

    maxStreak = Math.max(maxStreak, tempStreak);
    
    return { current: currentStreak, max: maxStreak };
  };

  const fetchMedals = useCallback(async (practiceData: PracticeStreak[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch streak achievements
    const { data: achievements } = await supabase
      .from("achievements")
      .select("*")
      .like("categoria", "racha_%");

    // Fetch user's unlocked achievements
    const { data: userAchievements } = await supabase
      .from("user_achievements")
      .select("achievement_id, desbloqueado_en")
      .eq("user_id", user.id);

    const unlockedMap = new Map(
      userAchievements?.map(ua => [ua.achievement_id, ua.desbloqueado_en]) || []
    );

    const medalsData: StreakMedal[] = [];
    let unlocked = 0;
    let total = 0;

    for (const [practice, config] of Object.entries(practiceCategories)) {
      const practiceStreak = practiceData.find(p => p.practice === practice);
      const practiceAchievements = achievements?.filter(
        a => a.categoria === config.achievementCategory
      ) || [];

      const practiceMedals = practiceAchievements.map(a => {
        const isUnlocked = unlockedMap.has(a.id);
        if (isUnlocked) unlocked++;
        total++;

        return {
          days: a.racha_requerida || 0,
          name: a.nombre,
          icon: a.icono,
          unlocked: isUnlocked,
          unlockedAt: isUnlocked ? unlockedMap.get(a.id) : undefined,
        };
      }).sort((a, b) => a.days - b.days);

      medalsData.push({
        practice,
        practiceLabel: config.label,
        practiceIcon: config.icon,
        currentStreak: practiceStreak?.currentStreak || 0,
        maxStreak: practiceStreak?.maxStreak || 0,
        medals: practiceMedals,
      });
    }

    setMedals(medalsData);
    setTotalUnlocked(unlocked);
    setTotalMedals(total);
  }, []);

  const checkAndUnlockMedals = useCallback(async (practiceData: PracticeStreak[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch streak achievements
    const { data: achievements } = await supabase
      .from("achievements")
      .select("*")
      .like("categoria", "racha_%");

    // Fetch user's unlocked achievements
    const { data: userAchievements } = await supabase
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", user.id);

    const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);

    for (const practice of practiceData) {
      const config = practiceCategories[practice.practice];
      if (!config) continue;

      const practiceAchievements = achievements?.filter(
        a => a.categoria === config.achievementCategory
      ) || [];

      for (const achievement of practiceAchievements) {
        if (unlockedIds.has(achievement.id)) continue;

        // Check if user qualifies (use maxStreak for unlocking)
        if (practice.maxStreak >= (achievement.racha_requerida || 0)) {
          const { error } = await supabase
            .from("user_achievements")
            .insert({
              user_id: user.id,
              achievement_id: achievement.id,
            });

          if (!error) {
            toast({
              title: `🏅 ¡Medalla desbloqueada!`,
              description: `${achievement.icono} ${achievement.nombre}: ${achievement.descripcion}`,
            });
            unlockedIds.add(achievement.id);
          }
        }
      }
    }
  }, [toast]);

  const fetchStreaks = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const practiceData: PracticeStreak[] = [];

    // Rosario - from user_rosario_progress
    const { data: rosarioData } = await supabase
      .from("user_rosario_progress")
      .select("fecha, completado")
      .eq("user_id", user.id)
      .eq("completado", true)
      .order("fecha", { ascending: false });

    const rosarioDates = rosarioData?.map(r => r.fecha) || [];
    const rosarioStreak = calculateStreak(rosarioDates);
    practiceData.push({
      practice: "rosario",
      label: "Rosario",
      icon: "🙏",
      currentStreak: rosarioStreak.current,
      maxStreak: rosarioStreak.max,
      lastActivity: rosarioDates[0] || null,
      todayCompleted: rosarioDates.includes(today),
    });

    // Examen de Conciencia - from user_rituals (ritual_nocturno_completado)
    const { data: examenData } = await supabase
      .from("user_rituals")
      .select("fecha, ritual_nocturno_completado")
      .eq("user_id", user.id)
      .eq("ritual_nocturno_completado", true)
      .order("fecha", { ascending: false });

    const examenDates = examenData?.map(r => r.fecha) || [];
    const examenStreak = calculateStreak(examenDates);
    practiceData.push({
      practice: "examen",
      label: "Examen",
      icon: "🌙",
      currentStreak: examenStreak.current,
      maxStreak: examenStreak.max,
      lastActivity: examenDates[0] || null,
      todayCompleted: examenDates.includes(today),
    });

    // Laudes - from user_rituals (ritual_matutino_completado)
    const { data: laudesData } = await supabase
      .from("user_rituals")
      .select("fecha, ritual_matutino_completado")
      .eq("user_id", user.id)
      .eq("ritual_matutino_completado", true)
      .order("fecha", { ascending: false });

    const laudesDates = laudesData?.map(r => r.fecha) || [];
    const laudesStreak = calculateStreak(laudesDates);
    practiceData.push({
      practice: "laudes",
      label: "Laudes",
      icon: "☀️",
      currentStreak: laudesStreak.current,
      maxStreak: laudesStreak.max,
      lastActivity: laudesDates[0] || null,
      todayCompleted: laudesDates.includes(today),
    });

    // Lectura Bíblica - from user_bible_progress
    const { data: bibleData } = await supabase
      .from("user_bible_progress")
      .select("ultima_lectura, racha_actual")
      .eq("user_id", user.id)
      .single();

    practiceData.push({
      practice: "biblia",
      label: "Biblia",
      icon: "📖",
      currentStreak: bibleData?.racha_actual || 0,
      maxStreak: bibleData?.racha_actual || 0,
      lastActivity: bibleData?.ultima_lectura || null,
      todayCompleted: bibleData?.ultima_lectura === today,
    });

    // Gratitud - from gratitude_entries
    const { data: gratitudData } = await supabase
      .from("gratitude_entries")
      .select("fecha")
      .eq("user_id", user.id)
      .order("fecha", { ascending: false });

    const gratitudDates = gratitudData?.map(r => r.fecha) || [];
    const gratitudStreak = calculateStreak(gratitudDates);
    practiceData.push({
      practice: "gratitud",
      label: "Gratitud",
      icon: "❤️",
      currentStreak: gratitudStreak.current,
      maxStreak: gratitudStreak.max,
      lastActivity: gratitudDates[0] || null,
      todayCompleted: gratitudDates.includes(today),
    });

    setStreaks(practiceData);
    
    // Check and unlock any new medals
    await checkAndUnlockMedals(practiceData);
    
    // Fetch medals data
    await fetchMedals(practiceData);
    
    setLoading(false);
  }, [fetchMedals, checkAndUnlockMedals]);

  useEffect(() => {
    fetchStreaks();
  }, [fetchStreaks]);

  const getPendingPractices = useCallback(() => {
    return streaks.filter(s => !s.todayCompleted);
  }, [streaks]);

  const getTotalActiveStreaks = useCallback(() => {
    return streaks.filter(s => s.currentStreak > 0).length;
  }, [streaks]);

  return {
    streaks,
    medals,
    totalUnlocked,
    totalMedals,
    loading,
    refreshStreaks: fetchStreaks,
    getPendingPractices,
    getTotalActiveStreaks,
  };
};
