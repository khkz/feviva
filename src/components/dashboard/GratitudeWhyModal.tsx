import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Heart, Sparkles, Church, Moon, Activity, X, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GratitudeWhyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GratitudeWhyModal({ open, onOpenChange }: GratitudeWhyModalProps) {
  const [activeTab, setActiveTab] = useState("ciencia");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden p-0">
        <div className="bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-purple-500/10 p-5 pb-3">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <DialogTitle className="font-heading text-lg">
                ¿Por qué la Gratitud?
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
              <TabsTrigger value="cuerpo" className="text-xs sm:text-sm">
                <Activity className="w-3.5 h-3.5 mr-1.5" />
                Cuerpo
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
                      Tu Cerebro y la Gratitud
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/30">
                      <p className="text-sm text-foreground leading-relaxed">
                        Cuando agradeces, tu cerebro libera <strong>dopamina</strong> y <strong>serotonina</strong> — 
                        las "hormonas de la felicidad" que te hacen sentir bien.
                      </p>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/30">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm text-foreground font-medium mb-1">
                            El dato clave:
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Estas hormonas <strong>NO pueden coexistir</strong> con el cortisol 
                            (hormona del estrés). Por eso la gratitud literalmente 
                            <strong> elimina la angustia</strong> de tu cuerpo.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-xl p-4">
                      <p className="text-xs text-muted-foreground mb-2 font-medium">
                        📊 Estudio: Universidad de California
                      </p>
                      <p className="text-sm text-foreground">
                        Escribir 3 gratitudes diarias por <strong>21 días</strong> mejora 
                        el bienestar más que algunos tratamientos farmacológicos para 
                        la depresión leve.
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500/10 to-rose-500/10 rounded-xl p-4 border border-purple-200/30 dark:border-purple-800/30">
                      <p className="text-sm text-foreground font-medium mb-1">
                        🔄 La "Espiral Ascendente"
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Gratitud → pensamientos positivos → más gratitud → 
                        neuroplasticidad → tu cerebro se reconfigura para ver más cosas buenas.
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
                    <Church className="w-5 h-5 text-amber-500" />
                    <h3 className="font-heading font-bold text-foreground">
                      Gratitud y Fe Católica
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/30">
                      <p className="text-sm text-foreground leading-relaxed">
                        La palabra <strong>"Eucaristía"</strong> viene del griego 
                        <em> eucharistía</em> = "acción de gracias". 
                        La Misa es el máximo acto de gratitud.
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="flex items-start gap-2">
                        <BookOpen className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-foreground italic">
                              "Den gracias en todo, porque esta es la voluntad de Dios"
                            </p>
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
                              — 1 Tesalonicenses 5:18
                            </p>
                          </div>
                          <div className="pt-2 border-t border-border/50">
                            <p className="text-sm text-foreground italic">
                              "Toda buena dádiva y todo don perfecto desciende de lo alto"
                            </p>
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
                              — Santiago 1:17
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-amber-500/10 to-rose-500/10 rounded-xl p-4 border border-amber-200/30 dark:border-amber-800/30">
                      <p className="text-sm text-foreground font-medium mb-2">
                        🕊️ Santos y la Gratitud
                      </p>
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <p>
                          <strong>San Francisco:</strong> "Señor, hazme instrumento de tu paz..." 
                          Su gratitud por la creación lo llevó a la santidad.
                        </p>
                        <p>
                          <strong>Santa Teresa:</strong> "Nada te turbe... quien a Dios tiene, nada le falta." 
                          La gratitud genera paz interior.
                        </p>
                      </div>
                    </div>

                    <div className="bg-rose-50 dark:bg-rose-950/30 rounded-xl p-4 border border-rose-200/50 dark:border-rose-800/30">
                      <Heart className="w-4 h-4 text-rose-500 mb-2" />
                      <p className="text-sm text-foreground">
                        La gratitud nos conecta con la <strong>Providencia Divina</strong>: 
                        reconocer que Dios cuida de nosotros incluso cuando no lo vemos.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="cuerpo" className="mt-4 space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-heading font-bold text-foreground">
                      Beneficios Físicos
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
                        <Moon className="w-5 h-5 text-blue-500 mb-2" />
                        <p className="text-sm font-medium text-foreground mb-1">Mejor Sueño</p>
                        <p className="text-xs text-muted-foreground">
                          Gratitud antes de dormir mejora calidad y duración del sueño
                        </p>
                      </div>

                      <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-4 border border-red-200/50 dark:border-red-800/30">
                        <Heart className="w-5 h-5 text-red-500 mb-2" />
                        <p className="text-sm font-medium text-foreground mb-1">Corazón Sano</p>
                        <p className="text-xs text-muted-foreground">
                          Reduce presión arterial y variabilidad cardíaca
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-800/30">
                        <Sparkles className="w-5 h-5 text-emerald-500 mb-2" />
                        <p className="text-sm font-medium text-foreground mb-1">Inmunidad</p>
                        <p className="text-xs text-muted-foreground">
                          Sistema inmune más fuerte y mejor respuesta a vacunas
                        </p>
                      </div>

                      <div className="bg-orange-50 dark:bg-orange-950/30 rounded-xl p-4 border border-orange-200/50 dark:border-orange-800/30">
                        <Activity className="w-5 h-5 text-orange-500 mb-2" />
                        <p className="text-sm font-medium text-foreground mb-1">Menos Dolor</p>
                        <p className="text-xs text-muted-foreground">
                          Reduce inflamación crónica y percepción de dolor
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-xl p-4 border border-emerald-200/30 dark:border-emerald-800/30">
                      <p className="text-sm text-foreground font-medium mb-2">
                        📊 Estudios Médicos
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• <strong>Harvard:</strong> Personas agradecidas viven hasta 7 años más</li>
                        <li>• <strong>UCLA:</strong> Reducción de biomarcadores de inflamación</li>
                        <li>• <strong>Berkeley:</strong> 23% menos cortisol en practicantes regulares</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/30">
                      <p className="text-sm text-foreground">
                        💡 <strong>Consejo:</strong> Escribir gratitudes por la noche 
                        mejora el sueño. Por la mañana, mejora el ánimo del día.
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
