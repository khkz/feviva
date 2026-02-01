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
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Coach from "./pages/Coach";
import Cards from "./pages/Cards";
import Habits from "./pages/Habits";
import Community from "./pages/Community";
import Library from "./pages/Library";
import Profile from "./pages/Profile";
import ProfileReminders from "./pages/ProfileReminders";
import DebateHistory from "./pages/DebateHistory";
import Gamification from "./pages/Gamification";
import Morning from "./pages/Morning";
import Evening from "./pages/Evening";
import Prayer from "./pages/Prayer";
import Mission from "./pages/Mission";
import Oraciones from "./pages/Oraciones";
import Rosario from "./pages/Rosario";
import SleepStories from "./pages/SleepStories";
import Novenas from "./pages/Novenas";
import BiblePlan from "./pages/BiblePlan";
import Santos from "./pages/Santos";
import SantoPage from "./pages/SantoPage";
import SantosPublic from "./pages/SantosPublic";
import OracionesPublic from "./pages/OracionesPublic";
import OracionPage from "./pages/OracionPage";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import ApostlePath from "./pages/ApostlePath";
import ApologeticsIntro from "./pages/ApologeticsIntro";
import Gratitude from "./pages/Gratitude";
import DailyGospel from "./pages/DailyGospel";
import FronteraFinal from "./pages/FronteraFinal";
import LibroNaturaleza from "./pages/frontera-final/LibroNaturaleza";
import PuntoOmega from "./pages/frontera-final/PuntoOmega";
import BautizarExtraterrestre from "./pages/frontera-final/BautizarExtraterrestre";
import PadreBigBang from "./pages/frontera-final/PadreBigBang";
import ObservatorioVaticano from "./pages/frontera-final/ObservatorioVaticano";
import ColonizarConquistar from "./pages/frontera-final/ColonizarConquistar";
import IaAlma from "./pages/frontera-final/IaAlma";
import AjusteFino from "./pages/frontera-final/AjusteFino";
import { AdminLayout } from "./layouts/AdminLayout";
import {
  AdminDashboard,
  AdminUsers,
  AdminContent,
  AdminFeedback,
  AdminProcessing,
  AdminAnalytics,
  AdminMedia,
  AdminCourses,
  AdminLiveSessions,
  AdminMovies,
  AdminDailyContent,
  AdminCommunity,
  AdminGratitude,
  AdminOraciones,
  AdminSantos,
} from "./pages/admin";
import AdminBiblePlan from "./pages/admin/AdminBiblePlan";
import AdminInvitations from "./pages/admin/AdminInvitations";

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
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
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
                <Route path="/frontera-final" element={<FronteraFinal />} />
                <Route path="/frontera-final/libro-naturaleza" element={<LibroNaturaleza />} />
                <Route path="/frontera-final/punto-omega" element={<PuntoOmega />} />
                <Route path="/frontera-final/bautizar-extraterrestre" element={<BautizarExtraterrestre />} />
                <Route path="/frontera-final/padre-big-bang" element={<PadreBigBang />} />
                <Route path="/frontera-final/observatorio-vaticano" element={<ObservatorioVaticano />} />
                <Route path="/frontera-final/colonizar-conquistar" element={<ColonizarConquistar />} />
                <Route path="/frontera-final/ia-alma" element={<IaAlma />} />
                <Route path="/frontera-final/ajuste-fino" element={<AjusteFino />} />
                
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
