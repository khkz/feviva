import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, CheckCircle2, ArrowLeft, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUserStats } from "@/hooks/useUserStats";

interface Lesson {
  id: string;
  titulo: string;
  descripcion: string;
  contenido: string;
  nivel: number;
  categoria: string;
  recursos: any;
  orden: number;
}

interface LessonProgress {
  lesson_id: string;
  completado: boolean;
  fecha_completado: string | null;
}

const Library = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Record<string, LessonProgress>>({});
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<number>(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { incrementLessons } = useUserStats();

  useEffect(() => {
    checkAuth();
    fetchLessons();
    fetchProgress();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchLessons = async () => {
    const { data, error } = await supabase
      .from("library_lessons")
      .select("*")
      .order("categoria")
      .order("orden");

    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las lecciones",
        variant: "destructive",
      });
    } else {
      setLessons(data || []);
    }
    setLoading(false);
  };

  const fetchProgress = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("user_lesson_progress")
      .select("*")
      .eq("user_id", user.id);

    if (!error && data) {
      const progressMap: Record<string, LessonProgress> = {};
      data.forEach((p: any) => {
        progressMap[p.lesson_id] = p;
      });
      setProgress(progressMap);
    }
  };

  const markAsComplete = async (lessonId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isCompleted = progress[lessonId]?.completado;

    const { error } = await supabase
      .from("user_lesson_progress")
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        completado: !isCompleted,
        fecha_completado: !isCompleted ? new Date().toISOString() : null,
      });

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el progreso",
        variant: "destructive",
      });
    } else {
      await fetchProgress();
      
      // Update user stats when completing a lesson
      if (!isCompleted) {
        await incrementLessons();
      }
      
      toast({
        title: isCompleted ? "Marcada como no completada" : "¡Lección completada!",
        description: isCompleted ? "" : "Sigue avanzando en tu formación",
      });
    }
  };

  const categories = Array.from(new Set(lessons.map(l => l.categoria)));
  const filteredLessons = lessons.filter(lesson => {
    const categoryMatch = selectedCategory === "all" || lesson.categoria === selectedCategory;
    const levelMatch = selectedLevel === 0 || lesson.nivel === selectedLevel;
    return categoryMatch && levelMatch;
  });

  const completedCount = Object.values(progress).filter(p => p.completado).length;
  const progressPercentage = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  const getLevelBadgeColor = (nivel: number) => {
    switch (nivel) {
      case 1: return "bg-green-500";
      case 2: return "bg-blue-500";
      case 3: return "bg-orange-500";
      case 4: return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Biblioteca de Fe</h1>
          </div>
          
          <p className="text-muted-foreground mb-6">
            Fortalece tu fe con lecciones fundamentales del cristianismo
          </p>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tu Progreso</CardTitle>
              <CardDescription>
                {completedCount} de {lessons.length} lecciones completadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                {progressPercentage.toFixed(0)}% completado
              </p>
            </CardContent>
          </Card>

          <Tabs defaultValue="all" className="mb-6">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setSelectedCategory("all")}>
                Todas
              </TabsTrigger>
              {categories.map(cat => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex gap-2 mb-6">
            <Button
              variant={selectedLevel === 0 ? "default" : "outline"}
              onClick={() => setSelectedLevel(0)}
            >
              Todos los niveles
            </Button>
            {[1, 2, 3, 4].map(level => (
              <Button
                key={level}
                variant={selectedLevel === level ? "default" : "outline"}
                onClick={() => setSelectedLevel(level)}
              >
                Nivel {level}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Cargando lecciones...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map(lesson => (
              <Card
                key={lesson.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedLesson(lesson)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getLevelBadgeColor(lesson.nivel)}>
                      Nivel {lesson.nivel}
                    </Badge>
                    {progress[lesson.id]?.completado && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <CardTitle className="text-lg">{lesson.titulo}</CardTitle>
                  <CardDescription>{lesson.descripcion}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">{lesson.categoria}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedLesson} onOpenChange={() => setSelectedLesson(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-start mb-2">
              <Badge className={getLevelBadgeColor(selectedLesson?.nivel || 1)}>
                Nivel {selectedLesson?.nivel}
              </Badge>
              {selectedLesson && progress[selectedLesson.id]?.completado && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </div>
            <DialogTitle className="text-2xl">{selectedLesson?.titulo}</DialogTitle>
            <DialogDescription>{selectedLesson?.descripcion}</DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedLesson?.contenido || "" }}
            />

            {selectedLesson && selectedLesson.recursos.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Recursos Adicionales</h3>
                <div className="space-y-2">
                  {selectedLesson.recursos.map((recurso, idx) => (
                    <a
                      key={idx}
                      href={recurso.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {recurso.titulo} ({recurso.tipo})
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => selectedLesson && markAsComplete(selectedLesson.id)}
              >
                {selectedLesson && progress[selectedLesson.id]?.completado
                  ? "Marcar como no completada"
                  : "Marcar como completada"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Library;
