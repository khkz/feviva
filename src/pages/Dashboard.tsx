import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BookOpen, Target, Users, Heart, LogOut, Settings, Brain, MessageSquare, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserStats } from "@/hooks/useUserStats";
import { LevelDisplay } from "@/components/gamification/LevelDisplay";

interface Profile {
  nombre: string;
  perfil_doctrinal: string;
  edad_segmento: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const {
    stats,
    getPointsForNextLevel,
    getProgressToNextLevel,
    updateStreak,
  } = useUserStats();

  useEffect(() => {
    checkAuth();
    updateStreak(); // Update daily streak
  }, []);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">
          <Sparkles className="w-12 h-12" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent">
      {/* Header */}
      <header className="bg-primary text-white shadow-medium">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-secondary" />
              <h1 className="font-heading text-2xl font-bold">FeViva</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/80">¡Hola, {profile?.nombre}!</span>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-4xl font-bold text-primary mb-4">
            Tu Camino de Fe
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Entrena tu capacidad de responder con verdad, razón y amor
          </p>
        </div>

        {/* Gamification Section */}
        {stats && (
          <div className="mb-8">
            <LevelDisplay
              nivel={stats.nivel}
              puntos_totales={stats.puntos_totales}
              puntosParaSiguienteNivel={getPointsForNextLevel()}
              progreso={getProgressToNextLevel()}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Debate Coach */}
          <Card className="hover:shadow-glow transition-smooth cursor-pointer" onClick={() => navigate("/coach")}>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle>Coach de Debate</CardTitle>
              <CardDescription>
                Practica conversaciones con personajes escépticos y recibe evaluación en Fe, Razón y Amor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Comenzar Entrenamiento
              </Button>
            </CardContent>
          </Card>

          {/* Argument Cards */}
          <Card className="hover:shadow-glow transition-smooth cursor-pointer" onClick={() => navigate("/cards")}>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Tarjetas de Argumento</CardTitle>
              <CardDescription>
                Aprende respuestas estructuradas a objeciones comunes con evidencia bíblica y razones sólidas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Explorar Tarjetas
              </Button>
            </CardContent>
          </Card>

          {/* Habits */}
          <Card className="hover:shadow-glow transition-smooth cursor-pointer" onClick={() => navigate("/habits")}>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle>Hábitos de Luz</CardTitle>
              <CardDescription>
                Mantén rachas de oración, gratitud, servicio y lectura bíblica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Ver Progreso
              </Button>
            </CardContent>
          </Card>

          {/* Library */}
          <Card className="hover:shadow-glow transition-smooth cursor-pointer" onClick={() => navigate("/library")}>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle>Biblioteca de Fe</CardTitle>
              <CardDescription>
                Lecciones fundamentales sobre apologética, doctrina y vida cristiana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Explorar Lecciones
              </Button>
            </CardContent>
          </Card>

          {/* Community */}
          <Card className="hover:shadow-glow transition-smooth cursor-pointer" onClick={() => navigate("/community")}>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Comunidad</CardTitle>
              <CardDescription>
                Comparte testimonios y peticiones de oración con otros creyentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Ir a Comunidad
              </Button>
            </CardContent>
          </Card>

          {/* Mission */}
          <Card className="hover:shadow-glow transition-smooth">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle>Misión</CardTitle>
              <CardDescription>
                Guías prácticas para compartir tu fe con amor y sabiduría
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Próximamente
              </Button>
            </CardContent>
          </Card>

          {/* Debate History */}
          <Card className="hover:shadow-glow transition-smooth cursor-pointer" onClick={() => navigate("/debate-history")}>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle>Historial de Debates</CardTitle>
              <CardDescription>
                Revisa tus debates anteriores y tu progreso en Fe, Razón y Amor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Ver Historial
              </Button>
            </CardContent>
          </Card>

          {/* Gamification */}
          <Card className="hover:shadow-glow transition-smooth cursor-pointer" onClick={() => navigate("/gamification")}>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Logros y Progreso</CardTitle>
              <CardDescription>
                Visualiza tus logros, nivel y estadísticas completas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Ver Logros
              </Button>
            </CardContent>
          </Card>

          {/* Profile */}
          <Card className="hover:shadow-glow transition-smooth cursor-pointer" onClick={() => navigate("/profile")}>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Mi Perfil</CardTitle>
              <CardDescription>
                Configura tu perfil doctrinal y preferencias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Editar Perfil
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Daily Reflection */}
        <Card className="mt-12 bg-gradient-to-r from-primary to-primary-hover text-white">
          <CardHeader>
            <CardTitle className="text-white">Reflexión del Día</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg italic mb-4">
              "Estén siempre preparados para responder a todo el que les pida razón de la esperanza que hay en ustedes. Pero háganlo con gentileza y respeto."
            </p>
            <p className="text-white/80">— 1 Pedro 3:15-16</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;