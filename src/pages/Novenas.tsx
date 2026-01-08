import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Sparkles, Loader2, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NovenaCard } from "@/components/novenas/NovenaCard";
import { NovenaDiaDetail } from "@/components/novenas/NovenaDiaDetail";
import { NovenasWhyModal } from "@/components/novenas/NovenasWhyModal";
import { useNovenas, Novena } from "@/hooks/useNovenas";
import { useNotifications } from "@/hooks/useNotifications";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 25 },
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
  const [showWhyModal, setShowWhyModal] = useState(false);

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
        <div className="min-h-screen flex w-full">
          <DesktopSidebar />
          <div className="flex-1 min-h-screen bg-background pb-20 lg:pb-8 lg:ml-64">
            <div className="container max-w-4xl mx-auto p-4 lg:p-8">
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
        </div>
      );
    }
  }

  const renderNovenasGrid = (novenasToRender: Novena[]) => (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {novenasToRender.map((novena) => (
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
  );

  const renderLoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="h-72 w-full rounded-2xl" />
      ))}
    </div>
  );

  const renderEmptyState = (icon: React.ReactNode, message: string) => (
    <motion.div 
      className="text-center py-16"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="glass-card rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
        {icon}
      </div>
      <p className="text-muted-foreground text-lg">{message}</p>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex w-full">
      <DesktopSidebar />
      <div className="flex-1 min-h-screen bg-background pb-20 lg:pb-8 lg:ml-64">
        {/* Hero Header */}
        <motion.div 
          className="relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 via-secondary/10 to-background" />
          <div className="relative z-10 container max-w-7xl mx-auto px-4 lg:px-8 pt-6 lg:pt-10 pb-4">
            {/* Back Button & Title */}
            <motion.div 
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={() => navigate("/oraciones")}
                  className="glass-button p-2.5 rounded-full lg:hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="h-5 w-5" />
                </motion.button>
                <div>
                  <h1 className="text-2xl lg:text-4xl font-bold font-heading">Novenas</h1>
                  <p className="text-muted-foreground text-sm lg:text-base mt-1">
                    9 días de oración continua para tus intenciones
                  </p>
                </div>
              </div>

              {/* Generate All Button */}
              {novenasWithoutImage.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateAllImages}
                  disabled={isGeneratingAll}
                  className="glass-button border-0 w-fit"
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
            </motion.div>

            {/* Info Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="glass-card rounded-2xl p-4 lg:p-5 flex items-start gap-4 max-w-3xl">
                <div className="p-2.5 rounded-full bg-primary/20 shrink-0">
                  <BookOpen className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground lg:text-lg">¿Qué es una novena?</p>
                  <p className="text-muted-foreground mt-1 text-sm lg:text-base">
                    Una práctica de oración durante nueve días consecutivos, 
                    pidiendo una intención especial con fe y perseverancia.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-primary hover:text-primary/80 hover:bg-primary/10 shrink-0"
                  onClick={() => setShowWhyModal(true)}
                >
                  <HelpCircle className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          </div>

          <NovenasWhyModal open={showWhyModal} onOpenChange={setShowWhyModal} />
        </motion.div>

        {/* Main Content */}
        <motion.div 
          className="container max-w-7xl mx-auto px-4 lg:px-8 py-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-3 glass-card border-0 mb-6">
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="progreso">
                Progreso {novenasEnProgreso.length > 0 && `(${novenasEnProgreso.length})`}
              </TabsTrigger>
              <TabsTrigger value="completadas">Completadas</TabsTrigger>
            </TabsList>

            <TabsContent value="todas" className="mt-0">
              {loading ? (
                renderLoadingSkeleton()
              ) : novenas.length === 0 ? (
                renderEmptyState(
                  <BookOpen className="h-12 w-12 text-muted-foreground/50" />,
                  "No hay novenas disponibles"
                )
              ) : (
                renderNovenasGrid(novenas)
              )}
            </TabsContent>

            <TabsContent value="progreso" className="mt-0">
              {novenasEnProgreso.length === 0 ? (
                renderEmptyState(
                  <BookOpen className="h-12 w-12 text-muted-foreground/50" />,
                  "No tienes novenas en progreso"
                )
              ) : (
                renderNovenasGrid(novenasEnProgreso)
              )}
            </TabsContent>

            <TabsContent value="completadas" className="mt-0">
              {novenasCompletadas.length === 0 ? (
                renderEmptyState(
                  <Sparkles className="h-12 w-12 text-muted-foreground/50" />,
                  "Aún no has completado ninguna novena"
                )
              ) : (
                renderNovenasGrid(novenasCompletadas)
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        <BottomNavigation />
      </div>
    </div>
  );
};

export default Novenas;
