import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Heart, Sparkles, Church, Calendar, Target, BookOpen, Flame } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NovenasWhyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovenasWhyModal({ open, onOpenChange }: NovenasWhyModalProps) {
  const [activeTab, setActiveTab] = useState("ciencia");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden p-0">
        <div className="bg-gradient-to-br from-secondary/20 via-amber-500/10 to-rose-500/10 p-5 pb-3">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-amber-500 flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <DialogTitle className="font-heading text-lg">
                ¿Por qué las Novenas?
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
                <Target className="w-3.5 h-3.5 mr-1.5" />
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
                      Psicología del Compromiso
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/30">
                      <p className="text-sm text-foreground leading-relaxed">
                        Los 9 días de una novena aprovechan el <strong>"efecto de compromiso"</strong>: 
                        cuando nos comprometemos públicamente con algo, es más probable que lo cumplamos.
                      </p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm text-foreground font-medium mb-1">
                            El Poder de los 9 Días
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Estudios muestran que <strong>9-10 días</strong> es el tiempo ideal 
                            para crear un "mini-hábito" que puede transformarse en práctica permanente.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-xl p-4">
                      <p className="text-xs text-muted-foreground mb-2 font-medium">
                        🧠 Beneficios Cognitivos
                      </p>
                      <ul className="text-sm text-foreground space-y-1">
                        <li>• <strong>Enfoque:</strong> Concentra tu mente en una intención</li>
                        <li>• <strong>Persistencia:</strong> Entrena la disciplina diaria</li>
                        <li>• <strong>Esperanza:</strong> Mantiene viva la confianza activa</li>
                      </ul>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-200/30 dark:border-purple-800/30">
                      <p className="text-sm text-foreground font-medium mb-1">
                        📊 Dato Científico
                      </p>
                      <p className="text-xs text-muted-foreground">
                        La repetición consciente durante varios días fortalece 
                        las conexiones neuronales asociadas con la fe y la esperanza.
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
                    <Church className="w-5 h-5 text-secondary" />
                    <h3 className="font-heading font-bold text-foreground">
                      Origen Bíblico
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-secondary/10 rounded-xl p-4 border border-secondary/30">
                      <p className="text-sm text-foreground leading-relaxed">
                        La primera novena la rezaron los <strong>Apóstoles y María</strong> durante 
                        los 9 días entre la Ascensión y Pentecostés, esperando al Espíritu Santo.
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="flex items-start gap-2">
                        <BookOpen className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-foreground italic">
                              "Todos ellos perseveraban unánimes en la oración, 
                              junto con María, la madre de Jesús"
                            </p>
                            <p className="text-xs text-secondary font-medium mt-1">
                              — Hechos 1:14
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-secondary/10 to-amber-500/10 rounded-xl p-4 border border-secondary/30">
                      <p className="text-sm text-foreground font-medium mb-2">
                        🕊️ El Número 9 en la Fe
                      </p>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>• 9 meses de gestación de Jesús</p>
                        <p>• 9 frutos del Espíritu Santo (Gálatas 5:22-23)</p>
                        <p>• 9 coros de ángeles en la tradición</p>
                        <p>• Hora nona: Jesús murió a la hora novena</p>
                      </div>
                    </div>

                    <div className="bg-rose-50 dark:bg-rose-950/30 rounded-xl p-4 border border-rose-200/50 dark:border-rose-800/30">
                      <Heart className="w-4 h-4 text-rose-500 mb-2" />
                      <p className="text-sm text-foreground">
                        Las novenas expresan <strong>perseverancia en la oración</strong>, 
                        como Jesús enseñó con la parábola de la viuda insistente (Lucas 18:1-8).
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
                    <Target className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-heading font-bold text-foreground">
                      Cómo Aprovecharla
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-800/30">
                        <Calendar className="w-5 h-5 text-emerald-500 mb-2" />
                        <p className="text-sm font-medium text-foreground mb-1">Misma Hora</p>
                        <p className="text-xs text-muted-foreground">
                          Reza siempre a la misma hora para crear rutina
                        </p>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
                        <Flame className="w-5 h-5 text-blue-500 mb-2" />
                        <p className="text-sm font-medium text-foreground mb-1">Intención Clara</p>
                        <p className="text-xs text-muted-foreground">
                          Define específicamente qué pides a Dios
                        </p>
                      </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/30">
                      <p className="text-sm text-foreground font-medium mb-2">
                        📋 Estructura de una Novena
                      </p>
                      <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>Señal de la Cruz y oración inicial</li>
                        <li>Lectura del día (meditación específica)</li>
                        <li>Oración propia de la novena</li>
                        <li>Petición personal</li>
                        <li>Padre Nuestro, Ave María, Gloria</li>
                      </ol>
                    </div>

                    <div className="bg-muted/50 rounded-xl p-4">
                      <p className="text-sm text-foreground font-medium mb-2">
                        ✨ Novenas Populares
                      </p>
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <p>• <strong>Divina Misericordia:</strong> Viernes Santo a Domingo de Pascua</p>
                        <p>• <strong>Navidad:</strong> 16-24 de diciembre</p>
                        <p>• <strong>San Judas Tadeo:</strong> Para causas difíciles</p>
                        <p>• <strong>Espíritu Santo:</strong> Antes de decisiones importantes</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-xl p-4 border border-emerald-200/30 dark:border-emerald-800/30">
                      <p className="text-sm text-foreground">
                        💡 <strong>Consejo:</strong> Si olvidas un día, no reinicies. 
                        Continúa donde te quedaste con humildad y confianza.
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
