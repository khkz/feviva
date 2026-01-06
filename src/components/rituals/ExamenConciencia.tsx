import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, ChevronRight, ChevronLeft } from "lucide-react";

interface ExamenConcienciaProps {
  initialValues?: Record<string, string>;
  onComplete: (values: Record<string, string>) => void;
}

const PREGUNTAS = [
  {
    id: "agradecimiento",
    pregunta: "¿Por qué estoy agradecido hoy?",
    placeholder: "Piensa en los momentos, personas o bendiciones de hoy..."
  },
  {
    id: "presencia_dios",
    pregunta: "¿Dónde vi a Dios actuando hoy?",
    placeholder: "Recuerda momentos donde sentiste Su presencia..."
  },
  {
    id: "dificultad",
    pregunta: "¿Qué momento fue difícil hoy?",
    placeholder: "Reflexiona sobre los desafíos que enfrentaste..."
  },
  {
    id: "cambio",
    pregunta: "¿Qué hubiera hecho diferente?",
    placeholder: "Si pudieras volver atrás, ¿qué cambiarías?"
  },
  {
    id: "gracia",
    pregunta: "¿Qué gracia necesito para mañana?",
    placeholder: "¿Qué le pides a Dios para el día de mañana?"
  }
];

export const ExamenConciencia = ({ initialValues = {}, onComplete }: ExamenConcienciaProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>(initialValues);

  const currentPregunta = PREGUNTAS[currentStep];
  const isLastStep = currentStep === PREGUNTAS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onComplete(values);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleChange = (value: string) => {
    setValues(prev => ({
      ...prev,
      [currentPregunta.id]: value
    }));
  };

  return (
    <Card className="border-purple-200/50 bg-gradient-to-b from-purple-50/30 to-background dark:from-purple-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
          <Heart className="h-5 w-5" />
          Examen de Conciencia
        </CardTitle>
        <div className="flex gap-1 mt-2">
          {PREGUNTAS.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-colors ${
                index <= currentStep ? 'bg-purple-500' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-medium text-foreground">
          {currentPregunta.pregunta}
        </p>
        
        <Textarea
          value={values[currentPregunta.id] || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={currentPregunta.placeholder}
          className="min-h-[150px] resize-none"
        />
        
        <div className="flex justify-between pt-2">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={isFirstStep}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          
          <span className="text-sm text-muted-foreground self-center">
            {currentStep + 1} de {PREGUNTAS.length}
          </span>
          
          <Button onClick={handleNext}>
            {isLastStep ? 'Completar' : 'Siguiente'}
            {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
