import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Play, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { Novena, UserNovenaProgress } from "@/hooks/useNovenas";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NovenaCardProps {
  novena: Novena;
  progress?: UserNovenaProgress;
  onStart: () => void;
  onContinue: () => void;
  onImageGenerated?: () => void;
}

export const NovenaCard = ({ novena, progress, onStart, onContinue, onImageGenerated }: NovenaCardProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const progressPercent = progress 
    ? (progress.dias_completados.length / 9) * 100 
    : 0;

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case "mariana":
        return "from-blue-500/20 to-blue-600/20";
      case "cristologica":
        return "from-amber-500/20 to-amber-600/20";
      case "espiritu_santo":
        return "from-orange-500/20 to-orange-600/20";
      case "santos":
        return "from-emerald-500/20 to-emerald-600/20";
      case "devocion":
        return "from-rose-500/20 to-rose-600/20";
      default:
        return "from-primary/20 to-primary/30";
    }
  };

  const getCategoriaLabel = (categoria: string) => {
    switch (categoria) {
      case "mariana":
        return "Mariana";
      case "cristologica":
        return "Cristológica";
      case "espiritu_santo":
        return "Espíritu Santo";
      case "santos":
        return "Santos";
      case "devocion":
        return "Devoción";
      default:
        return "General";
    }
  };

  const generateImage = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-novena-image', {
        body: {
          novenaId: novena.id,
          titulo: novena.titulo,
          descripcion: novena.descripcion
        }
      });

      if (error) throw error;

      toast({
        title: "Imagen generada",
        description: "La imagen de la novena ha sido creada",
      });
      
      onImageGenerated?.();
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Error",
        description: "No se pudo generar la imagen",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className={`overflow-hidden bg-gradient-to-br ${getCategoriaColor(novena.categoria)} border-border/50`}>
      {/* Image section */}
      <div className="relative aspect-[16/10] bg-background/30 overflow-hidden">
        {novena.imagen_url ? (
          <img 
            src={novena.imagen_url} 
            alt={novena.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateImage}
              disabled={isGenerating}
              className="mt-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generar imagen
                </>
              )}
            </Button>
          </div>
        )}
        
        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-background/80 backdrop-blur-sm text-foreground">
            {getCategoriaLabel(novena.categoria)}
          </span>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground">{novena.titulo}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {novena.descripcion}
          </p>
        </div>

        {progress && !progress.completada && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Día {progress.dia_actual} de 9</span>
              <span>{progress.dias_completados.length}/9 completados</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {progress?.completada && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">Novena completada</span>
          </div>
        )}

        <div className="flex gap-2">
          {!progress ? (
            <Button onClick={onStart} className="w-full" size="sm">
              <Play className="h-4 w-4 mr-2" />
              Comenzar Novena
            </Button>
          ) : !progress.completada ? (
            <Button onClick={onContinue} className="w-full" size="sm">
              Continuar Día {progress.dia_actual}
            </Button>
          ) : (
            <Button onClick={onStart} variant="outline" className="w-full" size="sm">
              Repetir Novena
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
