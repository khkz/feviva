import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, BookOpen, MessageSquare, Target, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIReflectionProps {
  reflection: string;
  loading: boolean;
  currentStage: number;
  onGetReflection: (tipo: 'reflexion' | 'quiz' | 'analisis' | 'consejo') => void;
}

const reflectionTypes = [
  { tipo: 'reflexion' as const, label: 'Reflexión', icon: BookOpen, description: 'Preguntas para meditar' },
  { tipo: 'quiz' as const, label: 'Quiz', icon: Target, description: 'Evalúa tu aprendizaje' },
  { tipo: 'analisis' as const, label: 'Análisis', icon: MessageSquare, description: 'Revisa tu progreso' },
  { tipo: 'consejo' as const, label: 'Consejo', icon: Lightbulb, description: 'Qué hacer ahora' },
];

export const AIReflection = ({
  reflection,
  loading,
  currentStage,
  onGetReflection,
}: AIReflectionProps) => {
  const [selectedType, setSelectedType] = useState<'reflexion' | 'quiz' | 'analisis' | 'consejo'>('consejo');

  const handleGetReflection = (tipo: typeof selectedType) => {
    setSelectedType(tipo);
    onGetReflection(tipo);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          Guía Espiritual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Type selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {reflectionTypes.map(({ tipo, label, icon: Icon, description }) => (
            <Button
              key={tipo}
              variant={selectedType === tipo ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'h-auto py-2 flex-col gap-1',
                selectedType === tipo && 'ring-2 ring-primary/30'
              )}
              onClick={() => handleGetReflection(tipo)}
              disabled={loading}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>

        {/* Loading state */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-8"
            >
              <div className="flex items-center gap-3 text-muted-foreground">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Generando con Gemini 3 Pro...</span>
              </div>
            </motion.div>
          )}

          {/* Reflection content */}
          {!loading && reflection && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-muted/50 rounded-lg p-4 prose prose-sm dark:prose-invert max-w-none"
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {reflection}
              </div>
            </motion.div>
          )}

          {/* Empty state */}
          {!loading && !reflection && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-6 text-muted-foreground"
            >
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                Selecciona un tipo de guía para recibir consejo personalizado de IA
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Refresh button */}
        {reflection && !loading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleGetReflection(selectedType)}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Generar otra {reflectionTypes.find(t => t.tipo === selectedType)?.label.toLowerCase()}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
