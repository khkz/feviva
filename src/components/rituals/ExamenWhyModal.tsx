import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Heart, Sparkles, Church, Eye, Moon, BookOpen, Lightbulb } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ExamenWhyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExamenWhyModal({ open, onOpenChange }: ExamenWhyModalProps) {
  const [activeTab, setActiveTab] = useState("ciencia");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden p-0">
        <div className="bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-blue-500/10 p-5 pb-3">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <DialogTitle className="font-heading text-lg">
                ¿Por qué el Examen?
              </DialogTitle>
            </div>
          </DialogHeader>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-5">
            <TabsList className="w-full grid grid-cols-3 bg-muted/50">
              <TabsTrigger value="ciencia" className="text-xs sm:text-sm">
                <Brain className="w-3.5 h-3.5 mr-1.5" />
                Ciencia
              </TabsTrigger>
              <TabsTrigger value="espiritu" className="text-xs sm:text-sm">
                <Church className="w-3.5 h-3.5 mr-1.5" />
                Espíritu
              </TabsTrigger>
              <TabsTrigger value="practica" className="text-xs sm:text-sm">
                <Lightbulb className="w-3.5 h-3.5 mr-1.5" />
                Práctica
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="px-5 pb-5 overflow-y-auto max-h-[55vh]">
            <AnimatePresence mode="wait">
              <TabsContent value="ciencia" className="mt-4 space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-purple-500" />
                    <h3 className="font-heading font-bold text-foreground">
                      Neurociencia de la Reflexión
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/30">
                      <p className="text-sm text-foreground leading-relaxed">
                        La reflexión nocturna activa el <strong>córtex prefrontal</strong>, 
                        permitiendo procesar las experiencias del día y consolidarlas en memoria a largo plazo.
                      </p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
                      <div className="flex items-start gap-2">
                        <Moon className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm text-foreground font-medium mb-1">
                            "Descarga Mental"
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Escribir preocupaciones antes de dormir <strong>reduce la ansiedad nocturna</strong> 
                            y mejora la calidad del sueño hasta en un 50%.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-xl p-4">
                      <p className="text-xs text-muted-foreground mb-2 font-medium">
                        📊 Estudios Psicológicos
                      </p>
                      <ul className="text-sm text-foreground space-y-1">
                        <li>• <strong>Harvard:</strong> Reflexionar 10 min mejora desempeño 23%</li>
                        <li>• <strong>Journal of Personality:</strong> Aumenta autoconocimiento</li>
                        <li>• Reduce rumia mental y preocupaciones</li>
                      </ul>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-200/30 dark:border-purple-800/30">
                      <p className="text-sm text-foreground font-medium mb-1">
                        🔄 El Ciclo del Aprendizaje
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Experiencia → Reflexión → Aprendizaje → Mejora. 
                        Sin reflexión, repetimos los mismos errores.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="espiritu" className="mt-4 space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Church className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-heading font-bold text-foreground">
                      Espiritualidad Ignaciana
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-xl p-4 border border-indigo-200/50 dark:border-indigo-800/30">
                      <p className="text-sm text-foreground leading-relaxed">
                        El Examen de Conciencia fue desarrollado por <strong>San Ignacio de Loyola</strong> 
                        hace 500 años. Lo consideraba más importante que cualquier otra oración diaria.
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="flex items-start gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-foreground italic">
                              "Si uno quiere hacer algún provecho en la vida espiritual, 
                              examine su conciencia cada noche"
                            </p>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                              — San Ignacio de Loyola
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-4 border border-indigo-200/30 dark:border-indigo-800/30">
                      <p className="text-sm text-foreground font-medium mb-2">
                        🔍 Los 5 Pasos Ignacianos
                      </p>
                      <ol className="space-y-1 text-xs text-muted-foreground list-decimal list-inside">
                        <li><strong>Dar gracias</strong> por los dones del día</li>
                        <li><strong>Pedir luz</strong> para ver con claridad</li>
                        <li><strong>Revisar</strong> pensamientos, palabras, obras</li>
                        <li><strong>Pedir perdón</strong> por las faltas</li>
                        <li><strong>Propósito</strong> para mañana</li>
                      </ol>
                    </div>

                    <div className="bg-rose-50 dark:bg-rose-950/30 rounded-xl p-4 border border-rose-200/50 dark:border-rose-800/30">
                      <Heart className="w-4 h-4 text-rose-500 mb-2" />
                      <p className="text-sm text-foreground">
                        El objetivo no es sentir culpa, sino <strong>encontrar a Dios</strong> en 
                        los eventos ordinarios del día y crecer en libertad interior.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="practica" className="mt-4 space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    <h3 className="font-heading font-bold text-foreground">
                      Consejos Prácticos
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/30">
                        <Moon className="w-5 h-5 text-amber-500 mb-2" />
                        <p className="text-sm font-medium text-foreground mb-1">Antes de Dormir</p>
                        <p className="text-xs text-muted-foreground">
                          Ideal 10-15 min antes de acostarte
                        </p>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
                        <Eye className="w-5 h-5 text-blue-500 mb-2" />
                        <p className="text-sm font-medium text-foreground mb-1">Sin Juicio</p>
                        <p className="text-xs text-muted-foreground">
                          Observa con curiosidad, no con crítica
                        </p>
                      </div>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-800/30">
                      <p className="text-sm text-foreground font-medium mb-2">
                        ✨ Preguntas Clave
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• ¿Cuándo me sentí más vivo y conectado hoy?</li>
                        <li>• ¿Cuándo me sentí más alejado de mí mismo?</li>
                        <li>• ¿Dónde vi la acción de Dios?</li>
                        <li>• ¿Qué me gustaría hacer diferente mañana?</li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 rounded-xl p-4">
                      <p className="text-sm text-foreground font-medium mb-2">
                        📝 Formatos del Examen
                      </p>
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <p>• <strong>Tradicional:</strong> 5 pasos ignacianos (15 min)</p>
                        <p>• <strong>Rápido:</strong> Gratitud + 1 momento + propósito (5 min)</p>
                        <p>• <strong>Escrito:</strong> Diario reflexivo</p>
                        <p>• <strong>Pareja:</strong> Compartir el día juntos</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-amber-500/10 to-rose-500/10 rounded-xl p-4 border border-amber-200/30 dark:border-amber-800/30">
                      <p className="text-sm text-foreground">
                        💡 <strong>Clave:</strong> No busques perfección, busca <strong>consciencia</strong>. 
                        El objetivo es notar patrones y crecer gradualmente.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
