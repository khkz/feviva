import { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Shield } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";
import { useNovenas } from "@/hooks/useNovenas";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useDailyVerse } from "@/hooks/useDailyVerse";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ProgressCard } from "@/components/dashboard/ProgressCard";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { GospelCard } from "@/components/gospel/GospelCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load heavy components
const PracticeStreaksCard = lazy(() => import("@/components/dashboard/PracticeStreaksCard").then(m => ({ default: m.PracticeStreaksCard })));
const PracticeRemindersCard = lazy(() => import("@/components/dashboard/PracticeRemindersCard").then(m => ({ default: m.PracticeRemindersCard })));
const NovenaCarousel = lazy(() => import("@/components/dashboard/NovenaCarousel").then(m => ({ default: m.NovenaCarousel })));
const ExploreGrid = lazy(() => import("@/components/dashboard/ExploreGrid").then(m => ({ default: m.ExploreGrid })));
const DailyChallenge = lazy(() => import("@/components/dashboard/DailyChallenge").then(m => ({ default: m.DailyChallenge })));
const FeaturedContent = lazy(() => import("@/components/dashboard/FeaturedContent").then(m => ({ default: m.FeaturedContent })));
const GratitudePrompt = lazy(() => import("@/components/dashboard/GratitudePrompt").then(m => ({ default: m.GratitudePrompt })));

interface Profile {
  nombre: string;
  perfil_doctrinal: string;
  edad_segmento: string;
}

const CardSkeleton = ({ height = "h-40" }: { height?: string }) => (
  <div className="mb-4">
    <Skeleton className={`${height} w-full rounded-xl`} />
  </div>
);

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
  const dailyVerse = useDailyVerse();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (stats) {
      updateStreak();
    }
  }, [stats?.id]);

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
            <div className="lg:col-span-2 space-y-4">
              {/* Daily Challenge */}
              <Suspense fallback={<CardSkeleton height="h-48" />}>
                <DailyChallenge />
              </Suspense>

              {/* Featured Content */}
              <Suspense fallback={<CardSkeleton height="h-64" />}>
                <FeaturedContent />
              </Suspense>

              {/* Explore Grid */}
              <Suspense fallback={<CardSkeleton height="h-48" />}>
                <ExploreGrid />
              </Suspense>
            </div>

            {/* Right Column - Sidebar Content */}
            <div className="lg:col-span-1 space-y-4">
              {/* Gospel Card - Desktop only, prominent position */}
              <div className="hidden lg:block">
                <GospelCard />
              </div>

              {/* Gospel Card - Mobile compact version */}
              <div className="lg:hidden px-5">
                <GospelCard compact />
              </div>

              {/* Gratitude Prompt */}
              <Suspense fallback={<CardSkeleton height="h-24" />}>
                <GratitudePrompt />
              </Suspense>

              {/* Practice Streaks */}
              <Suspense fallback={<CardSkeleton height="h-32" />}>
                <PracticeStreaksCard />
              </Suspense>

              {/* Practice Reminders */}
              <Suspense fallback={<CardSkeleton height="h-32" />}>
                <PracticeRemindersCard />
              </Suspense>

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
              <Suspense fallback={<CardSkeleton height="h-48" />}>
                <NovenaCarousel
                  novenas={novenas}
                  getProgress={getProgressForNovena}
                  loading={novenasLoading}
                />
              </Suspense>
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
