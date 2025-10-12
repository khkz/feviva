import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserStats {
  id: string;
  user_id: string;
  nivel: number;
  puntos_totales: number;
  debates_completados: number;
  lecciones_completadas: number;
  tarjetas_estudiadas: number;
  racha_actual_dias: number;
  racha_maxima_dias: number;
  ultima_actividad: string | null;
}

interface Achievement {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  icono: string;
  categoria: string;
  puntos_requeridos: number | null;
  debates_requeridos: number | null;
  lecciones_requeridas: number | null;
  racha_requerida: number | null;
}

interface UserAchievement {
  achievement_id: string;
  desbloqueado_en: string;
}

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
    fetchAchievements();
    fetchUserAchievements();
  }, []);

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let { data, error } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code === "PGRST116") {
      // No stats yet, create initial stats
      const { data: newStats, error: insertError } = await supabase
        .from("user_stats")
        .insert({ user_id: user.id })
        .select()
        .single();

      if (!insertError) {
        data = newStats;
      }
    }

    if (data) {
      setStats(data);
    }
    setLoading(false);
  };

  const fetchAchievements = async () => {
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .order("categoria");

    if (!error && data) {
      setAchievements(data);
    }
  };

  const fetchUserAchievements = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("user_achievements")
      .select("achievement_id, desbloqueado_en")
      .eq("user_id", user.id);

    if (!error && data) {
      setUserAchievements(data);
    }
  };

  const addPoints = async (points: number, reason: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !stats) return;

    const newPoints = stats.puntos_totales + points;
    const oldLevel = stats.nivel;
    const newLevel = calculateLevel(newPoints);

    const { error } = await supabase
      .from("user_stats")
      .update({
        puntos_totales: newPoints,
        nivel: newLevel,
        ultima_actividad: new Date().toISOString().split('T')[0],
      })
      .eq("user_id", user.id);

    if (!error) {
      setStats({ ...stats, puntos_totales: newPoints, nivel: newLevel });
      
      toast({
        title: `+${points} puntos`,
        description: reason,
      });

      if (newLevel > oldLevel) {
        toast({
          title: "¡Subiste de nivel!",
          description: `Ahora eres nivel ${newLevel}`,
        });
      }

      await checkAchievements();
    }
  };

  const incrementDebates = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !stats) return;

    const newCount = stats.debates_completados + 1;

    const { error } = await supabase
      .from("user_stats")
      .update({
        debates_completados: newCount,
        ultima_actividad: new Date().toISOString().split('T')[0],
      })
      .eq("user_id", user.id);

    if (!error) {
      setStats({ ...stats, debates_completados: newCount });
      await addPoints(20, "Debate completado");
      await checkAchievements();
    }
  };

  const incrementLessons = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !stats) return;

    const newCount = stats.lecciones_completadas + 1;

    const { error } = await supabase
      .from("user_stats")
      .update({
        lecciones_completadas: newCount,
        ultima_actividad: new Date().toISOString().split('T')[0],
      })
      .eq("user_id", user.id);

    if (!error) {
      setStats({ ...stats, lecciones_completadas: newCount });
      await addPoints(10, "Lección completada");
      await checkAchievements();
    }
  };

  const updateStreak = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !stats) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActivity = stats.ultima_actividad;

    let newStreak = stats.racha_actual_dias;
    let newMaxStreak = stats.racha_maxima_dias;

    if (!lastActivity) {
      newStreak = 1;
    } else {
      const lastDate = new Date(lastActivity);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak = stats.racha_actual_dias + 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    }

    if (newStreak > newMaxStreak) {
      newMaxStreak = newStreak;
    }

    const { error } = await supabase
      .from("user_stats")
      .update({
        racha_actual_dias: newStreak,
        racha_maxima_dias: newMaxStreak,
        ultima_actividad: today,
      })
      .eq("user_id", user.id);

    if (!error) {
      setStats({ 
        ...stats, 
        racha_actual_dias: newStreak, 
        racha_maxima_dias: newMaxStreak,
        ultima_actividad: today 
      });
      await checkAchievements();
    }
  };

  const checkAchievements = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !stats) return;

    for (const achievement of achievements) {
      const alreadyUnlocked = userAchievements.some(
        ua => ua.achievement_id === achievement.id
      );

      if (alreadyUnlocked) continue;

      let shouldUnlock = false;

      if (achievement.debates_requeridos && stats.debates_completados >= achievement.debates_requeridos) {
        shouldUnlock = true;
      } else if (achievement.lecciones_requeridas && stats.lecciones_completadas >= achievement.lecciones_requeridas) {
        shouldUnlock = true;
      } else if (achievement.racha_requerida && stats.racha_actual_dias >= achievement.racha_requerida) {
        shouldUnlock = true;
      } else if (achievement.puntos_requeridos && stats.puntos_totales >= achievement.puntos_requeridos) {
        shouldUnlock = true;
      }

      if (shouldUnlock) {
        const { error } = await supabase
          .from("user_achievements")
          .insert({
            user_id: user.id,
            achievement_id: achievement.id,
          });

        if (!error) {
          toast({
            title: `🎉 ¡Logro desbloqueado!`,
            description: `${achievement.icono} ${achievement.nombre}: ${achievement.descripcion}`,
          });

          setUserAchievements([
            ...userAchievements,
            { achievement_id: achievement.id, desbloqueado_en: new Date().toISOString() }
          ]);
        }
      }
    }
  };

  const calculateLevel = (points: number): number => {
    if (points < 100) return 1;
    if (points < 300) return 2;
    if (points < 600) return 3;
    if (points < 1000) return 4;
    return 5 + Math.floor((points - 1000) / 500);
  };

  const getPointsForNextLevel = (): number => {
    if (!stats) return 100;
    const level = stats.nivel;
    if (level === 1) return 100;
    if (level === 2) return 300;
    if (level === 3) return 600;
    if (level === 4) return 1000;
    return 1000 + ((level - 4) * 500);
  };

  const getProgressToNextLevel = (): number => {
    if (!stats) return 0;
    const currentPoints = stats.puntos_totales;
    const nextLevelPoints = getPointsForNextLevel();
    const previousLevelPoints = stats.nivel === 1 ? 0 :
      stats.nivel === 2 ? 100 :
      stats.nivel === 3 ? 300 :
      stats.nivel === 4 ? 600 :
      1000 + ((stats.nivel - 5) * 500);
    
    const progress = ((currentPoints - previousLevelPoints) / (nextLevelPoints - previousLevelPoints)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return {
    stats,
    achievements,
    userAchievements,
    loading,
    addPoints,
    incrementDebates,
    incrementLessons,
    updateStreak,
    getPointsForNextLevel,
    getProgressToNextLevel,
    refreshStats: fetchStats,
  };
};
