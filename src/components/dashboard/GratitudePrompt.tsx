import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Send, Check, BookOpen, History, ChevronRight, Calendar, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useGratitudeJournal } from "@/hooks/useGratitudeJournal";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { GratitudeWhyModal } from "./GratitudeWhyModal";

export function GratitudePrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [gratitudes, setGratitudes] = useState<string[]>(["", "", ""]);
  const [submitted, setSubmitted] = useState(false);
  const [reflection, setReflection] = useState<{ text: string; verse: string } | null>(null);
  
  const { entries, todayEntry, loading, saving, saveEntry } = useGratitudeJournal();

  // Pre-fill with today's entry if exists
  useEffect(() => {
    if (todayEntry) {
      setGratitudes([
        todayEntry.entrada_1 || "",
        todayEntry.entrada_2 || "",
        todayEntry.entrada_3 || ""
      ]);
      if (todayEntry.reflexion_biblica) {
        setReflection({
          text: todayEntry.reflexion_biblica,
          verse: todayEntry.versiculo_sugerido || ""
        });
      }
    }
  }, [todayEntry]);

  const handleChange = (index: number, value: string) => {
    const newGratitudes = [...gratitudes];
    newGratitudes[index] = value;
    setGratitudes(newGratitudes);
  };

  const handleSubmit = async () => {
    const success = await saveEntry(gratitudes);
    if (success) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setIsOpen(false);
      }, 3000);
    }
  };

  const filledCount = gratitudes.filter(g => g.trim().length > 0).length;

  // Success state with reflection
  if (submitted && todayEntry?.reflexion_biblica) {
    return (
      <motion.section 
        className="px-5 py-2 lg:px-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div 
          className="rounded-2xl bg-gradient-to-br from-amber-500/20 via-rose-500/20 to-purple-500/20 border border-amber-200/30 dark:border-amber-800/30 p-5"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="flex justify-center mb-3"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center">
              <Check className="w-7 h-7 text-white" />
            </div>
          </motion.div>
          
          <h3 className="font-heading text-lg font-bold text-foreground text-center mb-2">
            ¡Gratitud guardada!
          </h3>
          
          <div className="bg-background/50 rounded-xl p-4 mt-3">
            <div className="flex items-start gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground italic">
                {todayEntry.reflexion_biblica}
              </p>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium text-right">
              — {todayEntry.versiculo_sugerido}
            </p>
          </div>
        </motion.div>
      </motion.section>
    );
  }

  // History view
  if (showHistory) {
    return (
      <motion.section 
        className="px-5 py-2 lg:px-0"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="rounded-2xl bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center">
                <History className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-heading font-bold text-foreground">
                Historial de Gratitud
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(false)}
            >
              Volver
            </Button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando...
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aún no has escrito ninguna gratitud
              </div>
            ) : (
              entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-muted/50 rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-medium">
                      {format(new Date(entry.fecha), "d 'de' MMMM, yyyy", { locale: es })}
                    </span>
                  </div>
                  
                  <div className="space-y-1 mb-3">
                    {[entry.entrada_1, entry.entrada_2, entry.entrada_3].filter(Boolean).map((e, i) => (
                      <p key={i} className="text-sm text-foreground flex items-start gap-2">
                        <Heart className="w-3 h-3 text-rose-400 mt-1 shrink-0" />
                        {e}
                      </p>
                    ))}
                  </div>

                  {entry.reflexion_biblica && (
                    <div className="bg-background/50 rounded-lg p-3 border-l-2 border-amber-400">
                      <p className="text-xs text-muted-foreground italic mb-1">
                        {entry.reflexion_biblica}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        — {entry.versiculo_sugerido}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section 
      className="px-5 py-2 lg:px-0"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="closed"
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <motion.button
              onClick={() => setIsOpen(true)}
              className="w-full text-left"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-purple-500/10 border border-amber-200/30 dark:border-amber-800/30 p-5">
                {/* Decorative elements */}
                <div className="absolute top-3 right-3">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Heart className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-foreground">
                      Diario de Gratitud
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Con los pies en la tierra y el corazón en el cielo
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>

                {todayEntry && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        Ya escribiste hoy tu gratitud
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.button>

            {entries.length > 0 && (
              <motion.button
                onClick={() => setShowHistory(true)}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <History className="w-4 h-4" />
                Ver historial ({entries.length} {entries.length === 1 ? 'día' : 'días'})
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="open"
            className="rounded-2xl bg-card border border-border p-5"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-bold text-foreground">
                  Diario de Gratitud
                </h3>
                <p className="text-xs text-muted-foreground">
                  Escribe 3 cosas por las que agradeces a Dios
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                onClick={() => setShowWhyModal(true)}
              >
                <HelpCircle className="w-5 h-5" />
              </Button>
            </div>

            <GratitudeWhyModal open={showWhyModal} onOpenChange={setShowWhyModal} />

            <div className="space-y-3 mb-4">
              {gratitudes.map((gratitude, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <span className="absolute left-3 top-3 text-sm font-bold text-amber-500">
                    {index + 1}.
                  </span>
                  <Textarea
                    value={gratitude}
                    onChange={(e) => handleChange(index, e.target.value)}
                    placeholder={
                      index === 0 ? "Agradezco a Dios por..." :
                      index === 1 ? "También doy gracias por..." :
                      "Y estoy agradecido por..."
                    }
                    className="pl-8 min-h-[60px] resize-none border-amber-200/50 focus:border-amber-400 dark:border-amber-800/50"
                  />
                </motion.div>
              ))}
            </div>

            {reflection && !submitted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 mb-4 border border-amber-200/50 dark:border-amber-800/50"
              >
                <div className="flex items-start gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground italic">
                    {reflection.text}
                  </p>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium text-right">
                  — {reflection.verse}
                </p>
              </motion.div>
            )}

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
                disabled={filledCount < 1 || saving}
                className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white"
              >
                {saving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                    />
                    Generando reflexión...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Guardar ({filledCount}/3)
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
