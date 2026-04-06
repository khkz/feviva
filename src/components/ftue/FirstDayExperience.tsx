import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, Sparkles, Heart, ChevronRight, 
  Trophy, Flame, Star, Play, Check
} from "lucide-react";
import { useDailyContent } from "@/hooks/useDailyContent";
import { useUserStats } from "@/hooks/useUserStats";
import logoElRugido from "@/assets/logo-elrugido.png";

interface FirstDayExperienceProps {
  userName: string;
  onComplete: () => void;
}

// Confetti particle
const ConfettiParticle = ({ delay, color }: { delay: number; color: string }) => {
  const randomX = Math.random() * 100;
  const randomDuration = 2 + Math.random() * 2;
  return (
    <motion.div
      className="absolute w-2.5 h-2.5 rounded-sm"
      style={{ left: `${randomX}%`, backgroundColor: color, top: -10 }}
      initial={{ y: 0, rotate: 0, opacity: 1 }}
      animate={{ y: [0, 500], rotate: [0, Math.random() * 720], opacity: [1, 1, 0] }}
      transition={{ duration: randomDuration, delay, ease: "easeOut" }}
    />
  );
};

const confettiColors = [
  "hsl(45 95% 58%)", "hsl(207 44% 32%)", "hsl(188 78% 53%)",
  "hsl(0 84% 60%)", "hsl(142 76% 36%)",
];

type FTUEStep = "welcome" | "verse" | "reflection" | "prayer" | "celebration";

