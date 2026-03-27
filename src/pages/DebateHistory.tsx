import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MessageSquare, TrendingUp, Award, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

interface Debate {
  id: string;
  tema: string;
  personaje: string;
  puntaje_fe: number | null;
  puntaje_razon: number | null;
  puntaje_amor: number | null;
  feedback: string | null;
  transcript: any;
  completed: boolean;
  created_at: string;
}

interface Stats {
  total: number;
  promedio_fe: number;
  promedio_razon: number;
  promedio_amor: number;
  tema_mas_practicado: string;
}

const DebateHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [debates, setDebates] = useState<Debate[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedDebate, setSelectedDebate] = useState<Debate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDebates();
  }, []);

  const fetchDebates = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("debates")
      .select("*")
      .eq("user_id", user.id)
      .eq("completed", true)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los debates",
        variant: "destructive",
      });
    } else if (data) {
      setDebates(data);
      calculateStats(data);
    }
    setLoading(false);
  };

  const calculateStats = (debates: Debate[]) => {
    if (debates.length === 0) {
      setStats(null);
      return;
    }

    const completed = debates.filter(d => d.completed && d.puntaje_fe !== null);
    
    const avgFe = completed.reduce((sum, d) => sum + (d.puntaje_fe || 0), 0) / completed.length;
    const avgRazon = completed.reduce((sum, d) => sum + (d.puntaje_razon || 0), 0) / completed.length;
    const avgAmor = completed.reduce((sum, d) => sum + (d.puntaje_amor || 0), 0) / completed.length;

    const temaCount: Record<string, number> = {};
    debates.forEach(d => {
      temaCount[d.tema] = (temaCount[d.tema] || 0) + 1;
    });
    const topTema = Object.entries(temaCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    setStats({
      total: completed.length,
      promedio_fe: Math.round(avgFe),
      promedio_razon: Math.round(avgRazon),
      promedio_amor: Math.round(avgAmor),
      tema_mas_practicado: topTema,
    });
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "bg-gray-500";
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreBadge = (score: number | null) => {
    if (score === null) return "N/A";
    if (score >= 80) return "Excelente";
    if (score >= 60) return "Bueno";
    if (score >= 40) return "Regular";
    return "Necesita Mejorar";
  };

  return (
    <div className="min-h-screen flex w-full">
      <DesktopSidebar />
      <div className="flex-1 lg:ml-64 pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Historial de Debates</h1>
        </div>

        {loading ? (
          <div className="text-center py-12">Cargando historial...</div>
        ) : debates.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Aún no has completado debates</CardTitle>
              <CardDescription>
                Comienza a practicar con el Coach de Debate para ver tu progreso aquí
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/coach")}>
                Ir al Coach de Debate
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Debates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <span className="text-3xl font-bold">{stats?.total}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Promedio Fe
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <span className="text-3xl font-bold">{stats?.promedio_fe}</span>
                    <Progress value={stats?.promedio_fe} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Promedio Razón
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <span className="text-3xl font-bold">{stats?.promedio_razon}</span>
                    <Progress value={stats?.promedio_razon} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Promedio Amor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <span className="text-3xl font-bold">{stats?.promedio_amor}</span>
                    <Progress value={stats?.promedio_amor} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle>Tema Más Practicado</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="text-lg py-2 px-4">
                  {stats?.tema_mas_practicado}
                </Badge>
              </CardContent>
            </Card>

            {/* Debates List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Todos los Debates</h2>
              {debates.map((debate) => (
                <Card
                  key={debate.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedDebate(debate)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{debate.tema}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(debate.created_at), "d 'de' MMMM, yyyy - HH:mm", { locale: es })}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{debate.personaje}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Fe</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">{debate.puntaje_fe || "N/A"}</span>
                          <Badge className={getScoreColor(debate.puntaje_fe)}>
                            {getScoreBadge(debate.puntaje_fe)}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Razón</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">{debate.puntaje_razon || "N/A"}</span>
                          <Badge className={getScoreColor(debate.puntaje_razon)}>
                            {getScoreBadge(debate.puntaje_razon)}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Amor</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">{debate.puntaje_amor || "N/A"}</span>
                          <Badge className={getScoreColor(debate.puntaje_amor)}>
                            {getScoreBadge(debate.puntaje_amor)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Debate Detail Dialog */}
      <Dialog open={!!selectedDebate} onOpenChange={() => setSelectedDebate(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedDebate?.tema}</DialogTitle>
            <DialogDescription>
              Debate con {selectedDebate?.personaje} -{" "}
              {selectedDebate && format(new Date(selectedDebate.created_at), "d 'de' MMMM, yyyy", { locale: es })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Scores */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Fe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{selectedDebate?.puntaje_fe || "N/A"}</div>
                  <Progress value={selectedDebate?.puntaje_fe || 0} className="mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Razón</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{selectedDebate?.puntaje_razon || "N/A"}</div>
                  <Progress value={selectedDebate?.puntaje_razon || 0} className="mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Amor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{selectedDebate?.puntaje_amor || "N/A"}</div>
                  <Progress value={selectedDebate?.puntaje_amor || 0} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Feedback */}
            {selectedDebate?.feedback && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <CardTitle>Retroalimentación del Coach</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{selectedDebate.feedback}</p>
                </CardContent>
              </Card>
            )}

            {/* Transcript */}
            {selectedDebate?.transcript && Array.isArray(selectedDebate.transcript) && selectedDebate.transcript.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Transcripción del Debate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedDebate.transcript.map((message: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg ${
                          message.role === "user"
                            ? "bg-primary/10 ml-8"
                            : "bg-muted mr-8"
                        }`}
                      >
                        <p className="font-semibold mb-1">
                          {message.role === "user" ? "Tú" : selectedDebate.personaje}
                        </p>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <BottomNavigation />
      </div>
    </div>
  );
};

export default DebateHistory;
