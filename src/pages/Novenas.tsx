import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 200, damping: 20 },
  },
} as const;

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
      {/* Hero Header */}
      <motion.div 
        className="relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 via-secondary/10 to-background" />
        <div className="relative z-10 p-5 pt-8">
          {/* Back Button & Title */}
          <motion.div 
            className="flex items-center gap-4 mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.button
              onClick={() => navigate("/oraciones")}
              className="glass-button p-2 rounded-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="h-5 w-5" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold font-heading">Novenas</h1>
              <p className="text-muted-foreground text-sm">
                9 días de oración continua
              </p>
            </div>
          </motion.div>

          {/* Generate All Button */}
          {novenasWithoutImage.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={generateAllImages}
                disabled={isGeneratingAll}
                className="glass-button border-0"
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
            </motion.div>
          )}
        </div>

        {/* Info Card */}
        <motion.div 
          className="px-5 pb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="glass-card rounded-2xl p-4 flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/20">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-foreground">¿Qué es una novena?</p>
              <p className="text-muted-foreground mt-1">
                Una práctica de oración durante nueve días consecutivos, 
                pidiendo una intención especial.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Tabs */}
      <motion.div 
        className="px-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 glass-card border-0">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="progreso">
              Progreso {novenasEnProgreso.length > 0 && `(${novenasEnProgreso.length})`}
            </TabsTrigger>
            <TabsTrigger value="completadas">Completadas</TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="mt-4">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-40 w-full rounded-2xl" />
                <Skeleton className="h-40 w-full rounded-2xl" />
              </div>
            ) : novenas.length === 0 ? (
              <motion.p 
                className="text-center text-muted-foreground py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                No hay novenas disponibles
              </motion.p>
            ) : (
              <motion.div 
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {novenas.map((novena) => (
                  <motion.div key={novena.id} variants={cardVariants}>
                    <NovenaCard
                      novena={novena}
                      progress={getProgressForNovena(novena.id)}
                      onStart={() => handleStartNovena(novena)}
                      onContinue={() => handleContinueNovena(novena)}
                      onImageGenerated={refetchNovenas}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="progreso" className="mt-4">
            {novenasEnProgreso.length === 0 ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="glass-card rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground">No tienes novenas en progreso</p>
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {novenasEnProgreso.map((novena) => (
                  <motion.div key={novena.id} variants={cardVariants}>
                    <NovenaCard
                      novena={novena}
                      progress={getProgressForNovena(novena.id)}
                      onStart={() => handleStartNovena(novena)}
                      onContinue={() => handleContinueNovena(novena)}
                      onImageGenerated={refetchNovenas}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="completadas" className="mt-4">
            {novenasCompletadas.length === 0 ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="glass-card rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground">Aún no has completado ninguna novena</p>
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {novenasCompletadas.map((novena) => (
                  <motion.div key={novena.id} variants={cardVariants}>
                    <NovenaCard
                      novena={novena}
                      progress={getProgressForNovena(novena.id)}
                      onStart={() => handleStartNovena(novena)}
                      onContinue={() => handleContinueNovena(novena)}
                      onImageGenerated={refetchNovenas}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      <BottomNavigation />
    </div>
  );
};

export default Novenas;
