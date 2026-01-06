import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  BookOpen,
  Sparkles 
} from "lucide-react";
import { Novena, UserNovenaProgress } from "@/hooks/useNovenas";

interface NovenaDiaDetailProps {
  novena: Novena;
  progress: UserNovenaProgress;
  onComplete: (dia: number) => void;
  onBack: () => void;
}

export const NovenaDiaDetail = ({ novena, progress, onComplete, onBack }: NovenaDiaDetailProps) => {
  const [currentViewDia, setCurrentViewDia] = useState(progress.dia_actual);
  
  const diaData = novena.dias.find(d => d.dia === currentViewDia);
  const isDiaCompleted = progress.dias_completados.includes(currentViewDia);
  const canComplete = currentViewDia === progress.dia_actual && !isDiaCompleted;

  const goToPreviousDia = () => {
    if (currentViewDia > 1) {
      setCurrentViewDia(currentViewDia - 1);
    }
  };

  const goToNextDia = () => {
    if (currentViewDia < 9) {
      setCurrentViewDia(currentViewDia + 1);
    }
  };

  if (!diaData) {
    return (
      <div className="text-center py-8">
        <p>Día no encontrado</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="font-semibold text-lg">{novena.titulo}</h2>
          <p className="text-sm text-muted-foreground">{diaData.titulo}</p>
        </div>
      </div>

      {/* Day Navigation */}
      <div className="flex items-center justify-center gap-2 py-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goToPreviousDia}
          disabled={currentViewDia === 1}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((dia) => (
            <button
              key={dia}
              onClick={() => setCurrentViewDia(dia)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                dia === currentViewDia
                  ? "bg-primary text-primary-foreground"
                  : progress.dias_completados.includes(dia)
                  ? "bg-green-500/20 text-green-600 dark:text-green-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {dia}
            </button>
          ))}
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goToNextDia}
          disabled={currentViewDia === 9}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100vh-320px)]">
        <div className="space-y-4 pr-4">
          {/* Status Badge */}
          {isDiaCompleted && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-2 rounded-lg">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Día completado</span>
            </div>
          )}

          {/* Prayer Card */}
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Oración del Día
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed whitespace-pre-line">
                {diaData.oracion}
              </p>
            </CardContent>
          </Card>

          {/* Reflection Card */}
          <Card className="bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Reflexión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground italic">
                {diaData.reflexion}
              </p>
            </CardContent>
          </Card>

          {/* Intention Reminder */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-3">
              <p className="text-sm text-center">
                <span className="font-medium">Intención de la novena:</span>{" "}
                <span className="text-muted-foreground">{novena.intencion}</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Complete Button */}
      {canComplete && (
        <Button 
          onClick={() => onComplete(currentViewDia)} 
          className="w-full"
          size="lg"
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          Completar Día {currentViewDia}
        </Button>
      )}
    </div>
  );
};
