import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Image, RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAllDailyShareImages, triggerDailyImageGeneration } from '@/hooks/useDailyShareImages';
import { toast } from 'sonner';

const IMAGE_TYPES = [
  { tipo: 'santo', label: 'Santo del Día' },
  { tipo: 'evangelio', label: 'Evangelio' },
  { tipo: 'versiculo', label: 'Versículo' },
  { tipo: 'reflexion', label: 'Reflexión' },
] as const;

const FORMATS = ['story', 'post'] as const;

export const DailyImagesStatus = () => {
  const { data: images, isLoading, refetch } = useAllDailyShareImages();
  const [generating, setGenerating] = useState(false);

  const getImageStatus = (tipo: string, formato: string) => {
    return images?.find(img => img.tipo === tipo && img.formato === formato);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await triggerDailyImageGeneration();
      toast.success(`Generadas ${result.generated}/${result.total} imágenes`);
      refetch();
    } catch (error) {
      toast.error('Error al generar imágenes');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const today = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  const totalExpected = IMAGE_TYPES.length * FORMATS.length;
  const totalGenerated = images?.length || 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Image className="h-4 w-4" />
            Imágenes Diarias Compartibles
          </CardTitle>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {generating ? 'Generando...' : 'Regenerar'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground capitalize">{today}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <>
            {/* Progress indicator */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Estado</span>
              <Badge variant={totalGenerated === totalExpected ? "default" : "secondary"}>
                {totalGenerated}/{totalExpected} generadas
              </Badge>
            </div>

            {/* Image grid */}
            <div className="grid grid-cols-2 gap-3">
              {IMAGE_TYPES.map(({ tipo, label }) => (
                <div key={tipo} className="space-y-2">
                  <p className="text-sm font-medium">{label}</p>
                  <div className="flex gap-2">
                    {FORMATS.map(formato => {
                      const image = getImageStatus(tipo, formato);
                      return (
                        <div
                          key={formato}
                          className={`flex-1 p-2 rounded border text-center ${
                            image 
                              ? 'border-green-500/30 bg-green-50 dark:bg-green-900/20' 
                              : 'border-muted bg-muted/30'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            {image ? (
                              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                            <span className="text-xs capitalize">{formato}</span>
                          </div>
                          {image && (
                            <a 
                              href={image.image_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline mt-1 block"
                            >
                              Ver
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};