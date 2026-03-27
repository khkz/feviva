import { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Shield } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";
import { useNovenas } from "@/hooks/useNovenas";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useDailyVerse } from "@/hooks/useDailyVerse";
import { SaintOfTheDayCard } from "@/components/dashboard/SaintOfTheDayCard";
import { SoulTriageHero } from "@/components/triage/SoulTriageHero";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ProgressCard } from "@/components/dashboard/ProgressCard";
import { NextStepCard } from "@/components/dashboard/NextStepCard";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { GospelCard } from "@/components/gospel/GospelCard";
import { FronteraFinalCard } from "@/components/dashboard/FronteraFinalCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

// Lazy load heavy components
const PracticeStreaksCard = lazy(() => import("@/components/dashboard/PracticeStreaksCard").then(m => ({ default: m.PracticeStreaksCard })));
const PracticeRemindersCard = lazy(() => import("@/components/dashboard/PracticeRemindersCard").then(m => ({ default: m.PracticeRemindersCard })));
const NovenaCarousel = lazy(() => import("@/components/dashboard/NovenaCarousel").then(m => ({ default: m.NovenaCarousel })));
const ExploreGrid = lazy(() => import("@/components/dashboard/ExploreGrid").then(m => ({ default: m.ExploreGrid })));
const DailyChallenge = lazy(() => import("@/components/dashboard/DailyChallenge").then(m => ({ default: m.DailyChallenge })));
const FeaturedContent = lazy(() => import("@/components/dashboard/FeaturedContent").then(m => ({ default: m.FeaturedContent })));
const GratitudePrompt = lazy(() => import("@/components/dashboard/GratitudePrompt").then(m => ({ default: m.GratitudePrompt })));
const DailyMission = lazy(() => import("@/components/dashboard/DailyMission").then(m => ({ default: m.DailyMission })));
const DailyRoutineCard = lazy(() => import("@/components/dashboard/DailyRoutineCard").then(m => ({ default: m.DailyRoutineCard })));

interface Profile {
  nombre: string;
  perfil_doctrinal: string;
  edad_segmento: string;
  country_code: string | null;
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
    loadProfile();
  }, []);

  useEffect(() => {
    if (stats) {
      updateStreak();
    }
  }, [stats?.id]);

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("nombre, perfil_doctrinal, edad_segmento, country_code")
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
        <motion.div 
          className="text-secondary"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <BookOpen className="w-12 h-12" />
        </motion.div>
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

          {/* Next Step Card - Prominent Formation Path */}
          <NextStepCard 
            currentLevel={stats?.nivel || 1}
            completedLessons={Math.floor((stats?.puntos_totales || 0) / 100)}
            totalLessons={10}
          />

          {/* Daily Mission */}
          <Suspense fallback={<CardSkeleton height="h-48" />}>
            <DailyMission />
          </Suspense>

          {/* Daily Routine Card - Prayer Playlist */}
          <Suspense fallback={<CardSkeleton height="h-40" />}>
            <DailyRoutineCard />
          </Suspense>

          {/* Quick Actions - Tu Formación */}
          <QuickActions />

          {/* === CONTENIDO DIARIO === */}
          
          {/* Tu Campo de Formación */}
          <section className="px-5 lg:px-0 mb-6">
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">
              Tu Día Espiritual
            </h2>
            
            {/* Mobile: Stack view */}
            <div className="space-y-4 lg:hidden">
              <SaintOfTheDayCard userCountryCode={profile?.country_code} />
              <GospelCard />
              <Suspense fallback={<CardSkeleton height="h-64" />}>
                <FeaturedContent hideTitle />
              </Suspense>
            </div>
            
            {/* Desktop: Grid view */}
            <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
              <div className="lg:col-span-1 space-y-4">
                <SaintOfTheDayCard userCountryCode={profile?.country_code} />
                <GospelCard />
              </div>
              <div className="lg:col-span-2">
                <Suspense fallback={<CardSkeleton height="h-64" />}>
                  <FeaturedContent hideTitle />
                </Suspense>
              </div>
            </div>
          </section>

          {/* === CONTENIDO PRINCIPAL + SIDEBAR === */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-6">
            {/* Columna izquierda - Contenido principal (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Frontera Final - Featured */}
              <section className="px-5 lg:px-0">
                <FronteraFinalCard />
              </section>

              {/* Daily Challenge */}
              <Suspense fallback={<CardSkeleton height="h-48" />}>
                <DailyChallenge />
              </Suspense>

              {/* Explore Grid - Crece en tu Fe */}
              <Suspense fallback={<CardSkeleton height="h-96" />}>
                <ExploreGrid />
              </Suspense>

              {/* Novena Carousel - Continúa tu Camino */}
              <Suspense fallback={<CardSkeleton height="h-64" />}>
                <NovenaCarousel
                  novenas={novenas}
                  getProgress={getProgressForNovena}
                  loading={novenasLoading}
                />
              </Suspense>
            </div>

            {/* Columna derecha - Sidebar Stats (1/3) */}
            <div className="lg:col-span-1 space-y-4 px-5 lg:px-0 mt-6 lg:mt-0">
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
