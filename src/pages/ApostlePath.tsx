import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Flame, BookOpen, Swords, Trophy, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useApostlePath, Stage, StageRequirement } from '@/hooks/useApostlePath';
import { PathMap } from '@/components/apostle-path/PathMap';
import { StageCard } from '@/components/apostle-path/StageCard';
import { AIReflection } from '@/components/apostle-path/AIReflection';
import { PathAchievements } from '@/components/apostle-path/PathAchievements';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';
import { Loader2 } from 'lucide-react';

const ApostlePath = () => {
  const navigate = useNavigate();
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  
  const {
    progress,
    activities,
    loading,
    aiReflection,
    aiLoading,
    stages,
    isStageCompleted,
    isStageUnlocked,
    getStageProgress,
    getAIReflection,
    getCurrentStage,
    completeActivity,
    getCompletedActivityIds,
    isActivityCompleted,
  } = useApostlePath();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate('/auth');
    };
    checkAuth();
  }, [navigate]);

  const handleStageClick = (stage: Stage) => {
    setSelectedStage(stage);
  };

  const handleActivityClick = (stage: Stage, requirement: StageRequirement) => {
    // Navigate to the appropriate activity
    switch (requirement.tipo) {
      case 'leccion':
        navigate('/library');
        break;
      case 'debate':
        navigate('/coach');
        break;
      case 'mision':
        navigate('/mission');
        break;
      case 'reflexion':
        // Trigger AI reflection and scroll to AI section
        getAIReflection(stage.numero, 'reflexion');
        document.getElementById('ai-reflection-section')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'gratitud':
        navigate('/gratitude');
        break;
    }
  };

  const handleContinue = () => {
    const currentStageData = getCurrentStage();
    if (!currentStageData) return;

    // Find next incomplete activity using the hook's method
    for (const req of currentStageData.requisitos) {
      const activityId = req.id || req.titulo.toLowerCase().replace(/\s+/g, '-');
      if (!isActivityCompleted(currentStageData.numero, req.tipo, activityId)) {
        handleActivityClick(currentStageData, req);
        return;
      }
    }
  };

  // Calculate overall progress
  const overallProgress = stages.reduce((acc, stage) => {
    return acc + (isStageCompleted(stage.numero) ? 20 : (getStageProgress(stage.numero) * 0.2));
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentStage = getCurrentStage();

  return (
    <div className="min-h-screen flex w-full">
      <DesktopSidebar />
      <div className="flex-1 lg:ml-64 pb-20 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="lg:hidden">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">{progress?.puntos_ruta || 0} pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Banner Apologética Intro */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">¿Nuevo en la apologética?</h3>
                  <p className="text-sm text-muted-foreground">
                    Descubre qué es y los fundamentos básicos
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate('/apologetics-intro')} className="shrink-0">
                Ver Introducción
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Ruta del Apóstol
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tu camino de formación apologética. Completa las 5 etapas para convertirte en un apóstol preparado para defender y compartir tu fe.
          </p>
          
          {/* Overall Progress */}
          <div className="max-w-md mx-auto space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso total</span>
              <span className="font-medium">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <Flame className="w-6 h-6 mx-auto mb-2 text-orange-500" />
              <p className="text-2xl font-bold">{progress?.etapa_actual || 1}</p>
              <p className="text-xs text-muted-foreground">Etapa Actual</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <BookOpen className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{activities.filter(a => a.actividad_tipo === 'leccion').length}</p>
              <p className="text-xs text-muted-foreground">Lecciones</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Swords className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <p className="text-2xl font-bold">{activities.filter(a => a.actividad_tipo === 'debate').length}</p>
              <p className="text-xs text-muted-foreground">Debates</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">{stages.filter(s => isStageCompleted(s.numero)).length}</p>
              <p className="text-xs text-muted-foreground">Etapas Completas</p>
            </CardContent>
          </Card>
        </div>

        {/* Visual Path Map */}
        <Card className="overflow-hidden">
          <CardContent className="pt-6">
            <PathMap
              stages={stages}
              currentStage={progress?.etapa_actual || 1}
              isStageCompleted={isStageCompleted}
              isStageUnlocked={isStageUnlocked}
              getStageProgress={getStageProgress}
              onStageClick={handleStageClick}
            />
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Current Stage / Selected Stage */}
          <div className="lg:col-span-2 space-y-6">
            {(selectedStage || currentStage) && (
              <StageCard
                stage={selectedStage || currentStage!}
                isUnlocked={isStageUnlocked((selectedStage || currentStage!).numero)}
                isCompleted={isStageCompleted((selectedStage || currentStage!).numero)}
                isCurrent={(selectedStage || currentStage!).numero === (progress?.etapa_actual || 1)}
                progress={getStageProgress((selectedStage || currentStage!).numero)}
                completedActivities={getCompletedActivityIds((selectedStage || currentStage!).numero)}
                onContinue={handleContinue}
                onActivityClick={(req) => handleActivityClick(selectedStage || currentStage!, req)}
              />
            )}

            {/* All Stages (collapsible on mobile) */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Todas las Etapas</h2>
              <div className="grid gap-4">
                {stages.map((stage) => (
                  <motion.button
                    key={stage.numero}
                    onClick={() => setSelectedStage(stage)}
                    className={`text-left p-4 rounded-lg border transition-all ${
                      selectedStage?.numero === stage.numero
                        ? 'ring-2 ring-primary border-primary'
                        : 'hover:border-primary/50'
                    } ${!isStageUnlocked(stage.numero) ? 'opacity-50' : ''}`}
                    whileHover={isStageUnlocked(stage.numero) ? { scale: 1.01 } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{stage.icono}</span>
                      <div className="flex-1">
                        <p className="font-medium">{stage.nombre}</p>
                        <p className="text-sm text-muted-foreground">{stage.subtitulo}</p>
                      </div>
                      {isStageCompleted(stage.numero) && (
                        <span className="text-green-500">✓</span>
                      )}
                      {isStageUnlocked(stage.numero) && !isStageCompleted(stage.numero) && (
                        <span className="text-sm text-primary">{getStageProgress(stage.numero)}%</span>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Guidance */}
            <div id="ai-reflection-section">
            <AIReflection
              reflection={aiReflection}
              loading={aiLoading}
              currentStage={progress?.etapa_actual || 1}
              onGetReflection={(tipo) => getAIReflection(progress?.etapa_actual || 1, tipo)}
            />
            </div>

            {/* Achievements */}
            <PathAchievements
              stages={stages}
              isStageCompleted={isStageCompleted}
            />
          </div>
        </div>
      </div>

      <BottomNavigation />
      </div>
    </div>
  );
};

export default ApostlePath;
