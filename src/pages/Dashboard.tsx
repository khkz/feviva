import { useEffect, lazy, Suspense, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
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
import { ReferralDashboardCard } from "@/components/dashboard/ReferralDashboardCard";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { GospelCard } from "@/components/gospel/GospelCard";
import { FronteraFinalCard } from "@/components/dashboard/FronteraFinalCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AsyncState } from "@/components/shared/AsyncState";
import { useDashboardProfile } from "@/features/dashboard/useDashboardProfile";
import { useDashboardPrefetch } from "@/features/dashboard/useDashboardPrefetch";
import { DashboardSectionHeading } from "@/features/dashboard/DashboardSectionHeading";

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

const CardSkeleton = ({ height = "h-40" }: { height?: string }) => (
  <div className="mb-4">
    <Skeleton className={`${height} w-full rounded-xl`} />
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile, isLoading, isError, retry, ftueCompleted, completeFtue } = useDashboardProfile();
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
  useDashboardPrefetch();

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
    if (stats) {
      updateStreak();
    }
  }, [stats?.id]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <AsyncState kind="loading" title="Preparando tu día" description="Estamos reuniendo tus propuestas de hoy." />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <AsyncState kind="error" actionLabel="Intentar de nuevo" onAction={() => void retry()} />
      </main>
    );
  }

  // Show FTUE for brand new users
  if (!ftueCompleted && userMaturity === 0) {
    return (
      <FirstDayExperience
        userName={profile?.nombre?.split(" ")[0] || ""}
        onComplete={() => completeFtue()}
      />
    );
  }

  // Show more content as user matures
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
              <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-gold-ink">
                Tu acción de hoy
              </p>
            </div>
            <NextStepCard
              currentLevel={stats?.nivel || 1}
              completedLessons={Math.floor((stats?.puntos_totales || 0) / 100)}
              totalLessons={10}
            />
          </section>

          {/* ============ HOY ============ */}
          <section className="lg:px-0 mt-2">
            <DashboardSectionHeading title="Hoy" />

            <div className="space-y-4">
              <StreakBanner streak={stats?.racha_actual_dias || 0} />

              <Suspense fallback={<div className="px-5 lg:px-0"><CardSkeleton height="h-48" /></div>}>
                <DailyMission />
              </Suspense>

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
            <DashboardSectionHeading title="Formación" description="Entrena, estudia y profundiza a tu ritmo." />

            <div className="px-5 lg:px-0">
              <CoachHighlightCard streak={stats?.racha_actual_dias} />
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
            <DashboardSectionHeading title="Oración" description="Encuentra un momento de silencio, escucha y encuentro." />

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
            <DashboardSectionHeading title="Progreso" description="Una mirada serena a tu constancia y próximos pasos." />

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

              {/* Invita y gana — 7 días de acceso Apóstol por amigo referido */}
              <ReferralDashboardCard />
            </div>

          </section>
        </div>


        <BottomNavigation />
      </div>
    </div>
  );
};

export default Dashboard;
