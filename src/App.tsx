import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import { MiniPlayer } from "@/components/audio/MiniPlayer";
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
import NotFound from "./pages/NotFound";
import ApostlePath from "./pages/ApostlePath";
import ApologeticsIntro from "./pages/ApologeticsIntro";
import Gratitude from "./pages/Gratitude";
import DailyGospel from "./pages/DailyGospel";
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
} from "./pages/admin";
import AdminBiblePlan from "./pages/admin/AdminBiblePlan";
import AdminInvitations from "./pages/admin/AdminInvitations";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AudioPlayerProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
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
              <Route path="/oraciones" element={<Oraciones />} />
              <Route path="/rosario" element={<Rosario />} />
              <Route path="/sleep-stories" element={<SleepStories />} />
              <Route path="/sleep" element={<SleepStories />} />
              <Route path="/novenas" element={<Novenas />} />
              <Route path="/bible-plan" element={<BiblePlan />} />
              <Route path="/apostle-path" element={<ApostlePath />} />
              <Route path="/apologetics-intro" element={<ApologeticsIntro />} />
              <Route path="/gratitude" element={<Gratitude />} />
              <Route path="/evangelio" element={<DailyGospel />} />
              <Route path="/evangelio/:fecha" element={<DailyGospel />} />
              
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
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            {/* Global Mini Player */}
            <MiniPlayer />
          </BrowserRouter>
        </TooltipProvider>
      </AudioPlayerProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
