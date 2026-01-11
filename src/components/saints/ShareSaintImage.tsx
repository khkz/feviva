import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Share2, 
  Download, 
  Instagram, 
  MessageCircle, 
  Copy, 
  Sparkles,
  Image,
  Square,
  Smartphone
} from 'lucide-react';

interface ShareSaintImageProps {
  saintId?: string;
  saintName: string;
  trigger?: React.ReactNode;
}

type ImageFormat = 'story' | 'post';

export const ShareSaintImage = ({ saintId, saintName, trigger }: ShareSaintImageProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ImageFormat>('story');
  const [saintData, setSaintData] = useState<{ name: string; feastDate: string; description: string } | null>(null);

  const generateImage = async (format: ImageFormat) => {
    setLoading(true);
    setImageUrl(null);
    setSelectedFormat(format);

    try {
      const { data, error } = await supabase.functions.invoke('generate-saint-share-image', {
        body: { saintId, format },
      });

      if (error) throw error;

      if (data.success) {
        setImageUrl(data.imageUrl);
        setSaintData(data.saint);
        toast({
          title: '¡Imagen generada!',
          description: 'Lista para compartir en redes sociales',
        });
      } else {
        throw new Error(data.error || 'Error al generar imagen');
      }
    } catch (error: any) {
      console.error('Error generating image:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo generar la imagen',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `elrugido-${saintName.replace(/\s+/g, '-').toLowerCase()}-${selectedFormat}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: '¡Descargado!',
        description: 'Imagen guardada correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo descargar la imagen',
        variant: 'destructive',
      });
    }
  };

  const handleCopyLink = async () => {
    if (!imageUrl) return;
    await navigator.clipboard.writeText(imageUrl);
    toast({
      title: '¡Copiado!',
      description: 'Link de la imagen copiado',
    });
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      `🙏 Hoy celebramos a ${saintData?.name || saintName}\n📅 ${saintData?.feastDate || ''}\n\n${saintData?.description || ''}\n\n✝️ Descubre más santos en El Rugido:\n${window.location.origin}/santos`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          Compartir
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              Compartir Santo del Día
            </DialogTitle>
            <DialogDescription>
              Genera una imagen profesional para compartir en Instagram
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Selector de formato */}
            <div className="flex gap-2">
              <Button
                variant={selectedFormat === 'story' ? 'default' : 'outline'}
                onClick={() => !loading && generateImage('story')}
                disabled={loading}
                className="flex-1"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Story (9:16)
              </Button>
              <Button
                variant={selectedFormat === 'post' ? 'default' : 'outline'}
                onClick={() => !loading && generateImage('post')}
                disabled={loading}
                className="flex-1"
              >
                <Square className="h-4 w-4 mr-2" />
                Post (1:1)
              </Button>
            </div>

            {/* Preview de imagen */}
            <div 
              className={`relative bg-muted rounded-lg overflow-hidden flex items-center justify-center ${
                selectedFormat === 'story' ? 'aspect-[9/16] max-h-[400px]' : 'aspect-square'
              }`}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                  >
                    <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                    <p className="text-sm text-muted-foreground">Generando imagen...</p>
                    <p className="text-xs text-muted-foreground">Esto puede tomar unos segundos</p>
                  </motion.div>
                ) : imageUrl ? (
                  <motion.img
                    key="image"
                    src={imageUrl}
                    alt={saintName}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center p-6"
                  >
                    <Image className="h-16 w-16 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Selecciona un formato para generar la imagen
                    </p>
                    <Badge variant="secondary" className="mt-2">
                      {saintName}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Botones de acción */}
            {imageUrl && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-2"
              >
                <Button onClick={handleDownload} className="gap-2">
                  <Download className="h-4 w-4" />
                  Descargar
                </Button>
                <Button 
                  onClick={handleShareWhatsApp}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
                <Button variant="outline" onClick={handleCopyLink} className="gap-2 col-span-2">
                  <Copy className="h-4 w-4" />
                  Copiar Link
                </Button>
              </motion.div>
            )}

            {/* Instrucciones */}
            <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
              <p className="font-medium mb-1">💡 Cómo compartir en Instagram:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Descarga la imagen</li>
                <li>Abre Instagram y crea una Story o Post</li>
                <li>Selecciona la imagen descargada</li>
                <li>¡Comparte con tus seguidores!</li>
              </ol>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
