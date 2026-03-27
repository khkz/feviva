import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Brain, Sparkles, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'continente-digital-welcomed';

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
      icon: ShieldCheck,
      title: "Bienvenido al Continente Digital",
      description: "Estás en la pandemia de la información. Los algoritmos compiten por tu atención, tu paz y tu alma.",
      highlight: "Aquí aprenderás a no ser reemplazado.",
    },
    {
      icon: Brain,
      title: "Tu Misión",
      description: "Domina la IA en lugar de ser dominado. Aprende a usar la tecnología como herramienta, no como amo. Inyecta la luz de Cristo en cada byte.",
      highlight: "La IA procesa datos. Tú amas. Esa es tu ventaja.",
    },
    {
      icon: Sparkles,
      title: "4 Pasos de Supervivencia",
      description: "Dieta algorítmica, academia de prompts, misiones físicas y entrenamiento de la IA del futuro. Todo gamificado para que cada acción cuente.",
      highlight: "¿Listo para recuperar tu libertad digital?",
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
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md"
          >
            <button
              onClick={handleClose}
              className="absolute -top-12 right-0 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="glass-cyber rounded-3xl p-8 border-amber-400/30 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-950/30 via-slate-950/50 to-slate-950/80" />
              
              <div className="relative z-10">
                <div className="flex justify-center gap-2 mb-6">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i === step ? 'bg-amber-400' : 'bg-gray-600'
                      }`}
                      animate={i === step ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 0.5 }}
                    />
                  ))}
                </div>

                <motion.div
                  key={step}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="flex justify-center mb-6"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/30 flex items-center justify-center">
                    <Icon className="w-10 h-10 text-amber-400" />
                  </div>
                </motion.div>

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

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 flex justify-center"
                >
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-orbitron px-8"
                    size="lg"
                  >
                    {step < 2 ? (
                      <>
                        Siguiente
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Comenzar
                        <ShieldCheck className="w-4 h-4 ml-2" />
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
