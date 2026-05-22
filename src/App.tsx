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
import { OfflineIndicator } from "@/components/shared/OfflineIndicator";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

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
const KnowledgeSearch = lazy(() => import("./pages/KnowledgeSearch"));
const HistoriasDeFe = lazy(() => import("./pages/HistoriasDeFe"));
const EvangelioPublic = lazy(() => import("./pages/EvangelioPublic"));
const NovenasPublic = lazy(() => import("./pages/NovenasPublic"));
const NovenaPublicPage = lazy(() => import("./pages/NovenaPublicPage"));
const CapsulaDelDia = lazy(() => import("./pages/CapsulaDelDia"));
const SobreNosotros = lazy(() => import("./pages/SobreNosotros"));

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
            <OfflineIndicator />
            <BrowserRouter>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  {/* Sync routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />

                  {/* Lazy routes */}
                  <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/coach" element={<ProtectedRoute><Coach /></ProtectedRoute>} />
                  <Route path="/cards" element={<ProtectedRoute><Cards /></ProtectedRoute>} />
                  <Route path="/habits" element={<ProtectedRoute><Habits /></ProtectedRoute>} />
                  <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                  <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/profile/reminders" element={<ProtectedRoute><ProfileReminders /></ProtectedRoute>} />
                  <Route path="/debate-history" element={<ProtectedRoute><DebateHistory /></ProtectedRoute>} />
                  <Route path="/gamification" element={<ProtectedRoute><Gamification /></ProtectedRoute>} />
                  <Route path="/morning" element={<ProtectedRoute><Morning /></ProtectedRoute>} />
                  <Route path="/evening" element={<ProtectedRoute><Evening /></ProtectedRoute>} />
                  <Route path="/prayer" element={<ProtectedRoute><Prayer /></ProtectedRoute>} />
                  <Route path="/mission" element={<ProtectedRoute><Mission /></ProtectedRoute>} />
                  <Route path="/oraciones" element={<OracionesPublic />} />
                  <Route path="/oraciones/app" element={<ProtectedRoute><Oraciones /></ProtectedRoute>} />
                  <Route path="/oracion/:slug" element={<OracionPage />} />
                  <Route path="/rosario" element={<ProtectedRoute><Rosario /></ProtectedRoute>} />
                  <Route path="/sleep-stories" element={<ProtectedRoute><SleepStories /></ProtectedRoute>} />
                  <Route path="/sleep" element={<ProtectedRoute><SleepStories /></ProtectedRoute>} />
                  <Route path="/novenas" element={<ProtectedRoute><Novenas /></ProtectedRoute>} />
                  <Route path="/bible-plan" element={<ProtectedRoute><BiblePlan /></ProtectedRoute>} />
                  <Route path="/santos" element={<SantosPublic />} />
                  <Route path="/santos/app" element={<ProtectedRoute><Santos /></ProtectedRoute>} />
                  <Route path="/santo/:slug" element={<SantoPage />} />
                  <Route path="/apostle-path" element={<ProtectedRoute><ApostlePath /></ProtectedRoute>} />
                  <Route path="/apologetics-intro" element={<ProtectedRoute><ApologeticsIntro /></ProtectedRoute>} />
                  <Route path="/gratitude" element={<ProtectedRoute><Gratitude /></ProtectedRoute>} />
                  <Route path="/evangelio" element={<ProtectedRoute><DailyGospel /></ProtectedRoute>} />
                  <Route path="/evangelio/:fecha" element={<ProtectedRoute><DailyGospel /></ProtectedRoute>} />
                  <Route path="/install" element={<Install />} />
                  <Route path="/evangelio-del-dia" element={<EvangelioPublic />} />
                  <Route path="/novenas-publicas" element={<NovenasPublic />} />
                  <Route path="/novena/:id" element={<NovenaPublicPage />} />
                  <Route path="/capsula-del-dia" element={<CapsulaDelDia />} />
                  <Route path="/sobre-nosotros" element={<SobreNosotros />} />
                  <Route path="/about" element={<SobreNosotros />} />
                  <Route path="/search" element={<ProtectedRoute><KnowledgeSearch /></ProtectedRoute>} />
                  <Route path="/historias-de-fe" element={<ProtectedRoute><HistoriasDeFe /></ProtectedRoute>} />
                  <Route path="/frontera-final" element={<ProtectedRoute><FronteraFinal /></ProtectedRoute>} />
                  <Route path="/frontera-final/:articleId" element={<ProtectedRoute><FronteraArticlePage /></ProtectedRoute>} />

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
