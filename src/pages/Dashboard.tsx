import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Shield } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";
import { useNovenas } from "@/hooks/useNovenas";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ProgressCard } from "@/components/dashboard/ProgressCard";
import { NovenaCarousel } from "@/components/dashboard/NovenaCarousel";
import { ExploreGrid } from "@/components/dashboard/ExploreGrid";
import { DailyChallenge } from "@/components/dashboard/DailyChallenge";
import { FeaturedContent } from "@/components/dashboard/FeaturedContent";
import { GratitudePrompt } from "@/components/dashboard/GratitudePrompt";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { Button } from "@/components/ui/button";

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
  const { isAdmin } = useAdminAuth();

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
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <DesktopSidebar 
        userName={profile?.nombre || "Peregrino"}
        userLevel={stats?.nivel || 1}
        userStreak={stats?.racha_actual_dias || 0}
      />

      {/* Main Content - with sidebar offset on desktop */}
      <div className="lg:ml-64 pb-24 lg:pb-8">
        {/* Hero Section with Immersive Background */}
        <HeroSection 
          userName={profile?.nombre || "Peregrino"} 
          verse={dailyVerse}
          stats={stats ? {
            streak: stats.racha_actual_dias,
            level: stats.nivel,
            points: stats.puntos_totales
          } : undefined}
        />

        {/* Main Content Container */}
        <div className="max-w-7xl mx-auto lg:px-8">
          {/* Admin Access Button */}
          {isAdmin && (
            <div className="px-5 py-2 lg:px-0">
              <Button 
                onClick={() => navigate('/admin')}
                variant="outline"
                size="sm"
                className="w-full lg:w-auto border-primary/30 text-primary hover:bg-primary/10"
              >
                <Shield className="w-4 h-4 mr-2" />
                Panel de Administración
              </Button>
            </div>
          )}

          {/* Quick Actions */}
          <QuickActions />

          {/* Desktop: Two column layout for main content */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-6 lg:mt-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2">
              {/* Daily Challenge */}
              <DailyChallenge />

              {/* Featured Content */}
              <FeaturedContent />

              {/* Explore Grid */}
              <ExploreGrid />
            </div>

            {/* Right Column - Sidebar Content */}
            <div className="lg:col-span-1">
              {/* Gratitude Prompt */}
              <GratitudePrompt />

              {/* Progress Card - Hidden on desktop (shown in hero) */}
              <div className="lg:hidden">
                {stats && (
                  <ProgressCard
                    nivel={stats.nivel}
                    puntosTotales={stats.puntos_totales}
                    puntosParaSiguiente={getPointsForNextLevel()}
                    progreso={getProgressToNextLevel()}
                    racha={stats.racha_actual_dias}
                  />
                )}
              </div>

              {/* Desktop-only Progress Card */}
              <div className="hidden lg:block">
                {stats && (
                  <ProgressCard
                    nivel={stats.nivel}
                    puntosTotales={stats.puntos_totales}
                    puntosParaSiguiente={getPointsForNextLevel()}
                    progreso={getProgressToNextLevel()}
                    racha={stats.racha_actual_dias}
                  />
                )}
              </div>

              {/* Novena Carousel */}
              <NovenaCarousel
                novenas={novenas}
                getProgress={getProgressForNovena}
                loading={novenasLoading}
              />
            </div>
          </div>
        </div>

        {/* Bottom Navigation - Mobile only */}
        <BottomNavigation />
      </div>
    </div>
  );
};

export default Dashboard;
