import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Trophy, 
  Flame, 
  Share2, 
  ChevronRight,
  Star,
  Heart,
  Zap
} from "lucide-react";

interface CompletionCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  practiceType: string;
  practiceName: string;
  pointsEarned: number;
  currentStreak?: number;
  newAchievement?: {
    name: string;
    icon: string;
  } | null;
  nextPractice?: {
    name: string;
    path: string;
  } | null;
  onShare?: () => void;
}

// Confetti particle component
const ConfettiParticle = ({ delay, color }: { delay: number; color: string }) => {
  const randomX = Math.random() * 100;
  const randomRotation = Math.random() * 360;
  const randomDuration = 2 + Math.random() * 2;
  
  return (
    <motion.div
      className="absolute w-3 h-3 rounded-sm"
      style={{ 
        left: `${randomX}%`,
        backgroundColor: color,
        top: -20
      }}
      initial={{ y: 0, rotate: 0, opacity: 1 }}
      animate={{ 
        y: [0, 400],
        rotate: [0, randomRotation, randomRotation * 2],
        opacity: [1, 1, 0]
      }}
      transition={{
        duration: randomDuration,
        delay: delay,
        ease: "easeOut"
      }}
    />
  );
};

const confettiColors = [
  "hsl(45 95% 58%)", // gold
  "hsl(207 44% 32%)", // primary
  "hsl(188 78% 53%)", // cyan
  "hsl(0 84% 60%)", // red
  "hsl(142 76% 36%)", // green
];

export const CompletionCelebration = ({
  isOpen,
  onClose,
  practiceType,
  practiceName,
  pointsEarned,
  currentStreak = 0,
  newAchievement = null,
  nextPractice = null,
  onShare
}: CompletionCelebrationProps) => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Stop confetti after animation
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleNextPractice = () => {
    onClose();
    if (nextPractice) {
      navigate(nextPractice.path);
    }
  };

  const handleGoToDashboard = () => {
    onClose();
    navigate("/dashboard");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md overflow-hidden bg-gradient-to-b from-card to-accent/30 border-primary/20">
        {/* Confetti */}
        <AnimatePresence>
          {showConfetti && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 40 }).map((_, i) => (
                <ConfettiParticle 
                  key={i} 
                  delay={i * 0.05} 
                  color={confettiColors[i % confettiColors.length]}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        <div className="relative z-10 text-center py-4">
          {/* Trophy animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-secondary to-secondary-hover flex items-center justify-center shadow-lg"
          >
            <Trophy className="w-10 h-10 text-secondary-foreground" />
          </motion.div>

          {/* Main message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
              ¡Excelente trabajo!
            </h2>
            <p className="text-muted-foreground mb-4">
              Has completado <span className="text-primary font-semibold">{practiceName}</span>
            </p>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-6 mb-6"
          >
            {/* Points */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-secondary font-bold text-xl">
                <Sparkles className="w-5 h-5" />
                +{pointsEarned}
              </div>
              <span className="text-xs text-muted-foreground">Puntos</span>
            </div>

            {/* Streak */}
            {currentStreak > 0 && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-orange-500 font-bold text-xl">
                  <Flame className="w-5 h-5" />
                  {currentStreak}
                </div>
                <span className="text-xs text-muted-foreground">Días seguidos</span>
              </div>
            )}
          </motion.div>

          {/* New achievement */}
          <AnimatePresence>
            {newAchievement && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mb-6 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 rounded-full bg-secondary/20">
                    <Star className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs text-muted-foreground block">¡Nuevo logro!</span>
                    <span className="font-semibold text-foreground">{newAchievement.name}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Motivational message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6"
          >
            <Heart className="w-4 h-4 text-red-400" />
            <span>Cada paso cuenta en tu camino de fe</span>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            {/* Share button */}
            {onShare && (
              <Button
                variant="outline"
                className="w-full"
                onClick={onShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartir logro
              </Button>
            )}

            {/* Next practice */}
            {nextPractice && (
              <Button
                className="w-full bg-primary hover:bg-primary-hover"
                onClick={handleNextPractice}
              >
                <Zap className="w-4 h-4 mr-2" />
                Continuar: {nextPractice.name}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}

            {/* Dashboard */}
            <Button
              variant="ghost"
              className="w-full"
              onClick={handleGoToDashboard}
            >
              Volver al inicio
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompletionCelebration;
