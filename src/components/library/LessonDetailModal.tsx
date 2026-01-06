import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  BookOpen, Sparkles, Clock, Quote, CheckCircle2, Loader2,
  Headphones, List, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLessonAudio, useLessonEnrichment } from "@/hooks/useLessonEnrichment";

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

interface LessonDetailModalProps {
  lesson: Lesson;
  isCompleted: boolean;
  onClose: () => void;
  onMarkComplete: () => void;
  getLevelBadgeColor: (nivel: number) => string;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function LessonDetailModal({
  lesson,
  isCompleted,
  onClose,
  onMarkComplete,
  getLevelBadgeColor,
}: LessonDetailModalProps) {
  const [activeTab, setActiveTab] = useState<string>("contenido");
  const [isMuted, setIsMuted] = useState(false);
  
  const { 
    isEnriching, 
    enrichedContent, 
    enrichLesson,
    clearEnrichedContent 
  } = useLessonEnrichment();
  
  const {
    audioUrl,
    isGeneratingAudio,
    isPlaying,
    progress,
    duration,
    currentTime,
    toggle,
    seekByPercent,
    skipForward,
    skipBackward,
    generateAudio,
    hasAudio,
  } = useLessonAudio({
    lessonId: lesson.id,
    titulo: lesson.titulo,
    existingAudioUrl: lesson.audio_url,
  });

  // Check if we should use enriched content
  const displayContent = enrichedContent?.contenido_enriquecido || lesson.contenido_enriquecido || lesson.contenido;
  const hasEnrichedContent = !!(enrichedContent?.contenido_enriquecido || lesson.contenido_enriquecido);

  const handleEnrich = async () => {
    await enrichLesson(
      lesson.id,
      lesson.titulo,
      lesson.descripcion,
      lesson.contenido,
      lesson.categoria
    );
  };

  const handleGenerateAudio = async () => {
    const textForAudio = enrichedContent?.resumen_audio || lesson.descripcion + ". " + lesson.contenido.replace(/<[^>]*>/g, '').slice(0, 2000);
    await generateAudio(textForAudio);
  };

  const handlePlayAudio = async () => {
    if (!hasAudio && enrichedContent?.resumen_audio) {
      const url = await generateAudio(enrichedContent.resumen_audio);
      if (url) {
        toggle();
      }
    } else {
      toggle();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-4xl max-h-[90vh] bg-background/95 backdrop-blur-xl rounded-3xl border border-border/50 overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-border/30">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
          
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${getLevelBadgeColor(lesson.nivel)} border`}>
                  Nivel {lesson.nivel}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {lesson.categoria}
                </Badge>
                {hasEnrichedContent && (
                  <Badge className="bg-secondary/20 text-secondary border-secondary/30 border">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Enriquecido
                  </Badge>
                )}
                {isCompleted && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 border">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Completado
                  </Badge>
                )}
              </div>
              
              <h2 className="text-2xl font-bold font-heading text-foreground mb-1">
                {lesson.titulo}
              </h2>
              <p className="text-muted-foreground text-sm">{lesson.descripcion}</p>
              
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {enrichedContent?.duracion_lectura || lesson.duracion_estimada || 5} min lectura
                </span>
                {hasAudio && (
                  <span className="flex items-center gap-1">
                    <Headphones className="h-3.5 w-3.5" />
                    Audio disponible
                  </span>
                )}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full glass-button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Audio Player Bar */}
        <AnimatePresence>
          {(hasAudio || enrichedContent?.resumen_audio) && (
            <motion.div
              className="px-6 py-3 bg-primary/5 border-b border-border/30"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="flex items-center gap-4">
                {/* Play Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => skipBackward(15)}
                    disabled={!hasAudio || isGeneratingAudio}
                    className="h-8 w-8 rounded-full"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    onClick={handlePlayAudio}
                    disabled={isGeneratingAudio}
                    className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90"
                  >
                    {isGeneratingAudio ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => skipForward(15)}
                    disabled={!hasAudio || isGeneratingAudio}
                    className="h-8 w-8 rounded-full"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                {/* Progress */}
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    {formatTime(currentTime)}
                  </span>
                  <Slider
                    value={[progress]}
                    max={100}
                    step={0.1}
                    onValueChange={(value) => seekByPercent(value[0])}
                    className="flex-1"
                    disabled={!hasAudio}
                  />
                  <span className="text-xs text-muted-foreground w-10">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Volume */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                  className="h-8 w-8 rounded-full"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {isGeneratingAudio && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Generando audio con IA... Esto puede tomar unos segundos
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="px-6 pt-4">
            <TabsList className="w-full glass-card border-0 p-1">
              <TabsTrigger value="contenido" className="flex-1">
                <BookOpen className="h-4 w-4 mr-2" />
                Contenido
              </TabsTrigger>
              {enrichedContent?.puntos_clave && enrichedContent.puntos_clave.length > 0 && (
                <TabsTrigger value="puntos" className="flex-1">
                  <List className="h-4 w-4 mr-2" />
                  Puntos Clave
                </TabsTrigger>
              )}
              {enrichedContent?.citas_biblicas && enrichedContent.citas_biblicas.length > 0 && (
                <TabsTrigger value="citas" className="flex-1">
                  <Quote className="h-4 w-4 mr-2" />
                  Citas Bíblicas
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <ScrollArea className="h-[calc(90vh-380px)] px-6 py-4">
            <TabsContent value="contenido" className="mt-0">
              <div
                className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg"
                dangerouslySetInnerHTML={{ __html: displayContent }}
              />
            </TabsContent>

            <TabsContent value="puntos" className="mt-0">
              <div className="space-y-3">
                {enrichedContent?.puntos_clave?.map((punto, idx) => (
                  <motion.div
                    key={idx}
                    className="glass-card rounded-xl p-4 flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{idx + 1}</span>
                    </div>
                    <p className="text-foreground/90 pt-1">{punto}</p>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="citas" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {enrichedContent?.citas_biblicas?.map((cita, idx) => (
                  <motion.div
                    key={idx}
                    className="glass-card rounded-xl p-4 flex items-center gap-3"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Quote className="h-5 w-5 text-secondary flex-shrink-0" />
                    <span className="text-foreground font-medium">{cita}</span>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer Actions */}
        <div className="p-6 pt-4 border-t border-border/30 flex flex-wrap items-center gap-3">
          {!hasEnrichedContent && (
            <Button
              onClick={handleEnrich}
              disabled={isEnriching}
              className="glass-button gap-2"
            >
              {isEnriching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enriqueciendo...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Enriquecer con IA
                </>
              )}
            </Button>
          )}
          
          {!hasAudio && enrichedContent?.resumen_audio && (
            <Button
              onClick={handleGenerateAudio}
              disabled={isGeneratingAudio}
              variant="outline"
              className="glass-button gap-2"
            >
              {isGeneratingAudio ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generando audio...
                </>
              ) : (
                <>
                  <Headphones className="h-4 w-4" />
                  Generar Audio
                </>
              )}
            </Button>
          )}
          
          <div className="flex-1" />
          
          <Button
            onClick={onMarkComplete}
            variant={isCompleted ? "outline" : "default"}
            className={isCompleted ? "glass-button" : "bg-primary hover:bg-primary/90"}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Completada
              </>
            ) : (
              "Marcar como completada"
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
