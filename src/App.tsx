import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import { RosarioProvider } from "@/contexts/RosarioContext";
import { UnifiedMiniPlayer } from "@/components/audio/UnifiedMiniPlayer";
import { OracionPlayer } from "@/components/oraciones/OracionPlayer";
import { RosarioMiniPlayer } from "@/components/rosario/RosarioMiniPlayer";
import { RosarioInterstellar } from "@/components/frontera-final/RosarioInterstellar";
import LoadingScreen from "@/components/shared/LoadingScreen";

// Synchronous imports — critical path (Landing, Auth, NotFound)
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy imports — all other pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Coach = lazy(() => import("./pages/Coach"));
const Cards = lazy(() => import("./pages/Cards"));
const Habits = lazy(() => import("./pages/Habits"));
const Community = lazy(() => import("./pages/Community"));
const Library = lazy(() => import("./pages/Library"));
const Profile = lazy(() => import("./pages/Profile"));
const ProfileReminders = lazy(() => import("./pages/ProfileReminders"));
const DebateHistory = lazy(() => import("./pages/DebateHistory"));
const Gamification = lazy(() => import("./pages/Gamification"));
const Morning = lazy(() => import("./pages/Morning"));
const Evening = lazy(() => import("./pages/Evening"));
const Prayer = lazy(() => import("./pages/Prayer"));
const Mission = lazy(() => import("./pages/Mission"));
const Oraciones = lazy(() => import("./pages/Oraciones"));
const Rosario = lazy(() => import("./pages/Rosario"));
const SleepStories = lazy(() => import("./pages/SleepStories"));
const Novenas = lazy(() => import("./pages/Novenas"));
const BiblePlan = lazy(() => import("./pages/BiblePlan"));
const Santos = lazy(() => import("./pages/Santos"));
const SantoPage = lazy(() => import("./pages/SantoPage"));
const SantosPublic = lazy(() => import("./pages/SantosPublic"));
const OracionesPublic = lazy(() => import("./pages/OracionesPublic"));
const OracionPage = lazy(() => import("./pages/OracionPage"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const ApostlePath = lazy(() => import("./pages/ApostlePath"));
const ApologeticsIntro = lazy(() => import("./pages/ApologeticsIntro"));
const Gratitude = lazy(() => import("./pages/Gratitude"));
const DailyGospel = lazy(() => import("./pages/DailyGospel"));
const Install = lazy(() => import("./pages/Install"));

// Frontera Final
const FronteraFinal = lazy(() => import("./pages/FronteraFinal"));
const FronteraArticlePage = lazy(() => import("./pages/frontera-final/FronteraArticlePage"));

// Admin
const AdminLayout = lazy(() => import("./layouts/AdminLayout").then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import("./pages/admin").then(m => ({ default: m.AdminDashboard })));
const AdminUsers = lazy(() => import("./pages/admin").then(m => ({ default: m.AdminUsers })));
const AdminContent = lazy(() => import("./pages/admin").then(m => ({ default: m.AdminContent })));
const AdminFeedback = lazy(() => import("./pages/admin").then(m => ({ default: m.AdminFeedback })));
const AdminProcessing = lazy(() => import("./pages/admin").then(m => ({ default: m.AdminProcessing })));
const AdminAnalytics = lazy(() => import("./pages/admin").then(m => ({ default: m.AdminAnalytics })));
const AdminMedia = lazy(() => import("./pages/admin").then(m => ({ default: m.AdminMedia })));
const AdminCourses = lazy(() => import("./pages/admin").then(m => ({ default: m.AdminCourses })));
const AdminLiveSessions = lazy(() => import("./pages/admin").then(m => ({ default: m.AdminLiveSessions })));
const AdminMovies = lazy(() => import("./pages/admin").then(m => ({ default: m.AdminMovies })));
const AdminDailyContent = lazy(() => import("./pages/admin").then(m => ({ default: m.AdminDailyContent })));
const AdminCommunity = lazy(() => import("./pages/admin").then(m => ({ default: m.AdminCommunity })));
const AdminGratitude = lazy(() => import("./pages/admin").then(m => ({ default: m.AdminGratitude })));
const AdminOraciones = lazy(() => import("./pages/admin").then(m => ({ default: m.AdminOraciones })));
const AdminSantos = lazy(() => import("./pages/admin").then(m => ({ default: m.AdminSantos })));
const AdminBiblePlan = lazy(() => import("./pages/admin/AdminBiblePlan"));
const AdminInvitations = lazy(() => import("./pages/admin/AdminInvitations"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AudioPlayerProvider>
        <RosarioProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  {/* Sync routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />

                  {/* Lazy routes */}
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/coach" element={<Coach />} />
                  <Route path="/cards" element={<Cards />} />
                  <Route path="/habits" element={<Habits />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/reminders" element={<ProfileReminders />} />
                  <Route path="/debate-history" element={<DebateHistory />} />
                  <Route path="/gamification" element={<Gamification />} />
                  <Route path="/morning" element={<Morning />} />
                  <Route path="/evening" element={<Evening />} />
                  <Route path="/prayer" element={<Prayer />} />
                  <Route path="/mission" element={<Mission />} />
                  <Route path="/oraciones" element={<OracionesPublic />} />
                  <Route path="/oraciones/app" element={<Oraciones />} />
                  <Route path="/oracion/:slug" element={<OracionPage />} />
                  <Route path="/rosario" element={<Rosario />} />
                  <Route path="/sleep-stories" element={<SleepStories />} />
                  <Route path="/sleep" element={<SleepStories />} />
                  <Route path="/novenas" element={<Novenas />} />
                  <Route path="/bible-plan" element={<BiblePlan />} />
                  <Route path="/santos" element={<SantosPublic />} />
                  <Route path="/santos/app" element={<Santos />} />
                  <Route path="/santo/:slug" element={<SantoPage />} />
                  <Route path="/apostle-path" element={<ApostlePath />} />
                  <Route path="/apologetics-intro" element={<ApologeticsIntro />} />
                  <Route path="/gratitude" element={<Gratitude />} />
                  <Route path="/evangelio" element={<DailyGospel />} />
                  <Route path="/evangelio/:fecha" element={<DailyGospel />} />
                  <Route path="/install" element={<Install />} />
                  <Route path="/frontera-final" element={<FronteraFinal />} />
                  <Route path="/frontera-final/:articleId" element={<FronteraArticlePage />} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="community" element={<AdminCommunity />} />
                    <Route path="content" element={<AdminContent />} />
                    <Route path="daily-content" element={<AdminDailyContent />} />
                    <Route path="oraciones" element={<AdminOraciones />} />
                    <Route path="feedback" element={<AdminFeedback />} />
                    <Route path="processing" element={<AdminProcessing />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="media" element={<AdminMedia />} />
                    <Route path="courses" element={<AdminCourses />} />
                    <Route path="live" element={<AdminLiveSessions />} />
                    <Route path="movies" element={<AdminMovies />} />
                    <Route path="bible-plan" element={<AdminBiblePlan />} />
                    <Route path="gratitude" element={<AdminGratitude />} />
                    <Route path="invitations" element={<AdminInvitations />} />
                    <Route path="santos" element={<AdminSantos />} />
                  </Route>

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>

              {/* Global Players */}
              <OracionPlayer />
              <UnifiedMiniPlayer />
              <RosarioMiniPlayer />
              <RosarioInterstellar />
            </BrowserRouter>
          </TooltipProvider>
        </RosarioProvider>
      </AudioPlayerProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
