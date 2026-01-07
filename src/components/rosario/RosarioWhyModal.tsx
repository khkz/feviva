import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Heart, Sparkles, Church, Shield, Clock, BookOpen, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RosarioWhyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RosarioWhyModal({ open, onOpenChange }: RosarioWhyModalProps) {
  const [activeTab, setActiveTab] = useState("ciencia");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden p-0">
        <div className="bg-gradient-to-br from-secondary/20 via-primary/10 to-purple-500/10 p-5 pb-3">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <DialogTitle className="font-heading text-lg">
                ¿Por qué el Rosario?
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
              <TabsTrigger value="historia" className="text-xs sm:text-sm">
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                Historia
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
                      Neurociencia de la Repetición
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/30">
                      <p className="text-sm text-foreground leading-relaxed">
                        La repetición rítmica del Rosario activa el <strong>sistema nervioso parasimpático</strong>, 
                        reduciendo cortisol y promoviendo un estado de calma profunda.
                      </p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm text-foreground font-medium mb-1">
                            Meditación Estructurada
                          </p>
                          <p className="text-sm text-muted-foreground">
                            El ritmo de las Ave Marías sincroniza con la respiración, 
                            creando un estado similar a la <strong>meditación profunda</strong>.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-xl p-4">
                      <p className="text-xs text-muted-foreground mb-2 font-medium">
                        📊 Estudios Científicos
                      </p>
                      <ul className="text-sm text-foreground space-y-1">
                        <li>• <strong>BMJ:</strong> Rezar el Rosario reduce la presión arterial</li>
                        <li>• <strong>Journal of Religion:</strong> Mejora la calidad del sueño</li>
                        <li>• Reduce síntomas de ansiedad en un 25%</li>
                      </ul>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-200/30 dark:border-purple-800/30">
                      <p className="text-sm text-foreground font-medium mb-1">
                        🧘 Efecto "Mantra"
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Como los mantras orientales, la repetición sagrada 
                        aquieta la mente y abre el corazón a la contemplación.
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
                      El Evangelio en Miniatura
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-secondary/10 rounded-xl p-4 border border-secondary/30">
                      <p className="text-sm text-foreground leading-relaxed">
                        San Juan Pablo II llamó al Rosario <strong>"compendio del Evangelio"</strong>. 
                        Los 20 misterios recorren toda la vida de Jesús y María.
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="flex items-start gap-2">
                        <BookOpen className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-foreground italic">
                              "El Rosario es mi oración predilecta. ¡Oración maravillosa!"
                            </p>
                            <p className="text-xs text-secondary font-medium mt-1">
                              — San Juan Pablo II
                            </p>
                          </div>
                          <div className="pt-2 border-t border-border/50">
                            <p className="text-sm text-foreground italic">
                              "Dame un ejército que rece el Rosario, y conquistaré el mundo"
                            </p>
                            <p className="text-xs text-secondary font-medium mt-1">
                              — Beato Pío IX
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-xl p-4 border border-secondary/30">
                      <p className="text-sm text-foreground font-medium mb-2">
                        🌹 Los Misterios como Escuela
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>• <strong>Gozosos:</strong> Alegría</div>
                        <div>• <strong>Dolorosos:</strong> Fortaleza</div>
                        <div>• <strong>Gloriosos:</strong> Esperanza</div>
                        <div>• <strong>Luminosos:</strong> Fe</div>
                      </div>
                    </div>

                    <div className="bg-rose-50 dark:bg-rose-950/30 rounded-xl p-4 border border-rose-200/50 dark:border-rose-800/30">
                      <Shield className="w-4 h-4 text-rose-500 mb-2" />
                      <p className="text-sm text-foreground">
                        La Virgen en Fátima pidió rezar el Rosario diariamente 
                        <strong> para la paz del mundo</strong> y la conversión de los pecadores.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="historia" className="mt-4 space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <h3 className="font-heading font-bold text-foreground">
                      800 Años de Historia
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/30">
                      <p className="text-sm text-foreground leading-relaxed">
                        La tradición cuenta que la Virgen María entregó el Rosario 
                        a <strong>Santo Domingo de Guzmán</strong> en 1214 para combatir la herejía albigense.
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded-xl p-4">
                      <p className="text-sm text-foreground font-medium mb-3">
                        ⚔️ Batallas Ganadas con el Rosario
                      </p>
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-amber-600">1571:</span>
                          <span>Batalla de Lepanto - Victoria cristiana contra el Imperio Otomano</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-amber-600">1716:</span>
                          <span>Sitio de Corfú - Defensa milagrosa de la isla</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-amber-600">1955:</span>
                          <span>Austria libre - Tropas soviéticas se retiran sin explicación</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
                        <Users className="w-5 h-5 text-blue-500 mb-2" />
                        <p className="text-sm font-medium text-foreground mb-1">Mil Millones</p>
                        <p className="text-xs text-muted-foreground">
                          de católicos rezan el Rosario regularmente
                        </p>
                      </div>

                      <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-800/30">
                        <Heart className="w-5 h-5 text-emerald-500 mb-2" />
                        <p className="text-sm font-medium text-foreground mb-1">Apariciones</p>
                        <p className="text-xs text-muted-foreground">
                          Fátima, Lourdes y Guadalupe: María pide el Rosario
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-amber-500/10 to-rose-500/10 rounded-xl p-4 border border-amber-200/30 dark:border-amber-800/30">
                      <p className="text-sm text-foreground">
                        💡 <strong>Dato:</strong> El 7 de octubre es la Fiesta del Santo Rosario, 
                        instituida por el Papa San Pío V tras la victoria de Lepanto.
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
