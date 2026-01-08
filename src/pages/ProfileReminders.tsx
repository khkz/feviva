import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Sun, 
  BookOpen, 
  Heart, 
  Moon, 
  Book,
  ArrowLeft, 
  ArrowRight, 
  Check, 
  ChevronLeft,
  Sparkles,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNotifications } from "@/hooks/useNotifications";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { supabase } from "@/integrations/supabase/client";

const STEPS = [
  { 
    id: 'intro', 
    title: 'Bienvenida', 
    icon: Bell,
    practice: null 
  },
  { 
    id: 'laudes', 
    title: 'Ritual Matutino', 
    icon: Sun,
    practice: 'laudes',
    defaultHour: '07:00',
    description: 'Comienza cada día con las Laudes, versículo y reflexión espiritual.',
    benefit: 'Empezar el día conectado con Dios te dará paz y propósito.'
  },
  { 
    id: 'rosario', 
    title: 'Santo Rosario', 
    icon: BookOpen,
    practice: 'rosario',
    defaultHour: '12:00',
    description: 'Medita los misterios de la vida de Cristo junto a María.',
    benefit: 'El rosario diario fortalece tu fe y te acerca a la Virgen María.'
  },
  { 
    id: 'biblia', 
    title: 'Lectura Bíblica', 
    icon: Book,
    practice: 'biblia',
    defaultHour: '08:00',
    description: 'Lee la Biblia en 365 días con The Great Adventure.',
    benefit: 'La Palabra de Dios iluminará tu camino cada día.'
  },
  { 
    id: 'gratitud', 
    title: 'Diario de Gratitud', 
    icon: Heart,
    practice: 'gratitud',
    defaultHour: '22:00',
    description: 'Escribe por qué estás agradecido cada noche.',
    benefit: 'La gratitud transforma tu perspectiva y aumenta tu felicidad.'
  },
  { 
    id: 'examen', 
    title: 'Examen de Conciencia', 
    icon: Moon,
    practice: 'examen',
    defaultHour: '21:00',
    description: 'Reflexiona sobre tu día antes de dormir.',
    benefit: 'El examen nocturno te ayuda a crecer espiritualmente.'
  },
  { 
    id: 'resumen', 
    title: 'Tus Recordatorios', 
    icon: Sparkles,
    practice: null 
  },
];

