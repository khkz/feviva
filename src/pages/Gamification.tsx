import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";
import { LevelDisplay } from "@/components/gamification/LevelDisplay";
import { AchievementsDisplay } from "@/components/gamification/AchievementsDisplay";
import { StatsOverview } from "@/components/gamification/StatsOverview";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

const Gamification = () => {
  const navigate = useNavigate();
  const {
    stats,
    achievements,
    userAchievements,
    loading,
    getPointsForNextLevel,
    getProgressToNextLevel,
  } = useUserStats();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Cargando estadísticas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full">
      <DesktopSidebar />
      <div className="flex-1 lg:ml-64 pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Dashboard
        </Button>

        <h1 className="text-4xl font-bold mb-8">Tu Progreso</h1>

        <div className="space-y-8">
          <LevelDisplay
            nivel={stats.nivel}
            puntos_totales={stats.puntos_totales}
            puntosParaSiguienteNivel={getPointsForNextLevel()}
            progreso={getProgressToNextLevel()}
          />

          <StatsOverview
            debates_completados={stats.debates_completados}
            lecciones_completadas={stats.lecciones_completadas}
            racha_actual_dias={stats.racha_actual_dias}
            racha_maxima_dias={stats.racha_maxima_dias}
          />

          <AchievementsDisplay
            achievements={achievements}
            userAchievements={userAchievements}
          />
        </div>
      </div>
      <BottomNavigation />
      </div>
    </div>
  );
};

export default Gamification;
