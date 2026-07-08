import { useEffect, useState, lazy, Suspense, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Shield } from "lucide-react";
import { FirstDayExperience } from "@/components/ftue/FirstDayExperience";
import { useUserStats } from "@/hooks/useUserStats";
import { useNovenas } from "@/hooks/useNovenas";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useDailyVerse } from "@/hooks/useDailyVerse";
import { useDailyGospel } from "@/hooks/useDailyGospel";
import { useSaintOfDay } from "@/hooks/useSaintOfDay";
import { useDailyCapsule } from "@/hooks/useDailyCapsule";
import { SaintOfTheDayCard } from "@/components/dashboard/SaintOfTheDayCard";
import { SoulTriageHero } from "@/components/triage/SoulTriageHero";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ProgressCard } from "@/components/dashboard/ProgressCard";
import { NextStepCard } from "@/components/dashboard/NextStepCard";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { StreakBanner } from "@/components/dashboard/StreakBanner";
import { CoachHighlightCard } from "@/components/dashboard/CoachHighlightCard";
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
  // Prefetch dashboard data early so cards appear instantly when they render
  useDailyGospel();
  useSaintOfDay(profile?.country_code);
  useDailyCapsule();

  // Prefetch datos de páginas internas (oraciones, rosario, comunidad)
  // para que al navegar aparezcan al instante en lugar de en blanco.
  const queryClient = useQueryClient();
  useEffect(() => {
    const idle = (cb: () => void) =>
      (typeof window !== "undefined" && (window as any).requestIdleCallback)
        ? (window as any).requestIdleCallback(cb, { timeout: 2500 })
        : setTimeout(cb, 800);

    idle(() => {
      queryClient.prefetchQuery({
        queryKey: ["oraciones"],
        queryFn: async () => {
          const { data } = await supabase
            .from("oraciones")
            .select("*")
            .order("orden", { ascending: true })
            .limit(3000);
          return data ?? [];
        },
        staleTime: 5 * 60 * 1000,
      });
      queryClient.prefetchQuery({
        queryKey: ["rosario-misterios"],
        queryFn: async () => {
          const { data } = await supabase.from("rosario_misterios").select("*");
          return data ?? [];
        },
        staleTime: 60 * 60 * 1000,
      });
      queryClient.prefetchQuery({
        queryKey: ["rosario-oraciones"],
        queryFn: async () => {
          const { data } = await supabase.from("rosario_oraciones").select("*");
          return data ?? [];
        },
        staleTime: 60 * 60 * 1000,
      });
    });
  }, [queryClient]);

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
        userName={profile?.nombre?.split(" ")[0] || ""}
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
        userLevel={stats?.nivel || 1}
        userStreak={stats?.racha_actual_dias || 0}
      />

      <div className="lg:ml-64 pb-24 lg:pb-8">
        <HeroSection 
          userName={profile?.nombre || ""} 
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

          {/* ============ ACCIÓN DEL DÍA — sobre el pliegue ============ */}
          <section className="px-5 lg:px-0 pt-3 pb-2 lg:pt-6">
            <div className="mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-secondary/80">
                Tu acción de hoy
              </p>
            </div>
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
          </section>

          {/* ============ HOY ============ */}
          <section className="lg:px-0 mt-2">
            <div className="px-5 lg:px-0 mb-3">
              <h2 className="font-heading text-xl font-bold text-foreground">Hoy</h2>
            </div>

            <div className="space-y-4">
              <StreakBanner streak={stats?.racha_actual_dias || 0} />

              {showSoulTriage && <SoulTriageHero />}

              {showSaintAndGospel && (
                <div className="px-5 lg:px-0">
                  <div className="space-y-4 lg:hidden">
                    <GospelCard />
                    <SaintOfTheDayCard userCountryCode={profile?.country_code} />
                  </div>
                  <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
                    <GospelCard />
                    <SaintOfTheDayCard userCountryCode={profile?.country_code} />
                  </div>
                </div>
              )}

              <Suspense fallback={<div className="px-5 lg:px-0"><CardSkeleton height="h-32" /></div>}>
                <div className="px-5 lg:px-0">
                  <DailyCapsuleWidget />
                </div>
              </Suspense>

              {showQuickActions && <QuickActions />}
            </div>
          </section>

          {/* ============ FORMACIÓN ============ */}
          <section className="mt-8">
            <div className="px-5 lg:px-0 mb-3">
              <h2 className="font-heading text-xl font-bold text-foreground">Formación</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Ruta del Apóstol, Coach IA, Biblioteca, Apologética 101 y Pupilo Digital.
              </p>
            </div>

            {showExploreGrid && (
              <Suspense fallback={<CardSkeleton height="h-96" />}>
                <ExploreGrid />
              </Suspense>
            )}

            {showFrontera && (
              <div className="px-5 lg:px-0 mt-4">
                <FronteraFinalCard />
              </div>
            )}

            {showFeaturedContent && (
              <div className="mt-4">
                <Suspense fallback={<CardSkeleton height="h-64" />}>
                  <FeaturedContent hideTitle />
                </Suspense>
              </div>
            )}
          </section>

          {/* ============ ORACIÓN ============ */}
          <section className="mt-8">
            <div className="px-5 lg:px-0 mb-3">
              <h2 className="font-heading text-xl font-bold text-foreground">Oración</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Rosario, Novenas, Oraciones, Historias para Dormir y Diario de Gratitud.
              </p>
            </div>

            <div className="space-y-4">
              {showDailyRoutine && (
                <Suspense fallback={<CardSkeleton height="h-40" />}>
                  <DailyRoutineCard />
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

              {showGratitude && (
                <div className="px-5 lg:px-0">
                  <Suspense fallback={<CardSkeleton height="h-24" />}>
                    <GratitudePrompt />
                  </Suspense>
                </div>
              )}
            </div>
          </section>

          {/* ============ PROGRESO ============ */}
          <section className="mt-8 mb-6">
            <div className="px-5 lg:px-0 mb-3">
              <h2 className="font-heading text-xl font-bold text-foreground">Progreso</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Tu nivel, XP, rachas, desafío diario y logros.
              </p>
            </div>

            <div className="px-5 lg:px-0 grid lg:grid-cols-2 gap-4">
              {stats && (
                <ProgressCard
                  nivel={stats.nivel}
                  puntosTotales={stats.puntos_totales}
                  puntosParaSiguiente={getPointsForNextLevel()}
                  progreso={getProgressToNextLevel()}
                  racha={stats.racha_actual_dias}
                />
              )}

              {showStreaks && (
                <Suspense fallback={<CardSkeleton height="h-32" />}>
                  <PracticeStreaksCard />
                </Suspense>
              )}

              {showDailyChallenge && (
                <Suspense fallback={<CardSkeleton height="h-48" />}>
                  <DailyChallenge />
                </Suspense>
              )}

              {showReminders && (
                <Suspense fallback={<CardSkeleton height="h-32" />}>
                  <PracticeRemindersCard />
                </Suspense>
              )}
            </div>
          </section>
        </div>


        <BottomNavigation />
      </div>
    </div>
  );
};

export default Dashboard;
