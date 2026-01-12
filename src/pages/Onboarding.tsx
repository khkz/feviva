import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  BookOpen, 
  Target, 
  Users, 
  Sun, 
  Moon, 
  Sparkles,
  ChevronRight,
  Check,
  Flame,
  Church
} from "lucide-react";
import logoElRugido from "@/assets/logo-elrugido.svg";

interface OnboardingOption {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const intentionOptions: OnboardingOption[] = [
  { id: "paz", icon: <Heart className="w-6 h-6" />, title: "Paz Interior", description: "Encontrar serenidad y conexión espiritual" },
  { id: "conocimiento", icon: <BookOpen className="w-6 h-6" />, title: "Conocimiento", description: "Profundizar en la apologética y la fe" },
  { id: "habitos", icon: <Target className="w-6 h-6" />, title: "Hábitos", description: "Desarrollar disciplina espiritual diaria" },
  { id: "comunidad", icon: <Users className="w-6 h-6" />, title: "Comunidad", description: "Conectar con otros creyentes" },
];

const practiceOptions: OnboardingOption[] = [
  { id: "matutino", icon: <Sun className="w-6 h-6" />, title: "Ritual Matutino", description: "Comienza el día con oración" },
  { id: "rosario", icon: <Church className="w-6 h-6" />, title: "Rosario", description: "Medita los misterios" },
  { id: "gratitud", icon: <Sparkles className="w-6 h-6" />, title: "Diario de Gratitud", description: "Cultiva el agradecimiento" },
  { id: "nocturno", icon: <Moon className="w-6 h-6" />, title: "Examen Nocturno", description: "Reflexiona al final del día" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState("");
  const [selectedIntentions, setSelectedIntentions] = useState<string[]>([]);
  const [selectedPractices, setSelectedPractices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  useEffect(() => {
    // Get user name from profile
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      
      const { data } = await supabase
        .from("profiles")
        .select("nombre")
        .eq("id", session.user.id)
        .single();
      
      if (data?.nombre) {
        setUserName(data.nombre.split(" ")[0]);
      }
    };
    
    fetchProfile();
  }, [navigate]);

  const toggleIntention = (id: string) => {
    setSelectedIntentions(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const togglePractice = (id: string) => {
    setSelectedPractices(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Save onboarding preferences
        await supabase
          .from("profiles")
          .update({
            devotion_primary: selectedPractices[0] || null,
          })
          .eq("id", session.user.id);
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
    
    navigate("/dashboard");
  };

  const canProceed = () => {
    if (step === 1) return selectedIntentions.length > 0;
    if (step === 2) return selectedPractices.length > 0;
    return true;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
                ¿Qué buscas en tu camino de fe?
              </h2>
              <p className="text-muted-foreground">
                Selecciona lo que más resuena contigo (puedes elegir varios)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {intentionOptions.map((option) => (
                <Card
                  key={option.id}
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedIntentions.includes(option.id)
                      ? "border-primary bg-primary/5 shadow-md"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => toggleIntention(option.id)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      selectedIntentions.includes(option.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{option.title}</h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    {selectedIntentions.includes(option.id) && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
                ¿Con qué prácticas quieres comenzar?
              </h2>
              <p className="text-muted-foreground">
                Te ayudaremos a construir hábitos espirituales
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {practiceOptions.map((option) => (
                <Card
                  key={option.id}
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedPractices.includes(option.id)
                      ? "border-secondary bg-secondary/10 shadow-md"
                      : "hover:border-secondary/50"
                  }`}
                  onClick={() => togglePractice(option.id)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      selectedPractices.includes(option.id)
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{option.title}</h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    {selectedPractices.includes(option.id) && (
                      <Check className="w-5 h-5 text-secondary" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center space-y-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
            >
              <Flame className="w-12 h-12 text-white" />
            </motion.div>

            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3">
                ¡Estás listo, {userName}!
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Tu primera misión te espera. Cada día es una oportunidad para crecer en fe, 
                razón y amor.
              </p>
            </div>

            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-heading font-bold text-lg text-foreground mb-4 flex items-center justify-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Tu Primera Misión
                </h3>
                <p className="text-foreground/80 mb-4">
                  {selectedPractices.includes("matutino") 
                    ? "Completa tu primer Ritual Matutino para ganar 50 puntos de experiencia"
                    : selectedPractices.includes("gratitud")
                    ? "Escribe tu primera entrada de gratitud y gana 50 puntos"
                    : selectedPractices.includes("rosario")
                    ? "Reza tu primer misterio del Rosario y gana 50 puntos"
                    : "Completa tu primera práctica espiritual y gana 50 puntos"}
                </p>
                <div className="flex items-center justify-center gap-2 text-secondary font-semibold">
                  <Sparkles className="w-5 h-5" />
                  <span>+50 XP de bienvenida</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/30 flex flex-col">
      {/* Header */}
      <header className="p-4 md:p-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoElRugido} alt="ElRugido" className="w-10 h-10" />
            <span className="font-heading font-bold text-primary hidden sm:block">ElRugido</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Paso {step} de {totalSteps}
          </div>
        </div>
        <div className="max-w-2xl mx-auto mt-4">
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-2xl">
          {/* Welcome message on first step */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <span className="text-4xl mb-4 block">🦁</span>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-2">
                ¡Bienvenido{userName ? `, ${userName}` : ""}!
              </h1>
              <p className="text-muted-foreground">
                Personalicemos tu experiencia en ElRugido
              </p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer with navigation */}
      <footer className="p-4 md:p-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {step > 1 ? (
            <Button 
              variant="ghost" 
              onClick={() => setStep(s => s - 1)}
              disabled={loading}
            >
              Atrás
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              onClick={() => navigate("/dashboard")}
            >
              Omitir
            </Button>
          )}

          {step < totalSteps ? (
            <Button 
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="bg-primary hover:bg-primary-hover"
            >
              Continuar
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button 
              onClick={handleComplete}
              disabled={loading}
              className="bg-secondary hover:bg-secondary-hover text-secondary-foreground"
            >
              {loading ? "Guardando..." : "¡Comenzar!"}
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default Onboarding;
