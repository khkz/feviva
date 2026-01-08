import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Send, Check, BookOpen, History, Calendar, HelpCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGratitudeJournal } from "@/hooks/useGratitudeJournal";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { GratitudeWhyModal } from "@/components/dashboard/GratitudeWhyModal";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { supabase } from "@/integrations/supabase/client";

const Gratitude = () => {
  const navigate = useNavigate();
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [gratitudes, setGratitudes] = useState<string[]>(["", "", ""]);
  const [submitted, setSubmitted] = useState(false);
  
  const { entries, todayEntry, loading, saving, saveEntry } = useGratitudeJournal();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate('/auth');
    };
    checkAuth();
  }, [navigate]);

  // Pre-fill with today's entry if exists
  useEffect(() => {
    if (todayEntry) {
      setGratitudes([
        todayEntry.entrada_1 || "",
        todayEntry.entrada_2 || "",
        todayEntry.entrada_3 || ""
      ]);
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
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  const filledCount = gratitudes.filter(g => g.trim().length > 0).length;

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-b from-amber-500/5 via-background to-background">
      <DesktopSidebar />
      <div className="flex-1 lg:ml-64 pb-20 md:pb-8">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="lg:hidden">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              <h1 className="font-semibold">Diario de Gratitud</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-amber-500"
              onClick={() => setShowWhyModal(true)}
            >
              <HelpCircle className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <main className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">
              Diario de Gratitud
            </h2>
            <p className="text-muted-foreground">
              Con los pies en la tierra y el corazón en el cielo
            </p>
          </motion.div>

          {/* Success State */}
          <AnimatePresence>
            {submitted && todayEntry?.reflexion_biblica && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="bg-gradient-to-br from-amber-500/20 via-rose-500/20 to-purple-500/20 border-amber-200/30">
                  <CardContent className="pt-6 text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center mx-auto">
                      <Check className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-bold text-lg">¡Gratitud guardada!</h3>
                    <div className="bg-background/50 rounded-xl p-4">
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
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Entry Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                {todayEntry ? "Tu gratitud de hoy" : "Escribe tu gratitud"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Escribe 3 cosas por las que agradeces a Dios hoy
              </p>

              <div className="space-y-3">
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
                      className="pl-8 min-h-[80px] resize-none border-amber-200/50 focus:border-amber-400 dark:border-amber-800/50"
                    />
                  </motion.div>
                ))}
              </div>

              {/* Previous reflection if exists */}
              {todayEntry?.reflexion_biblica && !submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/50"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground italic">
                      {todayEntry.reflexion_biblica}
                    </p>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium text-right">
                    — {todayEntry.versiculo_sugerido}
                  </p>
                </motion.div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={filledCount < 1 || saving}
                className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white"
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
                    {todayEntry ? "Actualizar" : "Guardar"} ({filledCount}/3)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-muted-foreground" />
                Historial de Gratitud
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Cargando...
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aún no has escrito ninguna gratitud</p>
                  <p className="text-sm">¡Empieza hoy!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {entries.map((entry) => (
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        <GratitudeWhyModal open={showWhyModal} onOpenChange={setShowWhyModal} />
        <BottomNavigation />
      </div>
    </div>
  );
};

export default Gratitude;
