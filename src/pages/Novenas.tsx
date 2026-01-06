import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NovenaCard } from "@/components/novenas/NovenaCard";
import { NovenaDiaDetail } from "@/components/novenas/NovenaDiaDetail";
import { useNovenas, Novena } from "@/hooks/useNovenas";
import { useNotifications } from "@/hooks/useNotifications";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Novenas = () => {
  const navigate = useNavigate();
  const { novenas, loading, startNovena, completeDia, getProgressForNovena, refetch, refetchNovenas } = useNovenas();
  const { checkPendingReminders } = useNotifications();
  const { toast } = useToast();
  const [selectedNovena, setSelectedNovena] = useState<Novena | null>(null);
  const [activeTab, setActiveTab] = useState("todas");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });

  const novenasWithoutImage = novenas.filter(n => !n.imagen_url);

  const generateAllImages = async () => {
    if (novenasWithoutImage.length === 0) {
      toast({
        title: "Todas las novenas tienen imagen",
        description: "No hay novenas pendientes de generar imagen",
      });
      return;
    }

    setIsGeneratingAll(true);
    setGenerationProgress({ current: 0, total: novenasWithoutImage.length });

    let successCount = 0;
    for (let i = 0; i < novenasWithoutImage.length; i++) {
      const novena = novenasWithoutImage[i];
      setGenerationProgress({ current: i + 1, total: novenasWithoutImage.length });
      
      try {
        const { error } = await supabase.functions.invoke('generate-novena-image', {
          body: {
            novenaId: novena.id,
            titulo: novena.titulo,
            descripcion: novena.descripcion
          }
        });

        if (!error) {
          successCount++;
        }
      } catch (error) {
        console.error(`Error generating image for ${novena.titulo}:`, error);
      }
    }

    setIsGeneratingAll(false);
    refetchNovenas();
    
    toast({
      title: "Generación completada",
      description: `Se generaron ${successCount} de ${novenasWithoutImage.length} imágenes`,
    });
  };

  // Check for pending reminders on mount
  useEffect(() => {
    checkPendingReminders();
  }, [checkPendingReminders]);

  const handleStartNovena = async (novena: Novena) => {
    const result = await startNovena(novena.id);
    if (result) {
      setSelectedNovena(novena);
    }
  };

  const handleContinueNovena = (novena: Novena) => {
    setSelectedNovena(novena);
  };

  const handleCompleteDia = async (dia: number) => {
    if (selectedNovena) {
      await completeDia(selectedNovena.id, dia);
    }
  };

  const novenasEnProgreso = novenas.filter(n => {
    const progress = getProgressForNovena(n.id);
    return progress && !progress.completada;
  });

  const novenasCompletadas = novenas.filter(n => {
    const progress = getProgressForNovena(n.id);
    return progress?.completada;
  });

  if (selectedNovena) {
    const progress = getProgressForNovena(selectedNovena.id);
    if (progress) {
      return (
        <div className="min-h-screen bg-background pb-20">
          <div className="container max-w-lg mx-auto p-4">
            <NovenaDiaDetail
              novena={selectedNovena}
              progress={progress}
              onComplete={handleCompleteDia}
              onBack={() => setSelectedNovena(null)}
              onUpdateReminder={() => refetch()}
            />
          </div>
          <BottomNavigation />
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-lg mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/oraciones")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Novenas</h1>
              <p className="text-muted-foreground text-sm">
                9 días de oración continua
              </p>
            </div>
          </div>
          
          {novenasWithoutImage.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={generateAllImages}
              disabled={isGeneratingAll}
              className="shrink-0"
            >
              {isGeneratingAll ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {generationProgress.current}/{generationProgress.total}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generar imágenes ({novenasWithoutImage.length})
                </>
              )}
            </Button>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-primary/10 rounded-lg p-4 flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-primary mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground">¿Qué es una novena?</p>
            <p className="text-muted-foreground mt-1">
              Una novena es una práctica de oración que se realiza durante nueve días 
              consecutivos, pidiendo una intención especial a Dios o a los santos.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="progreso">
              En Progreso {novenasEnProgreso.length > 0 && `(${novenasEnProgreso.length})`}
            </TabsTrigger>
            <TabsTrigger value="completadas">Completadas</TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="space-y-4 mt-4">
            {loading ? (
              <>
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </>
            ) : novenas.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay novenas disponibles
              </p>
            ) : (
              novenas.map((novena) => (
                <NovenaCard
                  key={novena.id}
                  novena={novena}
                  progress={getProgressForNovena(novena.id)}
                  onStart={() => handleStartNovena(novena)}
                  onContinue={() => handleContinueNovena(novena)}
                  onImageGenerated={refetchNovenas}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="progreso" className="space-y-4 mt-4">
            {novenasEnProgreso.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No tienes novenas en progreso
              </p>
            ) : (
              novenasEnProgreso.map((novena) => (
                <NovenaCard
                  key={novena.id}
                  novena={novena}
                  progress={getProgressForNovena(novena.id)}
                  onStart={() => handleStartNovena(novena)}
                  onContinue={() => handleContinueNovena(novena)}
                  onImageGenerated={refetchNovenas}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="completadas" className="space-y-4 mt-4">
            {novenasCompletadas.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aún no has completado ninguna novena
              </p>
            ) : (
              novenasCompletadas.map((novena) => (
                <NovenaCard
                  key={novena.id}
                  novena={novena}
                  progress={getProgressForNovena(novena.id)}
                  onStart={() => handleStartNovena(novena)}
                  onContinue={() => handleContinueNovena(novena)}
                  onImageGenerated={refetchNovenas}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Novenas;
