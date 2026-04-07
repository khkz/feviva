import { useEffect, useState, lazy, Suspense, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Shield } from "lucide-react";
import { FirstDayExperience } from "@/components/ftue/FirstDayExperience";
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
const DailyCapsuleWidget = lazy(() => import("@/components/dashboard/DailyCapsuleWidget").then(m => ({ default: m.DailyCapsuleWidget })));

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
  const [ftueCompleted, setFtueCompleted] = useState(true); // default true to avoid flash
  const {
    stats,
    getPointsForNextLevel,
    getProgressToNextLevel,
    updateStreak,
  } = useUserStats();
  
  const { novenas, loading: novenasLoading, getProgressForNovena } = useNovenas();
  const { isAdmin } = useAdminAuth();
  const dailyVerse = useDailyVerse();

  // Progressive disclosure: determine user maturity level
  const userMaturity = useMemo(() => {
    if (!stats) return 0;
    const streak = stats.racha_actual_dias || 0;
    const points = stats.puntos_totales || 0;
    // Level 0: brand new (0 days), Level 1: day 1-2, Level 2: day 3-6, Level 3: 7+ days
    if (streak === 0 && points < 50) return 0;
    if (streak <= 2) return 1;
    if (streak <= 6) return 2;
    return 3;
  }, [stats]);

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
    
    // Check if user has ever completed the FTUE (stored in localStorage)
    const ftueKey = `ftue_completed_${session.user.id}`;
    const hasCompleted = localStorage.getItem(ftueKey) === "true";
    setFtueCompleted(hasCompleted);
    
    setLoading(false);
  };

  const handleFtueComplete = useCallback(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        localStorage.setItem(`ftue_completed_${session.user.id}`, "true");
      }
    };
    getSession();
    setFtueCompleted(true);
  }, []);

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

  // Show FTUE for brand new users
  if (!ftueCompleted && userMaturity === 0) {
    return (
      <FirstDayExperience
        userName={profile?.nombre?.split(" ")[0] || "Peregrino"}
        onComplete={handleFtueComplete}
      />
    );
  }

  // Show more content as user matures
  const showDailyMission = true; // always
  const showDailyRoutine = true; // always
  const showSaintAndGospel = true; // always (core 3)
  const showQuickActions = true; // always — navigation is essential
  const showSoulTriage = true; // always — emergency kit
  const showFrontera = userMaturity >= 2; // after 3 days
  const showDailyChallenge = userMaturity >= 1;
  const showExploreGrid = userMaturity >= 1;
  const showNovenas = userMaturity >= 2;
  const showGratitude = true; // always
  const showStreaks = userMaturity >= 1;
  const showReminders = userMaturity >= 2;
  const showFeaturedContent = userMaturity >= 1;

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar 
        userName={profile?.nombre || "Peregrino"}
        userLevel={stats?.nivel || 1}
        userStreak={stats?.racha_actual_dias || 0}
      />

      <div className="lg:ml-64 pb-24 lg:pb-8">
        <HeroSection 
          userName={profile?.nombre || "Peregrino"} 
          verse={dailyVerse}
          stats={stats ? {
            streak: stats.racha_actual_dias,
            level: stats.nivel,
            points: stats.puntos_totales
          } : undefined}
        />

        <div className="max-w-7xl mx-auto lg:px-8">
          {/* Admin Access */}
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

          {/* Core 3: Always visible */}
          {showSoulTriage && <SoulTriageHero />}

          <NextStepCard 
            currentLevel={stats?.nivel || 1}
            completedLessons={Math.floor((stats?.puntos_totales || 0) / 100)}
            totalLessons={10}
          />

          {showDailyMission && (
            <Suspense fallback={<CardSkeleton height="h-48" />}>
              <DailyMission />
            </Suspense>
          )}

          {showDailyRoutine && (
            <Suspense fallback={<CardSkeleton height="h-40" />}>
              <DailyRoutineCard />
            </Suspense>
          )}

          {showQuickActions && <QuickActions />}

          {/* Tu Día Espiritual — always visible */}
          {showSaintAndGospel && (
            <section className="px-5 lg:px-0 mb-6">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4">
                Tu Día Espiritual
              </h2>
              
              <div className="space-y-4 lg:hidden">
                <SaintOfTheDayCard userCountryCode={profile?.country_code} />
                <GospelCard />
                {showFeaturedContent && (
                  <Suspense fallback={<CardSkeleton height="h-64" />}>
                    <FeaturedContent hideTitle />
                  </Suspense>
                )}
              </div>
              
              <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
                <div className="lg:col-span-1 space-y-4">
                  <SaintOfTheDayCard userCountryCode={profile?.country_code} />
                  <GospelCard />
                </div>
                <div className="lg:col-span-2">
                  {showFeaturedContent && (
                    <Suspense fallback={<CardSkeleton height="h-64" />}>
                      <FeaturedContent hideTitle />
                    </Suspense>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Progressive content */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-6">
            <div className="lg:col-span-2 space-y-6">
              {showFrontera && (
                <section className="px-5 lg:px-0">
                  <FronteraFinalCard />
                </section>
              )}

              {showDailyChallenge && (
                <Suspense fallback={<CardSkeleton height="h-48" />}>
                  <DailyChallenge />
                </Suspense>
              )}

              {showExploreGrid && (
                <Suspense fallback={<CardSkeleton height="h-96" />}>
                  <ExploreGrid />
                </Suspense>
              )}

              {showNovenas && (
                <Suspense fallback={<CardSkeleton height="h-64" />}>
                  <NovenaCarousel
                    novenas={novenas}
                    getProgress={getProgressForNovena}
                    loading={novenasLoading}
                  />
                </Suspense>
              )}
            </div>

            <div className="lg:col-span-1 space-y-4 px-5 lg:px-0 mt-6 lg:mt-0">
              <Suspense fallback={null}>
                <DailyCapsuleWidget />
              </Suspense>
              {showGratitude && (
                <Suspense fallback={<CardSkeleton height="h-24" />}>
                  <GratitudePrompt />
                </Suspense>
              )}

              {showStreaks && (
                <Suspense fallback={<CardSkeleton height="h-32" />}>
                  <PracticeStreaksCard />
                </Suspense>
              )}

              {showReminders && (
                <Suspense fallback={<CardSkeleton height="h-32" />}>
                  <PracticeRemindersCard />
                </Suspense>
              )}

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

        <BottomNavigation />
      </div>
    </div>
  );
};

export default Dashboard;
