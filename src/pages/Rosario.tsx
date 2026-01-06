import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, ChevronDown, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RosarioMisterio } from "@/components/rosario/RosarioMisterio";
import { RosarioDecena } from "@/components/rosario/RosarioDecena";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { 
  MISTERIOS, 
  ORACIONES_ROSARIO, 
  getMisterioDelDia, 
  TipoMisterio 
} from "@/lib/rosarioData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type RosarioStep = "inicio" | "credo" | "padres" | "misterio" | "final";

interface OracionDisplayProps {
  titulo: string;
  texto: string;
  onComplete: () => void;
}

function OracionDisplay({ titulo, texto, onComplete }: OracionDisplayProps) {
  return (
    <div className="flex flex-col h-full">
      <h2 className="font-heading text-xl font-bold text-foreground mb-4">{titulo}</h2>
      <ScrollArea className="flex-1 mb-6">
        <div className="text-foreground leading-relaxed whitespace-pre-line">
          {texto}
        </div>
      </ScrollArea>
      <Button onClick={onComplete} size="lg" className="w-full">
        <Check className="mr-2 h-5 w-5" />
        Continuar
      </Button>
    </div>
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
    if (decenaActual < 9) {
      setDecenaActual(decenaActual + 1);
    } else {
      // Completed this mystery
      if (misterioActual < 4) {
        setMisterioActual(misterioActual + 1);
        setDecenaActual(0);
      } else {
        // All mysteries completed
        setStep("final");
        saveProgress();
      }
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
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/oraciones")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-heading text-lg font-bold text-foreground">Santo Rosario</h1>
            <p className="text-sm text-muted-foreground">{misterios.nombre}</p>
          </div>
          {step !== "inicio" && (
            <Button variant="ghost" size="icon" onClick={handleReset}>
              <RotateCcw className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        {step !== "inicio" && step !== "final" && (
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1 text-center">
              Misterio {misterioActual + 1} de 5 • Avemaría {decenaActual + 1} de 10
            </p>
          </div>
        )}
      </header>

      {/* Content */}
      <div className="p-4">
        {step === "inicio" && (
          <div className="space-y-6">
            {/* Mystery selector */}
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-2">Selecciona los misterios</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {misterios.nombre}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {(Object.keys(MISTERIOS) as TipoMisterio[]).map((tipo) => (
                      <DropdownMenuItem
                        key={tipo}
                        onClick={() => setTipoMisterio(tipo)}
                        className={cn(tipo === tipoMisterio && "bg-accent")}
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

            {/* Mysteries overview */}
            <div className="space-y-3">
              <h2 className="font-heading font-semibold text-lg">Los 5 Misterios</h2>
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
            </div>

            {/* Start button */}
            <Button onClick={handleStart} size="lg" className="w-full">
              <Play className="mr-2 h-5 w-5" />
              Comenzar Rosario
            </Button>
          </div>
        )}

        {step === "credo" && (
          <OracionDisplay
            titulo="Credo"
            texto={ORACIONES_ROSARIO.credo}
            onComplete={handleCompleteCredo}
          />
        )}

        {step === "padres" && (
          <div className="space-y-6">
            <OracionDisplay
              titulo="Padre Nuestro"
              texto={ORACIONES_ROSARIO.padreNuestro}
              onComplete={handleCompletePadres}
            />
          </div>
        )}

        {step === "misterio" && (
          <div className="space-y-6">
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
            <Card>
              <CardContent className="p-6">
                <RosarioDecena
                  completadas={decenaActual}
                  onComplete={handleCompleteAvemaria}
                />
              </CardContent>
            </Card>

            {/* Prayer text */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">Ave María</h3>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                  {ORACIONES_ROSARIO.aveMaria}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "final" && (
          <div className="space-y-6 text-center py-8">
            <div className="w-20 h-20 mx-auto bg-secondary/20 rounded-full flex items-center justify-center">
              <Check className="h-10 w-10 text-secondary" />
            </div>
            
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground">
                ¡Rosario Completado!
              </h2>
              <p className="text-muted-foreground mt-2">
                Has terminado los {misterios.nombre}
              </p>
            </div>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Salve Regina</h3>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                  {ORACIONES_ROSARIO.salveRegina}
                </p>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                Rezar Otro
              </Button>
              <Button onClick={() => navigate("/oraciones")} className="flex-1">
                Terminar
              </Button>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
