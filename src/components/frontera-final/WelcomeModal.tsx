import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Star, Sparkles, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'frontera-final-welcomed';

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const hasBeenWelcomed = localStorage.getItem(STORAGE_KEY);
    if (!hasBeenWelcomed) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const steps = [
    {
      icon: Rocket,
      title: "Bienvenido, Explorador",
      description: "Has llegado a la Frontera Final, donde la ciencia y la fe se encuentran en las estrellas.",
      highlight: "El cosmos no es enemigo de Dios, es Su obra maestra.",
    },
    {
      icon: Star,
      title: "Tu Misión",
      description: "Descubre cómo la Iglesia ha sido pionera en la exploración del universo desde hace siglos.",
      highlight: "35 cráteres lunares llevan nombres de científicos jesuitas.",
    },
    {
      icon: Sparkles,
      title: "Comienza tu Viaje",
      description: "Lee artículos, reza con el cosmos, y gana logros espaciales mientras profundizas tu fe.",
      highlight: "¿Listo para explorar?",
    },
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          {/* Animated stars */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute -top-12 right-0 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Card */}
            <div className="glass-cyber rounded-3xl p-8 border-cyan-400/30 overflow-hidden">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/50 via-purple-950/30 to-amber-950/20" />
              
              <div className="relative z-10">
                {/* Step indicator */}
                <div className="flex justify-center gap-2 mb-6">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i === step ? 'bg-cyan-400' : 'bg-gray-600'
                      }`}
                      animate={i === step ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 0.5 }}
                    />
                  ))}
                </div>

                {/* Icon */}
                <motion.div
                  key={step}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="flex justify-center mb-6"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                </motion.div>

                {/* Content */}
                <motion.div
                  key={`content-${step}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-center"
                >
                  <h2 className="font-orbitron text-2xl font-bold text-white mb-4">
                    {currentStep.title}
                  </h2>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    {currentStep.description}
                  </p>
                  <p className="text-amber-400 text-sm font-medium italic">
                    "{currentStep.highlight}"
                  </p>
                </motion.div>

                {/* Action button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 flex justify-center"
                >
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-orbitron px-8"
                    size="lg"
                  >
                    {step < 2 ? (
                      <>
                        Siguiente
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Comenzar mi Misión
                        <Rocket className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
