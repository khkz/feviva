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
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Sun, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Target, 
  Shield, 
  ArrowLeft,
  Loader2,
  CheckCircle2
} from "lucide-react";

const STEPS = [
  { id: 'saludo', title: 'Buenos días' },
  { id: 'versiculo', title: 'Versículo del día' },
  { id: 'reflexion', title: 'Reflexión' },
  { id: 'laudes', title: 'Oración de Laudes' },
  { id: 'meta', title: 'Meta de evangelización' },
  { id: 'tip', title: 'Tip apologético' },
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
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/20 p-4 md:p-8">
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
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/20 p-4 md:p-8">
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
      case 'saludo':
        return (
          <Card className="border-amber-200/50">
            <CardContent className="pt-6 text-center space-y-4">
              <Sun className="h-16 w-16 mx-auto text-amber-500" />
              <h2 className="text-3xl font-bold text-foreground">
                Buenos días, {profile?.nombre || 'peregrino'}
              </h2>
              <p className="text-muted-foreground">
                {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              {stats && (
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-medium">Racha: {stats.racha_actual_dias} días</span>
                </div>
              )}
              {ritual?.ritual_matutino_completado && (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Ya completaste el ritual de hoy</span>
                </div>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Reflexión del día
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {content.reflexion_ia.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-foreground leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      
      case 'laudes':
        return <LaudesOracion contenido={content.oracion_laudes} />;
      
      case 'meta':
        return (
          <Card className="border-green-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Target className="h-5 w-5" />
                Meta de evangelización
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                ¿Cuál será tu compromiso de compartir la fe hoy?
              </p>
              <Textarea
                value={metaEvangelizacion}
                onChange={(e) => setMetaEvangelizacion(e.target.value)}
                placeholder="Ej: Hablar con un compañero de trabajo sobre mi fe, invitar a alguien a misa..."
                className="min-h-[100px]"
              />
              <div className="bg-secondary/20 p-3 rounded-lg text-sm text-muted-foreground">
                <p className="font-medium mb-1">💡 Ideas:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Compartir un versículo en redes sociales</li>
                  <li>Invitar a un amigo a la iglesia</li>
                  <li>Ofrecer ayuda a alguien necesitado</li>
                  <li>Iniciar una conversación sobre Dios</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'tip':
        return (
          <Card className="border-blue-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Shield className="h-5 w-5" />
                Tip apologético del día
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground leading-relaxed">
                {content.tip_apologetico}
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/coach')}
              >
                Practicar con el Coach de Debate
              </Button>
            </CardContent>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Sun className="h-5 w-5" />
            <span className="font-medium">Ritual Matutino</span>
          </div>
          <div className="w-20" />
        </div>
        
        {/* Progress bar */}
        <div className="flex gap-1 px-4 pb-2">
          {STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-colors ${
                index <= currentStep ? 'bg-amber-500' : 'bg-muted'
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
              disabled={completing || ritual?.ritual_matutino_completado}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {completing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Completando...
                </>
              ) : (
                <>
                  Comenzar mi día
                  <Sun className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button onClick={nextStep}>
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default Morning;
