import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NovenaCard } from "@/components/novenas/NovenaCard";
import { NovenaDiaDetail } from "@/components/novenas/NovenaDiaDetail";
import { useNovenas, Novena } from "@/hooks/useNovenas";
import { useNotifications } from "@/hooks/useNotifications";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

const Novenas = () => {
  const navigate = useNavigate();
  const { novenas, loading, startNovena, completeDia, getProgressForNovena, refetch, refetchNovenas } = useNovenas();
  const { checkPendingReminders } = useNotifications();
  const [selectedNovena, setSelectedNovena] = useState<Novena | null>(null);
  const [activeTab, setActiveTab] = useState("todas");

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
