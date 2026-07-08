import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, CheckCircle2, ArrowLeft, Trophy, Sparkles, Headphones, Wand2, Loader2 } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { LessonDetailModal } from "@/components/library/LessonDetailModal";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface Lesson {
  id: string;
  titulo: string;
  descripcion: string;
  contenido: string;
  nivel: number;
  categoria: string;
  recursos: any;
  orden: number;
  contenido_enriquecido?: string | null;
  audio_url?: string | null;
  duracion_estimada?: number;
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
  const [batchEnriching, setBatchEnriching] = useState(false);
  const [batchGeneratingAudio, setBatchGeneratingAudio] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { incrementLessons } = useUserStats();
  const { isAdmin } = useAdminAuth();

  // Check for lesson query parameter to open directly
  const lessonParam = searchParams.get('lesson');

  useEffect(() => {
    fetchLessons();
    fetchProgress();
  }, []);

  // Mapping from URL param to exact lesson title
  const LESSON_PARAM_MAP: Record<string, string> = {
    'existe-dios': '¿Existe Dios?',
    'biblia-confiable': 'La Confiabilidad de la Biblia',
    'jesus-historico': 'Jesús Histórico',
    'resurreccion': 'La Resurrección de Jesús',
    'fe-ciencia': 'Fe y Ciencia',
    'salvacion': 'Salvación por Gracia',
    'problema-mal': 'El Problema del Mal',
    'trinidad': 'La Trinidad',
  };

  // Auto-open lesson from URL parameter
  useEffect(() => {
    if (lessonParam && lessons.length > 0 && !selectedLesson) {
      const exactTitle = LESSON_PARAM_MAP[lessonParam];
      const targetLesson = exactTitle 
        ? lessons.find(l => l.titulo === exactTitle)
        : lessons.find(l => l.titulo.toLowerCase().includes(lessonParam.replace(/-/g, ' ')));
      
      if (targetLesson) {
        setSelectedLesson(targetLesson);
      }
    }
  }, [lessonParam, lessons]);

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
      .upsert(
        {
          user_id: user.id,
          lesson_id: lessonId,
          completado: !isCompleted,
          fecha_completado: !isCompleted ? new Date().toISOString() : null,
        },
        { onConflict: 'user_id,lesson_id' }
      );

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el progreso",
        variant: "destructive",
      });
    } else {
      await fetchProgress();
      
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
  const enrichedCount = lessons.filter(l => l.contenido_enriquecido).length;
  const audioCount = lessons.filter(l => l.audio_url).length;
  const pendingEnrichment = lessons.length - enrichedCount;
  const pendingAudio = enrichedCount - audioCount;

  const handleBatchEnrich = async () => {
    if (pendingEnrichment === 0) {
      toast({
        title: "Ya está completo",
        description: "Todas las lecciones ya están enriquecidas",
      });
      return;
    }

    setBatchEnriching(true);
    let totalProcessed = 0;
    let totalErrors = 0;
    let hasMore = true;
    let batchNumber = 1;
    const batchSize = 2;
    const totalBatches = Math.ceil(pendingEnrichment / batchSize);

    toast({
      title: "Enriquecimiento iniciado",
      description: `Procesando ${pendingEnrichment} lecciones en ${totalBatches} lotes...`,
    });

    try {
      while (hasMore) {
        toast({
          title: `Procesando lote ${batchNumber}/${totalBatches}`,
          description: `${totalProcessed} lecciones completadas...`,
        });

        const response = await supabase.functions.invoke('batch-enrich-lessons', {
          body: { limit: batchSize }
        });
        
        if (response.error) {
          throw new Error(response.error.message);
        }

        const result = response.data;
        totalProcessed += result.successCount || 0;
        totalErrors += result.errorCount || 0;
        hasMore = result.hasMore;
        batchNumber++;

        await fetchLessons();

        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      toast({
        title: "¡Enriquecimiento completado!",
        description: `${totalProcessed} lecciones enriquecidas${totalErrors > 0 ? `, ${totalErrors} errores` : ''}`,
      });
    } catch (error) {
      console.error('Batch enrich error:', error);
      toast({
        title: "Error en el proceso",
        description: `Procesadas ${totalProcessed} lecciones antes del error. ${error instanceof Error ? error.message : "Error desconocido"}`,
        variant: "destructive",
      });
      await fetchLessons();
    } finally {
      setBatchEnriching(false);
    }
  };

  const handleBatchAudio = async () => {
    if (pendingAudio <= 0) {
      toast({
        title: "Ya está completo",
        description: "Todas las lecciones enriquecidas ya tienen audio",
      });
      return;
    }

    setBatchGeneratingAudio(true);
    let totalProcessed = 0;
    let totalErrors = 0;
    let hasMore = true;
    let batchNumber = 1;
    const batchSize = 1; // TTS is slower, process 1 at a time
    const totalBatches = Math.ceil(pendingAudio / batchSize);

    toast({
      title: "Generación de audio iniciada",
      description: `Procesando ${pendingAudio} lecciones en ${totalBatches} lotes...`,
    });

    try {
      while (hasMore) {
        toast({
          title: `Generando audio ${batchNumber}/${totalBatches}`,
          description: `${totalProcessed} audios completados...`,
        });

        const response = await supabase.functions.invoke('batch-lesson-tts', {
          body: { limit: batchSize }
        });
        
        if (response.error) {
          throw new Error(response.error.message);
        }

        const result = response.data;
        
        if (result.needsEnrichmentFirst && result.needsEnrichmentFirst > 0) {
          toast({
            title: "Enriquecimiento pendiente",
            description: `${result.needsEnrichmentFirst} lecciones necesitan ser enriquecidas primero`,
            variant: "destructive",
          });
          break;
        }

        totalProcessed += result.successCount || 0;
        totalErrors += result.errorCount || 0;
        hasMore = result.hasMore;
        batchNumber++;

        await fetchLessons();

        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      toast({
        title: "¡Generación de audio completada!",
        description: `${totalProcessed} audios generados${totalErrors > 0 ? `, ${totalErrors} errores` : ''}`,
      });
    } catch (error) {
      console.error('Batch audio error:', error);
      toast({
        title: "Error en el proceso",
        description: `Generados ${totalProcessed} audios antes del error. ${error instanceof Error ? error.message : "Error desconocido"}`,
        variant: "destructive",
      });
      await fetchLessons();
    } finally {
      setBatchGeneratingAudio(false);
    }
  };

  const getLevelBadgeColor = (nivel: number) => {
    switch (nivel) {
      case 1: return "bg-green-500/20 text-green-400 border-green-500/30";
      case 2: return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case 3: return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case 4: return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      <DesktopSidebar />
      <div className="flex-1 lg:ml-64 pb-20">
      {/* Hero Header */}
      <motion.div 
        className="relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 via-blue-500/10 to-background" />
        <div className="relative z-10 p-5 pt-8">
          {/* Back Button & Title */}
          <motion.div 
            className="flex items-center gap-4 mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.button
              onClick={() => navigate("/dashboard")}
              className="glass-button p-2 rounded-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="h-5 w-5" />
            </motion.button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-heading">Biblioteca de Fe</h1>
                <p className="text-muted-foreground text-sm">
                  Fortalece tu conocimiento
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-3 gap-3 mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="glass-card rounded-xl p-3 text-center">
              <Trophy className="h-5 w-5 text-secondary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{completedCount}/{lessons.length}</p>
              <p className="text-xs text-muted-foreground">Completadas</p>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <Sparkles className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{enrichedCount}</p>
              <p className="text-xs text-muted-foreground">Enriquecidas</p>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <Headphones className="h-5 w-5 text-green-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{audioCount}</p>
              <p className="text-xs text-muted-foreground">Con Audio</p>
            </div>
          </motion.div>

          {/* Batch Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-4 space-y-2"
          >
            {/* Batch Enrich Button */}
            {pendingEnrichment > 0 && (
              <Button
                onClick={handleBatchEnrich}
                disabled={batchEnriching || batchGeneratingAudio}
                className="w-full glass-button bg-gradient-to-r from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30 border border-primary/30"
              >
                {batchEnriching ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enriqueciendo {pendingEnrichment} lecciones...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Enriquecer {pendingEnrichment} lecciones
                  </>
                )}
              </Button>
            )}

            {/* Batch Audio Button */}
            {pendingAudio > 0 && (
              <Button
                onClick={handleBatchAudio}
                disabled={batchEnriching || batchGeneratingAudio}
                className="w-full glass-button bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30"
              >
                {batchGeneratingAudio ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generando audio {audioCount}/{enrichedCount}...
                  </>
                ) : (
                  <>
                    <Headphones className="h-4 w-4 mr-2" />
                    Generar audio para {pendingAudio} lecciones
                  </>
                )}
              </Button>
            )}
          </motion.div>

          {/* Progress Card */}
          <motion.div 
            className="glass-card rounded-2xl p-4 mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-foreground">Tu Progreso</span>
              <span className="text-sm text-muted-foreground">
                {progressPercentage.toFixed(0)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </motion.div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div 
        className="px-5 py-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {/* Category Tabs */}
        <Tabs defaultValue="all" className="mb-4">
          <TabsList className="w-full overflow-x-auto flex justify-start glass-card border-0 h-auto p-1">
            <TabsTrigger 
              value="all" 
              onClick={() => setSelectedCategory("all")}
              className="whitespace-nowrap"
            >
              Todas
            </TabsTrigger>
            {categories.map(cat => (
              <TabsTrigger
                key={cat}
                value={cat}
                onClick={() => setSelectedCategory(cat)}
                className="whitespace-nowrap"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Level Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <motion.button
            onClick={() => setSelectedLevel(0)}
            className={`glass-button px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
              selectedLevel === 0 ? 'bg-primary/20 text-primary' : ''
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Todos
          </motion.button>
          {[1, 2, 3, 4].map(level => (
            <motion.button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`glass-button px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                selectedLevel === level ? 'bg-primary/20 text-primary' : ''
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Nivel {level}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Lessons Grid */}
      <div className="px-5">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-9 w-9 rounded-xl bg-muted/60 animate-pulse" />
                  <div className="h-5 w-14 rounded-full bg-muted/60 animate-pulse" />
                </div>
                <div className="h-5 w-3/4 rounded bg-muted/60 animate-pulse" />
                <div className="h-3 w-full rounded bg-muted/50 animate-pulse" />
                <div className="h-3 w-5/6 rounded bg-muted/50 animate-pulse" />
                <div className="h-2 w-full rounded-full bg-muted/40 animate-pulse" />
              </div>
            ))}
          </div>
        ) : filteredLessons.length === 0 ? (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="glass-card rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground">No hay lecciones disponibles</p>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.1,
                },
              },
            }}
          >
            {filteredLessons.map((lesson) => (
              <motion.button
                key={lesson.id}
                className="glass-card rounded-2xl p-4 text-left w-full relative overflow-hidden"
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.95 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { type: "spring", stiffness: 200, damping: 20 },
                  },
                }}
                onClick={() => setSelectedLesson(lesson)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Enriched indicator */}
                {lesson.contenido_enriquecido && (
                  <div className="absolute top-0 right-0 w-12 h-12">
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-secondary/30 to-transparent rounded-bl-full" />
                    <Sparkles className="absolute top-2 right-2 h-4 w-4 text-secondary" />
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getLevelBadgeColor(lesson.nivel)} border`}>
                      Nivel {lesson.nivel}
                    </Badge>
                    {lesson.audio_url && (
                      <Headphones className="h-4 w-4 text-green-400" />
                    )}
                  </div>
                  {progress[lesson.id]?.completado && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </motion.div>
                  )}
                </div>
                <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                  {lesson.titulo}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {lesson.descripcion}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {lesson.categoria}
                  </Badge>
                  {lesson.duracion_estimada && (
                    <span className="text-xs text-muted-foreground">
                      ~{lesson.duracion_estimada} min
                    </span>
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Lesson Detail Modal */}
      <AnimatePresence>
        {selectedLesson && (
          <LessonDetailModal
            lesson={selectedLesson}
            isCompleted={!!progress[selectedLesson.id]?.completado}
            onClose={() => setSelectedLesson(null)}
            onMarkComplete={() => markAsComplete(selectedLesson.id)}
            getLevelBadgeColor={getLevelBadgeColor}
          />
        )}
      </AnimatePresence>

      <BottomNavigation />
      </div>
    </div>
  );
};

export default Library;
