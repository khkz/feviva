import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function GratitudePrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const [gratitudes, setGratitudes] = useState<string[]>(["", "", ""]);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (index: number, value: string) => {
    const newGratitudes = [...gratitudes];
    newGratitudes[index] = value;
    setGratitudes(newGratitudes);
  };

  const handleSubmit = () => {
    // TODO: Save to database
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setGratitudes(["", "", ""]);
    }, 2000);
  };

  const filledCount = gratitudes.filter(g => g.trim().length > 0).length;

  if (submitted) {
    return (
      <motion.section 
        className="px-5 py-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div 
          className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-center"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          >
            <Check className="w-12 h-12 text-white mx-auto mb-2" />
          </motion.div>
          <h3 className="font-heading text-lg font-bold text-white">¡Gracias guardadas!</h3>
          <p className="text-white/80 text-sm">Tu corazón está lleno de gratitud hoy</p>
        </motion.div>
      </motion.section>
    );
  }

  return (
    <motion.section 
      className="px-5 py-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.9 }}
    >
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="closed"
            onClick={() => setIsOpen(true)}
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-orange-500/10 border border-rose-200/30 dark:border-rose-800/30 p-5">
              {/* Decorative sparkles */}
              <motion.div 
                className="absolute top-3 right-3"
                animate={{ 
                  rotate: [0, 15, -15, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-5 h-5 text-rose-400" />
              </motion.div>
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-heading font-bold text-foreground">
                    Diario de Gratitud
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ¿Por qué agradeces hoy?
                  </p>
                </div>
              </div>
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="open"
            className="rounded-2xl bg-card border border-border p-5"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-foreground">
                  Diario de Gratitud
                </h3>
                <p className="text-xs text-muted-foreground">
                  Escribe 3 cosas por las que agradeces
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {gratitudes.map((gratitude, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <span className="absolute left-3 top-3 text-sm font-bold text-rose-400">
                    {index + 1}.
                  </span>
                  <Textarea
                    value={gratitude}
                    onChange={(e) => handleChange(index, e.target.value)}
                    placeholder={`Agradezco por...`}
                    className="pl-8 min-h-[60px] resize-none border-rose-200/50 focus:border-rose-400 dark:border-rose-800/50"
                  />
                </motion.div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={filledCount < 1}
                className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Guardar ({filledCount}/3)
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}