export const FirstDayExperience = ({ userName, onComplete }: FirstDayExperienceProps) => {
  const [currentStep, setCurrentStep] = useState<FTUEStep>("welcome");
  const [showConfetti, setShowConfetti] = useState(false);
  const { content, loading: contentLoading } = useDailyContent();
  const { addPoints } = useUserStats();

  const steps: FTUEStep[] = ["welcome", "verse", "reflection", "prayer", "celebration"];
  const stepIndex = steps.indexOf(currentStep);
  const progress = ((stepIndex) / (steps.length - 1)) * 100;

  const goNext = () => {
    const nextIndex = stepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleComplete = async () => {
    try {
      await addPoints(50, "🎉 Completaste tu Primer Día");
    } catch (e) {
      console.error("Error adding points:", e);
    }
    onComplete();
  };

  useEffect(() => {
    if (currentStep === "celebration") {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Fallback content if daily_content isn't available yet
  const verse = content?.versiculo_texto || "Porque yo sé los planes que tengo para ustedes —declara el Señor—, planes de bienestar y no de calamidad, para darles un futuro y una esperanza.";
  const verseRef = content?.versiculo_referencia || "Jeremías 29:11";
  const reflection = content?.reflexion_ia || "Hoy comienzas algo nuevo. No es casualidad que estés aquí. Dios tiene un plan específico para ti, y este primer paso — por pequeño que parezca — es parte de ese plan. No necesitas tener todo claro. Solo necesitas dar el siguiente paso.";
  const prayer = content?.oracion_laudes || "Señor, gracias por este nuevo comienzo. Abre mis ojos para ver Tu presencia en mi día. Dame la fuerza para ser fiel en las cosas pequeñas. Que cada palabra que lea y cada oración que rece hoy sea un paso más cerca de Ti. Amén.";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/20 flex flex-col">
      {/* Header */}
      <header className="p-4 md:p-6 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoElRugido} alt="ElRugido" className="w-8 h-8" />
            <span className="font-heading font-bold text-primary text-sm">Tu Primer Día</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {stepIndex > 0 && stepIndex < steps.length - 1 ? `${stepIndex}/3` : ""}
          </span>
        </div>
        {stepIndex > 0 && stepIndex < steps.length - 1 && (
          <div className="max-w-lg mx-auto mt-3">
            <Progress value={progress} className="h-1.5" />
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-5 md:p-8">
        <div className="w-full max-w-lg relative">
          {/* Celebration confetti */}
          {showConfetti && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none -top-20">
              {Array.from({ length: 50 }).map((_, i) => (
                <ConfettiParticle key={i} delay={i * 0.04} color={confettiColors[i % confettiColors.length]} />
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP: Welcome */}
            {currentStep === "welcome" && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl"
                >
                  <Flame className="w-10 h-10 text-white" />
                </motion.div>

                <div>
                  <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
                    Bienvenido{userName ? `, ${userName}` : ""}
                  </h1>
                  <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mx-auto">
                    Los próximos 5 minutos pueden cambiar cómo vives el resto del día.
                  </p>
                </div>

                <Card className="bg-card/50 border-primary/10">
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground mb-4">Tu experiencia de hoy:</p>
                    <div className="space-y-3 text-left">
                      {[
                        { icon: <BookOpen className="w-4 h-4" />, text: "Un versículo para tu día", time: "1 min" },
                        { icon: <Heart className="w-4 h-4" />, text: "Una reflexión personal", time: "2 min" },
                        { icon: <Sparkles className="w-4 h-4" />, text: "Una oración para comenzar", time: "2 min" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">{item.icon}</div>
                          <span className="text-sm text-foreground flex-1">{item.text}</span>
                          <span className="text-xs text-muted-foreground">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={goNext}
                  size="lg"
                  className="bg-primary hover:bg-primary-hover text-primary-foreground px-8"
                >
                  Comenzar
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </motion.div>
            )}

            {/* STEP: Verse */}
            {currentStep === "verse" && (
              <motion.div
                key="verse"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-8"
              >
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
                    <BookOpen className="w-3.5 h-3.5" />
                    Versículo del Día
                  </div>
                </div>

                <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
                  <CardContent className="p-8">
                    {contentLoading ? (
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
                        <div className="h-4 bg-muted rounded w-full mx-auto" />
                        <div className="h-4 bg-muted rounded w-2/3 mx-auto" />
                      </div>
                    ) : (
                      <>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="text-xl md:text-2xl font-heading text-foreground leading-relaxed italic mb-6"
                        >
                          "{verse}"
                        </motion.p>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="text-primary font-semibold"
                        >
                          — {verseRef}
                        </motion.p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-sm text-muted-foreground"
                >
                  Léelo despacio. Deja que cada palabra resuene.
                </motion.p>

                <Button onClick={goNext} size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground px-8">
                  He leído el versículo
                  <Check className="w-5 h-5 ml-1" />
                </Button>
              </motion.div>
            )}

            {/* STEP: Reflection */}
            {currentStep === "reflection" && (
              <motion.div
                key="reflection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-8"
              >
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium mb-6">
                    <Heart className="w-3.5 h-3.5" />
                    Reflexión
                  </div>
                </div>

                <Card className="border-secondary/20 bg-gradient-to-br from-card to-secondary/5">
                  <CardContent className="p-8 text-left">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-foreground/90 text-lg leading-relaxed"
                    >
                      {reflection}
                    </motion.p>
                  </CardContent>
                </Card>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-muted-foreground italic"
                >
                  "El primer paso no necesita ser perfecto, solo necesita ser dado."
                </motion.p>

                <Button onClick={goNext} size="lg" className="bg-secondary hover:bg-secondary-hover text-secondary-foreground px-8">
                  Continuar a la oración
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </motion.div>
            )}

            {/* STEP: Prayer */}
            {currentStep === "prayer" && (
              <motion.div
                key="prayer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-8"
              >
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-6">
                    <Sparkles className="w-3.5 h-3.5" />
                    Oración del Día
                  </div>
                </div>

                <Card className="border-accent/30 bg-gradient-to-br from-card to-accent/10">
                  <CardContent className="p-8 text-left">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-foreground/90 text-lg leading-relaxed whitespace-pre-line"
                    >
                      {prayer}
                    </motion.p>
                  </CardContent>
                </Card>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-muted-foreground"
                >
                  Cierra los ojos y repítela en silencio. Tómate tu tiempo.
                </motion.p>

                <Button
                  onClick={goNext}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-secondary text-white px-8 shadow-lg"
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  He terminado mi oración
                </Button>
              </motion.div>
            )}

            {/* STEP: Celebration */}
            {currentStep === "celebration" && (
              <motion.div
                key="celebration"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center space-y-8 relative z-10"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-secondary to-secondary-hover flex items-center justify-center shadow-xl"
                >
                  <Trophy className="w-12 h-12 text-secondary-foreground" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
                    ¡Día 1 Completado!
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                    Has dado el paso más importante: el primero.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center gap-8"
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-secondary font-bold text-2xl">
                      <Sparkles className="w-6 h-6" />
                      +50
                    </div>
                    <span className="text-xs text-muted-foreground">Puntos XP</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-orange-500 font-bold text-2xl">
                      <Flame className="w-6 h-6" />
                      1
                    </div>
                    <span className="text-xs text-muted-foreground">Día de racha</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-primary font-bold text-2xl">
                      <Star className="w-6 h-6" />
                      1
                    </div>
                    <span className="text-xs text-muted-foreground">Nivel</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                    <CardContent className="p-5">
                      <p className="text-sm text-muted-foreground mb-2">Mañana te espera:</p>
                      <p className="text-foreground font-medium">
                        Un nuevo versículo, una nueva reflexión, y un paso más cerca de Dios.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="space-y-3"
                >
                  <Button
                    onClick={handleComplete}
                    size="lg"
                    className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
                  >
                    Explorar ElRugido
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default FirstDayExperience;
