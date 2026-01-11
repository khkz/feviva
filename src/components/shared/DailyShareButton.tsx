import { useState } from "react";
import { Share2, Download, MessageCircle, Copy, Check, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDailyShareImages, ShareImageType } from "@/hooks/useDailyShareImages";
import { toast } from "sonner";

interface DailyShareButtonProps {
  tipo: ShareImageType;
  title?: string;
  fallbackText?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export const DailyShareButton = ({
  tipo,
  title = "Compartir",
  fallbackText,
  className,
  variant = "outline",
  size = "default",
}: DailyShareButtonProps) => {
  const { storyUrl, postUrl, isLoading } = useDailyShareImages(tipo);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'story' | 'post'>('story');

  const currentImageUrl = activeTab === 'story' ? storyUrl : postUrl;
  const hasImages = storyUrl || postUrl;

  const handleDownload = async () => {
    if (!currentImageUrl) return;

    try {
      const response = await fetch(currentImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `elrugido-${tipo}-${activeTab}-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Imagen descargada");
    } catch (error) {
      toast.error("Error al descargar la imagen");
    }
  };

  const handleWhatsAppShare = () => {
    const text = fallbackText || `¡Mira el contenido de hoy en ElRugido! ${currentImageUrl || 'https://elrugido.com'}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopyLink = async () => {
    if (!currentImageUrl) return;

    try {
      await navigator.clipboard.writeText(currentImageUrl);
      setCopied(true);
      toast.success("Enlace copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Error al copiar el enlace");
    }
  };

  const handleNativeShare = async () => {
    if (!currentImageUrl) return;

    if (navigator.share) {
      try {
        // Try to share with image
        const response = await fetch(currentImageUrl);
        const blob = await response.blob();
        const file = new File([blob], `elrugido-${tipo}.png`, { type: 'image/png' });

        await navigator.share({
          title: title,
          text: fallbackText || `Contenido de ElRugido`,
          files: [file],
        });
      } catch (error) {
        // Fallback to URL share
        try {
          await navigator.share({
            title: title,
            text: fallbackText || `Contenido de ElRugido`,
            url: currentImageUrl,
          });
        } catch (e) {
          // User cancelled or error
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const tipoLabels: Record<ShareImageType, string> = {
    santo: 'Santo del Día',
    evangelio: 'Evangelio del Día',
    versiculo: 'Versículo del Día',
    reflexion: 'Reflexión del Día',
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Share2 className="h-4 w-4 mr-2" />
          {title}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartir {tipoLabels[tipo]}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : hasImages ? (
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'story' | 'post')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="story" disabled={!storyUrl}>
                  Story (9:16)
                </TabsTrigger>
                <TabsTrigger value="post" disabled={!postUrl}>
                  Post (1:1)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="story" className="mt-4">
                {storyUrl && (
                  <div className="relative aspect-[9/16] max-h-[400px] mx-auto overflow-hidden rounded-lg border">
                    <img
                      src={storyUrl}
                      alt={`${tipoLabels[tipo]} - Story`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="post" className="mt-4">
                {postUrl && (
                  <div className="relative aspect-square max-h-[400px] mx-auto overflow-hidden rounded-lg border">
                    <img
                      src={postUrl}
                      alt={`${tipoLabels[tipo]} - Post`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex flex-wrap gap-2 justify-center pt-2">
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
              
              <Button onClick={handleWhatsAppShare} variant="outline" size="sm" className="text-green-600">
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              
              <Button onClick={handleCopyLink} variant="outline" size="sm">
                {copied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? "Copiado" : "Copiar enlace"}
              </Button>

              {navigator.share && (
                <Button onClick={handleNativeShare} variant="default" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Las imágenes de hoy aún no están disponibles.</p>
            <p className="text-sm mt-2">Se generan automáticamente cada día.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};