const ProfileReminders = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [localReminders, setLocalReminders] = useState<Record<string, { enabled: boolean; hour: string }>>({});
  
  const { 
    isSupported, 
    permission, 
    requestPermission, 
    practiceReminders,
    savePracticeReminder 
  } = useNotifications();

  // Check auth
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);

  // Initialize local state from practiceReminders
  useEffect(() => {
    const initial: Record<string, { enabled: boolean; hour: string }> = {};
    practiceReminders.forEach(p => {
      initial[p.practice] = { enabled: p.enabled, hour: p.hour };
    });
    setLocalReminders(initial);
  }, [practiceReminders]);

  const currentStepData = STEPS[currentStep];
  const StepIcon = currentStepData.icon;

  const handleToggle = async (practice: string, enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }
    
    setLocalReminders(prev => ({
      ...prev,
      [practice]: { ...prev[practice], enabled }
    }));
  };

  const handleHourChange = (practice: string, hour: string) => {
    setLocalReminders(prev => ({
      ...prev,
      [practice]: { ...prev[practice], hour }
    }));
  };

  const handleNext = () => {
    // Save current practice reminder if on a practice step
    const practice = currentStepData.practice;
    if (practice && localReminders[practice]) {
      savePracticeReminder(
        practice, 
        localReminders[practice].enabled, 
        localReminders[practice].hour
      );
    }
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    navigate('/profile');
  };

  const handleSkip = () => {
    const practice = currentStepData.practice;
    if (practice) {
      setLocalReminders(prev => ({
        ...prev,
        [practice]: { enabled: false, hour: prev[practice]?.hour || '12:00' }
      }));
      savePracticeReminder(practice, false, localReminders[practice]?.hour || '12:00');
    }
    handleNext();
  };

  const getEnabledCount = () => {
    return Object.values(localReminders).filter(r => r.enabled).length;
  };

  const renderStep = () => {
    switch (currentStepData.id) {
      case 'intro':
        return (
          <Card className="glass-card border-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
            <CardContent className="relative pt-8 pb-8 text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="relative mx-auto w-24 h-24"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/50 rounded-full animate-pulse" />
                <div className="absolute inset-2 bg-background rounded-full flex items-center justify-center">
                  <Bell className="h-10 w-10 text-primary" />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Configura tus recordatorios
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Te ayudaremos a mantener tus prácticas espirituales diarias con recordatorios personalizados.
                </p>
              </motion.div>
              
              {!isSupported && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm"
                >
                  Tu navegador no soporta notificaciones
                </motion.div>
              )}
              
              {permission === 'denied' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-amber-500/10 text-amber-600 p-3 rounded-lg text-sm"
                >
                  Has bloqueado las notificaciones. Actívalas en la configuración del navegador.
                </motion.div>
              )}
            </CardContent>
          </Card>
        );

      case 'resumen':
        return (
          <Card className="glass-card border-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-primary/10" />
            <CardHeader className="relative">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-center text-2xl">¡Configuración completa!</CardTitle>
              <CardDescription className="text-center">
                {getEnabledCount() > 0 
                  ? `Tienes ${getEnabledCount()} recordatorio${getEnabledCount() > 1 ? 's' : ''} activo${getEnabledCount() > 1 ? 's' : ''}`
                  : 'No has activado ningún recordatorio. Puedes hacerlo cuando quieras.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-3">
              {STEPS.filter(s => s.practice).map(step => {
                const reminder = localReminders[step.practice!];
                const Icon = step.icon;
                return (
                  <div 
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      reminder?.enabled 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'bg-muted/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      reminder?.enabled ? 'bg-primary/20' : 'bg-muted'
                    }`}>
                      <Icon className={`h-5 w-5 ${reminder?.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${reminder?.enabled ? '' : 'text-muted-foreground'}`}>
                        {step.title}
                      </p>
                      {reminder?.enabled && (
                        <p className="text-sm text-primary">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {reminder.hour}
                        </p>
                      )}
                    </div>
                    {reminder?.enabled ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <span className="text-xs text-muted-foreground">Inactivo</span>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );

      default:
        // Practice configuration step
        const practice = currentStepData.practice!;
        const reminder = localReminders[practice] || { enabled: false, hour: currentStepData.defaultHour };
        
        return (
          <Card className="glass-card border-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-primary/5" />
            <CardContent className="relative pt-6 pb-6 space-y-6">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary/30 to-primary/20 flex items-center justify-center mx-auto mb-4"
                >
                  <StepIcon className="h-10 w-10 text-secondary" />
                </motion.div>
                <h2 className="text-xl font-bold mb-2">{currentStepData.title}</h2>
                <p className="text-muted-foreground text-sm">
                  {currentStepData.description}
                </p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-xl">
                <p className="text-sm text-muted-foreground flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                  {currentStepData.benefit}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-primary" />
                    <Label htmlFor={`toggle-${practice}`} className="font-medium cursor-pointer">
                      Activar recordatorio
                    </Label>
                  </div>
                  <Switch
                    id={`toggle-${practice}`}
                    checked={reminder.enabled}
                    onCheckedChange={(checked) => handleToggle(practice, checked)}
                  />
                </div>
                
                {reminder.enabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <Label htmlFor={`hour-${practice}`} className="text-sm text-muted-foreground">
                      Hora del recordatorio
                    </Label>
                    <Input
                      id={`hour-${practice}`}
                      type="time"
                      value={reminder.hour}
                      onChange={(e) => handleHourChange(practice, e.target.value)}
                      className="bg-background/50"
                    />
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      <DesktopSidebar />
      <div className="flex-1 lg:ml-64 pb-20 md:pb-8">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/profile')}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Perfil
              </Button>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <h1 className="font-semibold">Recordatorios</h1>
              </div>
              <div className="w-16" />
            </div>
            
            {/* Progress Bar */}
            <div className="flex gap-1">
              {STEPS.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => index <= currentStep && setCurrentStep(index)}
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    index <= currentStep 
                      ? 'bg-primary' 
                      : 'bg-muted'
                  } ${index < currentStep ? 'cursor-pointer hover:opacity-80' : ''}`}
                  disabled={index > currentStep}
                />
              ))}
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto p-4 space-y-6">
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
              {currentStepData.title}
            </span>
          </motion.div>

          {/* Step Content */}
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
          <div className="flex gap-3 pt-4">
            {currentStep > 0 && currentStep < STEPS.length - 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
            )}

            {currentStep === STEPS.length - 1 ? (
              <Button
                onClick={handleFinish}
                className="flex-1 bg-gradient-to-r from-primary to-secondary"
              >
                <Check className="w-4 h-4 mr-2" />
                Finalizar
              </Button>
            ) : currentStepData.practice ? (
              <div className="flex gap-2 flex-1">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="flex-1"
                >
                  Omitir
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1"
                >
                  {localReminders[currentStepData.practice]?.enabled ? 'Guardar' : 'Siguiente'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleNext}
                className="flex-1"
              >
                Comenzar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </main>

        <BottomNavigation />
      </div>
    </div>
  );
};

export default ProfileReminders;
