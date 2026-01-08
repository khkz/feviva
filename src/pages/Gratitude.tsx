import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sun, BookOpen, Sparkles, ArrowLeft, ArrowRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGratitudeJournal } from "@/hooks/useGratitudeJournal";
import { useGratitudeExperience } from "@/hooks/useGratitudeExperience";
import { GratitudeBienvenida } from "@/components/gratitude/GratitudeBienvenida";
import { GratitudeReflexion } from "@/components/gratitude/GratitudeReflexion";
import { GratitudeDiario } from "@/components/gratitude/GratitudeDiario";
import { GratitudeCierre } from "@/components/gratitude/GratitudeCierre";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { ReminderButton } from "@/components/shared/ReminderButton";
import { supabase } from "@/integrations/supabase/client";

const STEPS = [
  { id: 'bienvenida', title: 'Bienvenida', icon: Sun },
  { id: 'reflexion', title: 'Reflexión', icon: BookOpen },
  { id: 'diario', title: 'Tu gratitud', icon: Heart },
  { id: 'cierre', title: 'Cierre', icon: Sparkles },
];

const Gratitude = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [gratitudes, setGratitudes] = useState<string[]>(["", "", ""]);
  const [profile, setProfile] = useState<{ nombre: string } | null>(null);
  const [savedReflexion, setSavedReflexion] = useState<{ reflexion: string; versiculo: string } | null>(null);

  const { session, progress, totalSessions, loading: loadingExperience, advanceSession } = useGratitudeExperience();
  const { todayEntry, saving, saveEntry } = useGratitudeJournal();

  // Check auth and fetch profile
  useEffect(() => {
    const init = async () => {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession) {
        navigate('/auth');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('nombre')
        .eq('id', authSession.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }
    };
    init();
  }, [navigate]);

  // Pre-fill with today's entry if exists
  useEffect(() => {
    if (todayEntry) {
      setGratitudes([
        todayEntry.entrada_1 || "",
        todayEntry.entrada_2 || "",
        todayEntry.entrada_3 || ""
      ]);
      if (todayEntry.reflexion_biblica) {
        setSavedReflexion({
          reflexion: todayEntry.reflexion_biblica,
          versiculo: todayEntry.versiculo_sugerido || ""
        });
      }
    }
  }, [todayEntry]);

  const handleGratitudeChange = (index: number, value: string) => {
    const newGratitudes = [...gratitudes];
    newGratitudes[index] = value;
    setGratitudes(newGratitudes);
  };

  const handleSaveGratitudes = async () => {
    const success = await saveEntry(gratitudes);
    if (success) {
      // Re-fetch to get the new reflection
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const today = new Date().toISOString().split('T')[0];
        const { data: updatedEntry } = await supabase
          .from('gratitude_entries')
          .select('reflexion_biblica, versiculo_sugerido')
          .eq('user_id', user.id)
          .eq('fecha', today)
          .single();

        if (updatedEntry) {
          setSavedReflexion({
            reflexion: updatedEntry.reflexion_biblica || "",
            versiculo: updatedEntry.versiculo_sugerido || ""
          });
        }
      }

      await advanceSession();
      setCurrentStep(3);
    }
  };

  const canProceed = () => {
    if (currentStep === 2) {
      return gratitudes.filter(g => g.trim().length > 0).length >= 1;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 2) {
      handleSaveGratitudes();
    } else if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    navigate('/dashboard');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <GratitudeBienvenida
            nombre={profile?.nombre}
            sesionActual={progress?.sesion_actual || 1}
            totalSesiones={totalSessions}
            tituloSesion={session?.titulo || "Cimientos fuertes"}
          />
        );
      case 1:
        return (
          <GratitudeReflexion
            titulo={session?.titulo || ""}
            descripcion={session?.descripcion || ""}
            duracionMin={session?.duracion_min || 5}
            audioUrl={session?.audio_url || undefined}
            sesionNumero={progress?.sesion_actual || 1}
          />
        );
      case 2:
        return (
          <GratitudeDiario
            gratitudes={gratitudes}
            onChange={handleGratitudeChange}
          />
        );
      case 3:
        return (
          <GratitudeCierre
            reflexionBiblica={savedReflexion?.reflexion}
            versiculoSugerido={savedReflexion?.versiculo}
          />
        );
      default:
        return null;
    }
  };

  if (loadingExperience) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-500/5 via-background to-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-b from-amber-500/5 via-background to-background">
      <DesktopSidebar />
      <div className="flex-1 lg:ml-64 pb-20 md:pb-8">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')} 
                className="lg:hidden"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Salir
              </Button>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-500" />
                <h1 className="font-semibold">Diario de Gratitud</h1>
              </div>
              <ReminderButton practice="gratitud" />
            </div>

            {/* Progress Bar */}
            <div className="flex gap-1">
              {STEPS.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => index <= currentStep && setCurrentStep(index)}
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    index <= currentStep 
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
                      : 'bg-muted'
                  } ${index < currentStep ? 'cursor-pointer hover:opacity-80' : ''}`}
                  disabled={index > currentStep}
                />
              ))}
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Step Indicator */}
          <motion.div 
            key={currentStep}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            {(() => {
              const StepIcon = STEPS[currentStep].icon;
              return <StepIcon className="w-4 h-4 text-amber-500" />;
            })()}
            <span>Paso {currentStep + 1} de {STEPS.length}</span>
            <span className="text-foreground font-medium">— {STEPS[currentStep].title}</span>
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
            {currentStep > 0 && currentStep < 3 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
            )}

            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed() || (currentStep === 2 && saving)}
                className="flex-1 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white"
              >
                {currentStep === 2 ? (
                  saving ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                      />
                      Guardando...
                    </>
                  ) : (
                    <>
                      Guardar
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )
                ) : (
                  <>
                    Siguiente
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                className="flex-1 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Terminar
              </Button>
            )}
          </div>
        </main>

        <BottomNavigation />
      </div>
    </div>
  );
};

export default Gratitude;
