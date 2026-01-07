import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, ChevronDown, Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RosarioMisterio } from "@/components/rosario/RosarioMisterio";
import { RosarioDecena } from "@/components/rosario/RosarioDecena";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { AmbientSoundMixer } from "@/components/sleep/AmbientSoundMixer";
import { useRosarioExperience } from "@/hooks/useRosarioExperience";
import { 
  MISTERIOS, 
  ORACIONES_ROSARIO, 
  getMisterioDelDia, 
  TipoMisterio 
} from "@/lib/rosarioData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type RosarioStep = "inicio" | "credo" | "padres" | "misterio" | "gloria" | "final";

interface OracionDisplayProps {
  titulo: string;
  texto: string;
  onComplete: () => void;
  showAudioHint?: boolean;
}

function OracionDisplay({ titulo, texto, onComplete, showAudioHint }: OracionDisplayProps) {
  return (
    <motion.div 
      className="flex flex-col h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary mb-4"
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Oración</span>
        </motion.div>
        <h2 className="font-heading text-2xl font-bold text-foreground">{titulo}</h2>
      </div>
      
      <ScrollArea className="flex-1 mb-6">
        <div className="text-foreground text-lg leading-relaxed whitespace-pre-line text-center px-4">
          {texto}
        </div>
      </ScrollArea>
      
      {showAudioHint && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-muted-foreground mb-4"
        >
          Lee la oración en voz alta o en silencio
        </motion.p>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button 
          onClick={onComplete} 
          size="lg" 
          className="w-full h-14 text-lg rounded-2xl bg-gradient-to-r from-primary to-primary-hover shadow-lg"
        >
          <Check className="mr-2 h-5 w-5" />
          Continuar
        </Button>
      </motion.div>
    </motion.div>
  );
}

export default function Rosario() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [tipoMisterio, setTipoMisterio] = useState<TipoMisterio>(getMisterioDelDia());
  const [step, setStep] = useState<RosarioStep>("inicio");
  const [misterioActual, setMisterioActual] = useState(0);
  const [decenaActual, setDecenaActual] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [masterVolume, setMasterVolume] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    isAudioEnabled,
    setIsAudioEnabled,
    onAveMaria,
    onMysteryComplete,
    onRosaryComplete,
  } = useRosarioExperience({
    enableDarkMode: step !== "inicio",
    enableVibration: true,
    enableAudio: true,
  });
  
  const misterios = MISTERIOS[tipoMisterio];
  const totalDecenas = 5;
  const progress = ((misterioActual * 10 + decenaActual) / 50) * 100;

  const handleStart = () => {
    setStartTime(new Date());
    setStep("credo");
  };

  const handleCompleteCredo = () => {
    setStep("padres");
  };

  const handleCompletePadres = () => {
    setStep("misterio");
  };

  const handleCompleteAvemaria = () => {
    onAveMaria();
    
    if (decenaActual < 9) {
      setDecenaActual(decenaActual + 1);
    } else {
      // Completed this mystery decade - show Gloria
      setStep("gloria");
    }
  };

  const handleCompleteGloria = () => {
    onMysteryComplete();
    
    if (misterioActual < 4) {
      setMisterioActual(misterioActual + 1);
      setDecenaActual(0);
      setStep("misterio");
    } else {
      // All mysteries completed
      setStep("final");
      onRosaryComplete();
      saveProgress();
    }
  };

  const saveProgress = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const duracion = startTime 
        ? Math.round((new Date().getTime() - startTime.getTime()) / 60000) 
        : null;

      await supabase.from("user_rosario_progress").insert({
        user_id: user.user.id,
        misterio_tipo: tipoMisterio,
        completado: true,
        decenas_completadas: 5,
        duracion_minutos: duracion,
      });

      toast({
        title: "¡Rosario Completado!",
        description: "Has completado el Santo Rosario. ¡Dios te bendiga!",
      });
    } catch (error) {
      console.error("Error saving rosary progress:", error);
    }
  };

  const handleReset = () => {
    setStep("inicio");
    setMisterioActual(0);
    setDecenaActual(0);
    setStartTime(null);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Ambient background for prayer mode */}
      {step !== "inicio" && step !== "final" && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-secondary/5 via-transparent to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-radial from-primary/5 via-transparent to-transparent rounded-full blur-2xl" />
        </div>
      )}

      {/* Header */}
      <motion.header 
        className={cn(
          "sticky top-0 z-40 backdrop-blur-md border-b p-4",
          step !== "inicio" ? "bg-background/80 border-border/50" : "bg-background/95 border-border"
        )}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/oraciones")}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-lg font-bold text-foreground">Santo Rosario</h1>
              {step !== "inicio" && (
                <Moon className="h-4 w-4 text-secondary" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{misterios.nombre}</p>
          </div>
          
          {step !== "inicio" && (
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className="rounded-full"
              >
                {isAudioEnabled ? (
                  <Volume2 className="h-5 w-5 text-secondary" />
                ) : (
                  <VolumeX className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleReset}
                className="rounded-full"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
        
        {step !== "inicio" && step !== "final" && (
          <motion.div 
            className="mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Progress value={progress} className="h-2 rounded-full" />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-muted-foreground">
                Misterio {misterioActual + 1} de 5
              </p>
              <p className="text-xs text-secondary font-medium">
                {Math.round(progress)}% completado
              </p>
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* Content */}
      <div className="p-4 relative z-10">
        <AnimatePresence mode="wait">
          {step === "inicio" && (
            <motion.div 
              key="inicio"
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Hero section */}
              <motion.div
                className="text-center py-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-secondary/30 to-primary/20 flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-secondary" />
                </div>
                <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                  Prepárate para orar
                </h2>
                <p className="text-muted-foreground text-sm">
                  El Rosario activa automáticamente el modo oscuro para una experiencia más recogida
                </p>
              </motion.div>

              {/* Mystery selector */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="glass-card border-0">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-2">Misterios del día</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between rounded-xl h-12">
                          <span className="font-medium">{misterios.nombre}</span>
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64">
                        {(Object.keys(MISTERIOS) as TipoMisterio[]).map((tipo) => (
                          <DropdownMenuItem
                            key={tipo}
                            onClick={() => setTipoMisterio(tipo)}
                            className={cn(
                              "py-3",
                              tipo === tipoMisterio && "bg-accent"
                            )}
                          >
                            <div>
                              <p className="font-medium">{MISTERIOS[tipo].nombre}</p>
                              <p className="text-xs text-muted-foreground">{MISTERIOS[tipo].dia}</p>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Mysteries overview */}
              <motion.div 
                className="space-y-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="font-heading font-semibold text-lg px-1">Los 5 Misterios</h2>
                {misterios.misterios.map((m, i) => (
                  <RosarioMisterio
                    key={i}
                    numero={m.numero}
                    titulo={m.titulo}
                    fruto={m.fruto}
                    meditacion={m.meditacion}
                    isActive={false}
                    isCompleted={false}
                    onClick={() => {}}
                  />
                ))}
              </motion.div>

              {/* Settings */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-muted/30 border-border/50">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="audio-toggle" className="text-sm font-medium">
                        Sonidos y vibraciones
                      </Label>
                      <Switch
                        id="audio-toggle"
                        checked={isAudioEnabled}
                        onCheckedChange={setIsAudioEnabled}
                      />
                    </div>
                    
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-sm text-muted-foreground mb-3">Sonidos ambientales</p>
                      <AmbientSoundMixer isPlaying={true} masterVolume={masterVolume} />
                      <div className="mt-4 flex items-center gap-3">
                        <Volume2 className="h-4 w-4 text-muted-foreground" />
                        <Slider
                          value={[masterVolume]}
                          max={1}
                          step={0.1}
                          onValueChange={(value) => setMasterVolume(value[0])}
                          className="flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {Math.round(masterVolume * 100)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Start button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button 
                  onClick={handleStart} 
                  size="lg" 
                  className="w-full h-16 text-lg rounded-2xl bg-gradient-to-r from-primary to-primary-hover shadow-xl"
                >
                  <Play className="mr-3 h-6 w-6" />
                  Comenzar Rosario
                </Button>
              </motion.div>
            </motion.div>
          )}

          {step === "credo" && (
            <motion.div
              key="credo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[60vh]"
            >
              <OracionDisplay
                titulo="Credo"
                texto={ORACIONES_ROSARIO.credo}
                onComplete={handleCompleteCredo}
                showAudioHint
              />
            </motion.div>
          )}

          {step === "padres" && (
            <motion.div
              key="padres"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[60vh]"
            >
              <OracionDisplay
                titulo="Padre Nuestro"
                texto={ORACIONES_ROSARIO.padreNuestro}
                onComplete={handleCompletePadres}
                showAudioHint
              />
            </motion.div>
          )}

          {step === "gloria" && (
            <motion.div
              key="gloria"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[60vh]"
            >
              <OracionDisplay
                titulo="Gloria"
                texto={ORACIONES_ROSARIO.gloria}
                onComplete={handleCompleteGloria}
              />
            </motion.div>
          )}

          {step === "misterio" && (
            <motion.div 
              key="misterio"
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Current mystery */}
              <RosarioMisterio
                numero={misterios.misterios[misterioActual].numero}
                titulo={misterios.misterios[misterioActual].titulo}
                fruto={misterios.misterios[misterioActual].fruto}
                meditacion={misterios.misterios[misterioActual].meditacion}
                isActive={true}
                isCompleted={false}
                onClick={() => {}}
              />

              {/* Ave Maria counter */}
              <Card className="glass-card border-0 overflow-hidden">
                <CardContent className="p-6">
                  <RosarioDecena
                    completadas={decenaActual}
                    onComplete={handleCompleteAvemaria}
                  />
                </CardContent>
              </Card>

              {/* Prayer text */}
              <Card className="bg-muted/30 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-secondary" />
                    <h3 className="font-semibold text-sm text-foreground">Ave María</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {ORACIONES_ROSARIO.aveMaria}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "final" && (
            <motion.div 
              key="final"
              className="space-y-6 text-center py-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-24 h-24 mx-auto bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-full flex items-center justify-center shadow-xl shadow-secondary/20"
              >
                <Check className="h-12 w-12 text-secondary" />
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
                  ¡Rosario Completado!
                </h2>
                <p className="text-muted-foreground">
                  Has terminado los {misterios.nombre}
                </p>
                {startTime && (
                  <p className="text-sm text-secondary mt-2">
                    Duración: {Math.round((new Date().getTime() - startTime.getTime()) / 60000)} minutos
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="glass-card border-0">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 text-secondary">Salve Regina</h3>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                      {ORACIONES_ROSARIO.salveRegina}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div 
                className="flex gap-3 pt-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button 
                  variant="outline" 
                  onClick={handleReset} 
                  className="flex-1 h-12 rounded-xl"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Rezar Otro
                </Button>
                <Button 
                  onClick={() => navigate("/oraciones")} 
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-primary-hover"
                >
                  Terminar
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNavigation />
    </div>
  );
}
