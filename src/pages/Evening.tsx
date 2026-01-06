import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useDailyContent } from "@/hooks/useDailyContent";
import { useUserStats } from "@/hooks/useUserStats";
import { CompletasOracion } from "@/components/rituals/CompletasOracion";
import { ExamenConciencia } from "@/components/rituals/ExamenConciencia";
import { AudioPlayer } from "@/components/rituals/AudioPlayer";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Moon, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen,
  MessageSquare,
  PenLine,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Star
} from "lucide-react";

const STEPS = [
  { id: 'examen', title: 'Examen de conciencia' },
  { id: 'evangelizacion', title: 'Evangelización del día' },
  { id: 'diario', title: 'Diario personal' },
  { id: 'completas', title: 'Oración de Completas' },
  { id: 'ensenanza', title: 'Enseñanza del día' },
];

const Evening = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { content, ritual, loading, generating, completeEveningRitual } = useDailyContent();
  const { stats, addPoints } = useUserStats();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [examenConciencia, setExamenConciencia] = useState<Record<string, string>>({});
  const [compartioFe, setCompartioFe] = useState(false);
  const [notasEvangelizacion, setNotasEvangelizacion] = useState('');
  const [diarioPersonal, setDiarioPersonal] = useState('');
  const [profile, setProfile] = useState<{ nombre: string } | null>(null);
  const [completing, setCompleting] = useState(false);
  const [examenCompleted, setExamenCompleted] = useState(false);

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

  // Pre-fill from existing ritual data
  useEffect(() => {
    if (ritual) {
      if (ritual.examen_conciencia) {
        setExamenConciencia(ritual.examen_conciencia);
        setExamenCompleted(true);
      }
      if (ritual.diario_personal) setDiarioPersonal(ritual.diario_personal);
      if (ritual.compartio_fe) setCompartioFe(ritual.compartio_fe);
      if (ritual.notas_evangelizacion) setNotasEvangelizacion(ritual.notas_evangelizacion);
    }
  }, [ritual]);

  const handleComplete = async () => {
    if (ritual?.ritual_nocturno_completado) {
      toast({
        title: "Ya completaste el ritual nocturno",
        description: "¡Descansa en paz! Vuelve mañana para un nuevo día.",
      });
      navigate('/dashboard');
      return;
    }

    setCompleting(true);
    try {
      await completeEveningRitual({
        examenConciencia,
        diarioPersonal,
        compartioFe,
        notasEvangelizacion
      });
      
      let totalPoints = 15;
      if (compartioFe) totalPoints += 25;
      
      await addPoints(totalPoints, 'Ritual nocturno completado');
      
      toast({
        title: "¡Ritual nocturno completado!",
        description: `+${totalPoints} puntos. Que los ángeles te guarden esta noche.`,
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

  const handleExamenComplete = (values: Record<string, string>) => {
    setExamenConciencia(values);
    setExamenCompleted(true);
    nextStep();
  };

  if (loading || generating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-background dark:from-indigo-950/20 p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{generating ? 'Generando contenido con IA...' : 'Cargando...'}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-background dark:from-indigo-950/20 p-4 md:p-8">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h1 className="text-2xl font-bold">No hay contenido disponible</h1>
          <p className="text-muted-foreground">No se pudo cargar el contenido del día.</p>
          <Button onClick={() => navigate('/dashboard')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'examen':
        return examenCompleted ? (
          <Card className="border-purple-200/50">
            <CardContent className="pt-6 text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
              <h3 className="text-lg font-medium">Examen completado</h3>
              <p className="text-muted-foreground">Has reflexionado sobre tu día.</p>
              <Button 
                variant="outline" 
                onClick={() => setExamenCompleted(false)}
              >
                Revisar respuestas
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ExamenConciencia
            initialValues={examenConciencia}
            onComplete={handleExamenComplete}
          />
        );
      
      case 'evangelizacion':
        return (
          <Card className="border-green-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <MessageSquare className="h-5 w-5" />
                Evangelización del día
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {ritual?.meta_evangelizacion && (
                <div className="bg-secondary/20 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Tu meta de hoy era:</p>
                  <p className="font-medium">{ritual.meta_evangelizacion}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <Label htmlFor="compartio-fe" className="flex-1">
                  ¿Compartiste tu fe hoy?
                </Label>
                <Switch
                  id="compartio-fe"
                  checked={compartioFe}
                  onCheckedChange={setCompartioFe}
                />
              </div>
              
              {compartioFe && (
                <div className="space-y-2">
                  <Label htmlFor="notas-evangelizacion">
                    Cuéntanos sobre tu experiencia
                  </Label>
                  <Textarea
                    id="notas-evangelizacion"
                    value={notasEvangelizacion}
                    onChange={(e) => setNotasEvangelizacion(e.target.value)}
                    placeholder="¿Con quién hablaste? ¿Cómo fue la conversación?"
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    +25 puntos por compartir tu fe 🌟
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      
      case 'diario':
        return (
          <Card className="border-amber-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <PenLine className="h-5 w-5" />
                Diario personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Escribe libremente tus pensamientos, oraciones o reflexiones del día.
              </p>
              <Textarea
                value={diarioPersonal}
                onChange={(e) => setDiarioPersonal(e.target.value)}
                placeholder="Hoy aprendí... Sentí gratitud por... Necesito orar por..."
                className="min-h-[200px]"
              />
            </CardContent>
          </Card>
        );
      
      case 'completas':
        return <CompletasOracion contenido={content.oracion_completas} />;
      
      case 'ensenanza':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {content.ensenanza_titulo || 'Enseñanza del día'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {content.audio_ensenanza_url && (
                <AudioPlayer 
                  src={content.audio_ensenanza_url} 
                  title="Escuchar enseñanza"
                />
              )}
              
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {content.ensenanza_contenido?.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-foreground leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-background dark:from-indigo-950/20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Moon className="h-5 w-5" />
            <span className="font-medium">Ritual Nocturno</span>
          </div>
          <div className="w-20" />
        </div>
        
        {/* Progress bar */}
        <div className="flex gap-1 px-4 pb-2">
          {STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-colors ${
                index <= currentStep ? 'bg-indigo-500' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="text-sm text-muted-foreground text-center">
          Paso {currentStep + 1} de {STEPS.length}: {STEPS[currentStep].title}
        </div>
        
        {ritual?.ritual_nocturno_completado && (
          <Card className="border-green-200/50 bg-green-50/50 dark:bg-green-950/20">
            <CardContent className="pt-6 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-green-700 dark:text-green-400">
                Ya completaste el ritual nocturno de hoy
              </span>
            </CardContent>
          </Card>
        )}
        
        {renderStep()}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          
          {currentStep === STEPS.length - 1 ? (
            <Button 
              onClick={handleComplete}
              disabled={completing || ritual?.ritual_nocturno_completado}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {completing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Completando...
                </>
              ) : (
                <>
                  Descansar en paz
                  <Star className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={nextStep}
              disabled={STEPS[currentStep].id === 'examen' && !examenCompleted}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default Evening;
