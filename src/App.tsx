import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Coach from "./pages/Coach";
import Cards from "./pages/Cards";
import Habits from "./pages/Habits";
import Community from "./pages/Community";
import Library from "./pages/Library";
import Profile from "./pages/Profile";
import DebateHistory from "./pages/DebateHistory";
import Gamification from "./pages/Gamification";
import Morning from "./pages/Morning";
import Evening from "./pages/Evening";
import Prayer from "./pages/Prayer";
import Mission from "./pages/Mission";
import Oraciones from "./pages/Oraciones";
import Rosario from "./pages/Rosario";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          <Route path="/debate-history" element={<DebateHistory />} />
          <Route path="/gamification" element={<Gamification />} />
          <Route path="/morning" element={<Morning />} />
          <Route path="/evening" element={<Evening />} />
          <Route path="/prayer" element={<Prayer />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="/oraciones" element={<Oraciones />} />
          <Route path="/rosario" element={<Rosario />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
