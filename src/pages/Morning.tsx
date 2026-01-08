import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useDailyContent } from "@/hooks/useDailyContent";
import { useUserStats } from "@/hooks/useUserStats";
import { DailyVerse } from "@/components/rituals/DailyVerse";
import { LaudesOracion } from "@/components/rituals/LaudesOracion";
import { ReflexionCard } from "@/components/rituals/ReflexionCard";
import { TipApologeticoCard } from "@/components/rituals/TipApologeticoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sun, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Target, 
  Shield, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Flame,
  BookOpen,
  Heart
} from "lucide-react";

const STEPS = [
  { id: 'saludo', title: 'Buenos días', icon: Sun },
  { id: 'versiculo', title: 'Versículo del día', icon: BookOpen },
  { id: 'reflexion', title: 'Reflexión', icon: Sparkles },
  { id: 'laudes', title: 'Oración de Laudes', icon: Heart },
  { id: 'meta', title: 'Meta de evangelización', icon: Target },
  { id: 'tip', title: 'Tip apologético', icon: Shield },
];

const Morning = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { content, ritual, loading, generating, completeMorningRitual } = useDailyContent();
  const { stats, addPoints } = useUserStats();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [metaEvangelizacion, setMetaEvangelizacion] = useState('');
  const [profile, setProfile] = useState<{ nombre: string } | null>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      
      const { data } = await supabase
        .from('profiles')
        .select('nombre')
        .eq('id', user.id)
        .single();
      
      if (data) setProfile(data);
    };
    
    fetchProfile();
  }, [navigate]);

  const handleComplete = async () => {
    if (ritual?.ritual_matutino_completado) {
      toast({
        title: "Ya completaste el ritual matutino",
        description: "¡Buen trabajo! Vuelve esta noche para el ritual nocturno.",
      });
      navigate('/dashboard');
      return;
    }

    setCompleting(true);
    try {
      await completeMorningRitual(metaEvangelizacion);
      await addPoints(15, 'Ritual matutino completado');
      
      toast({
        title: "¡Ritual matutino completado!",
        description: "+15 puntos. ¡Que tengas un día bendecido!",
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo completar el ritual. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setCompleting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (loading || generating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/10 via-background to-background">
        <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <div className="flex items-center justify-center gap-3 text-muted-foreground pt-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
              <Loader2 className="h-6 w-6 animate-spin text-primary relative z-10" />
            </div>
            <span className="font-medium">{generating ? 'Preparando tu ritual matutino...' : 'Cargando...'}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/10 via-background to-background flex items-center justify-center p-4">
        <Card className="glass-card max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Sun className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-bold">No hay contenido disponible</h1>
            <p className="text-muted-foreground text-sm">No se pudo cargar el contenido del día. Intenta de nuevo más tarde.</p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const StepIcon = STEPS[currentStep].icon;

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'saludo':
        return (
          <Card className="glass-card border-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-transparent to-primary/10" />
            <CardContent className="relative pt-8 pb-8 text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="relative mx-auto w-24 h-24"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-secondary to-secondary/50 rounded-full animate-pulse" />
                <div className="absolute inset-2 bg-background rounded-full flex items-center justify-center">
                  <Sun className="h-10 w-10 text-secondary" />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Buenos días, {profile?.nombre?.split(' ')[0] || 'peregrino'}
                </h2>
                <p className="text-muted-foreground capitalize">
                  {new Date().toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    day: 'numeric',
                    month: 'long'
                  })}
                </p>
              </motion.div>
              
              {stats && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary"
                >
                  <Flame className="h-4 w-4" />
                  <span className="font-semibold text-sm">{stats.racha_actual_dias} días de racha</span>
                </motion.div>
              )}
              
              {ritual?.ritual_matutino_completado && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium text-sm">Ritual completado hoy</span>
                </motion.div>
              )}
            </CardContent>
          </Card>
        );
      
      case 'versiculo':
        return (
          <DailyVerse
            referencia={content.versiculo_referencia}
            texto={content.versiculo_texto}
            audioUrl={content.audio_versiculo_url}
          />
        );
      
      case 'reflexion':
        return (
          <ReflexionCard
            contenido={content.reflexion_ia}
            audioUrl={content.audio_reflexion_url}
          />
        );
      
      case 'laudes':
        return (
          <LaudesOracion 
            contenido={content.oracion_laudes} 
            audioUrl={content.audio_laudes_url}
            tipo="laudes"
          />
        );
      
      case 'meta':
        return (
          <Card className="glass-card border-0">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent rounded-xl" />
            <CardHeader className="relative pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center">
                  <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-green-700 dark:text-green-400">Meta de evangelización</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <p className="text-muted-foreground text-sm">
                Define tu compromiso para compartir la fe hoy
              </p>
              <Textarea
                value={metaEvangelizacion}
                onChange={(e) => setMetaEvangelizacion(e.target.value)}
                placeholder="Ej: Hablar con un compañero sobre mi fe..."
                className="min-h-[100px] bg-background/50 border-green-200/50 dark:border-green-800/30 focus:border-green-500/50 resize-none"
              />
              <div className="bg-muted/50 p-4 rounded-xl">
                <p className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-secondary" />
                  Ideas para hoy
                </p>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-secondary">•</span>
                    Compartir un versículo en redes sociales
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary">•</span>
                    Invitar a un amigo a la iglesia
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary">•</span>
                    Ofrecer ayuda a alguien necesitado
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'tip':
        return (
          <TipApologeticoCard
            contenido={content.tip_apologetico}
            audioUrl={content.audio_tip_url}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/10 via-background to-background">
      {/* Header */}
      <header className="sticky top-0 z-10 glass-nav border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver</span>
          </Button>
          
          <div className="flex items-center gap-2 text-secondary">
            <Sun className="h-5 w-5" />
            <span className="font-semibold text-foreground">Ritual Matutino</span>
          </div>
          
          <div className="w-16 sm:w-20" />
        </div>
        
        {/* Progress bar */}
        <div className="px-4 pb-3">
          <div className="max-w-2xl mx-auto flex gap-1.5">
            {STEPS.map((step, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  index < currentStep 
                    ? 'bg-primary' 
                    : index === currentStep 
                      ? 'bg-secondary shadow-glow' 
                      : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Step indicator */}
        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 text-sm"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <StepIcon className="h-4 w-4 text-primary" />
          </div>
          <span className="text-muted-foreground">
            Paso {currentStep + 1} de {STEPS.length}
          </span>
          <span className="text-foreground font-medium">
            {STEPS[currentStep].title}
          </span>
        </motion.div>
        
        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4 gap-3">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex-1 sm:flex-none"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Anterior</span>
          </Button>
          
          {currentStep === STEPS.length - 1 ? (
            <Button 
              onClick={handleComplete}
              disabled={completing || ritual?.ritual_matutino_completado}
              className="flex-1 sm:flex-none bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:from-secondary/90 hover:to-secondary/70 shadow-glow"
            >
              {completing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Completando...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Comenzar mi día</span>
                  <span className="sm:hidden">Completar</span>
                  <Sun className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button onClick={nextStep} className="flex-1 sm:flex-none">
              <span className="hidden sm:inline">Siguiente</span>
              <span className="sm:hidden">Continuar</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default Morning;
