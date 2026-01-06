import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";
import { useNovenas } from "@/hooks/useNovenas";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ProgressCard } from "@/components/dashboard/ProgressCard";
import { NovenaCarousel } from "@/components/dashboard/NovenaCarousel";
import { ExploreGrid } from "@/components/dashboard/ExploreGrid";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

interface Profile {
  nombre: string;
  perfil_doctrinal: string;
  edad_segmento: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const {
    stats,
    getPointsForNextLevel,
    getProgressToNextLevel,
    updateStreak,
  } = useUserStats();
  
  const { novenas, loading: novenasLoading, getProgressForNovena } = useNovenas();

  useEffect(() => {
    checkAuth();
    updateStreak();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("nombre, perfil_doctrinal, edad_segmento")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
    } else {
      setProfile(data);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">
          <Sparkles className="w-12 h-12" />
        </div>
      </div>
    );
  }

  const dailyVerse = {
    text: "Estén siempre preparados para responder a todo el que les pida razón de la esperanza que hay en ustedes.",
    reference: "1 Pedro 3:15"
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section with Immersive Background */}
      <HeroSection 
        userName={profile?.nombre || "Peregrino"} 
        verse={dailyVerse}
      />

      {/* Quick Actions */}
      <QuickActions />

      {/* Progress Card */}
      {stats && (
        <ProgressCard
          nivel={stats.nivel}
          puntosTotales={stats.puntos_totales}
          puntosParaSiguiente={getPointsForNextLevel()}
          progreso={getProgressToNextLevel()}
          racha={stats.racha_actual_dias}
        />
      )}

      {/* Novena Carousel */}
      <NovenaCarousel
        novenas={novenas}
        getProgress={getProgressForNovena}
        loading={novenasLoading}
      />

      {/* Explore Grid */}
      <ExploreGrid />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Dashboard;
