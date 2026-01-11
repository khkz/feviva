import { useState, useEffect, useRef } from "react";
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

// Compose Story (9:16) from Post (1:1) by centering with gradient background
const ComposedStoryImage = ({ 
  postUrl, 
  alt,
  onComposed 
}: { 
  postUrl: string; 
  alt: string;
  onComposed?: (dataUrl: string) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [composedUrl, setComposedUrl] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !postUrl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Story dimensions: 1080x1920 (9:16)
      const storyWidth = 1080;
      const storyHeight = 1920;
      
      canvas.width = storyWidth;
      canvas.height = storyHeight;
      
      // Create gradient background (deep gold to burgundy)
      const gradient = ctx.createLinearGradient(0, 0, 0, storyHeight);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(0.3, '#16213e');
      gradient.addColorStop(0.5, '#1a1a2e');
      gradient.addColorStop(0.7, '#16213e');
      gradient.addColorStop(1, '#0f0f1a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, storyWidth, storyHeight);
      
      // Add subtle pattern overlay
      ctx.fillStyle = 'rgba(212, 175, 55, 0.03)';
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * storyWidth;
        const y = Math.random() * storyHeight;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 50 + 10, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Draw the post image centered
      const postSize = storyWidth; // 1080
      const postY = (storyHeight - postSize) / 2; // Center vertically
      
      // Add soft shadow behind image
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 10;
      ctx.drawImage(img, 0, postY, postSize, postSize);
      ctx.shadowColor = 'transparent';
      
      // Add branding at top
      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 48px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('ElRugido', storyWidth / 2, 80);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '28px Georgia, serif';
      ctx.fillText('elrugido.com', storyWidth / 2, 120);
      
      // Add subtle decorative line
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(storyWidth / 2 - 100, 150);
      ctx.lineTo(storyWidth / 2 + 100, 150);
      ctx.stroke();
      
      // Add lion silhouette hint at bottom
      ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
      ctx.font = '200px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('🦁', storyWidth / 2, storyHeight - 80);
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png');
      setComposedUrl(dataUrl);
      setIsComposing(false);
      onComposed?.(dataUrl);
    };
    
    img.onerror = () => {
      setIsComposing(false);
      console.error('Failed to load post image for composition');
    };
    
    img.src = postUrl;
  }, [postUrl, onComposed]);

  if (isComposing) {
    return (
      <div className="relative aspect-[9/16] max-h-[400px] mx-auto overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <div className="relative aspect-[9/16] max-h-[400px] mx-auto overflow-hidden rounded-lg border">
      {composedUrl ? (
        <img
          src={composedUrl}
          alt={alt}
          className="w-full h-full object-contain bg-[#1a1a2e]"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <p className="text-muted-foreground">Error al componer imagen</p>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export const DailyShareButton = ({
  tipo,
  title = "Compartir",
  fallbackText,
  className,
  variant = "outline",
  size = "default",
}: DailyShareButtonProps) => {
  const { storyUrl, postUrl, isLoading, storyMetadata } = useDailyShareImages(tipo);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'story' | 'post'>('story');
  const [composedStoryUrl, setComposedStoryUrl] = useState<string | null>(null);

  // Check if story is composed from post (santo type)
  const isComposedStory = tipo === 'santo' && storyMetadata?.composed_from_post === true;
  
  console.log('DailyShareButton:', { tipo, isComposedStory, storyMetadata });

  const currentImageUrl = activeTab === 'story' 
    ? (isComposedStory && composedStoryUrl ? composedStoryUrl : storyUrl)
    : postUrl;
  const hasImages = storyUrl || postUrl;

  const handleDownload = async () => {
    const urlToDownload = activeTab === 'story' && isComposedStory && composedStoryUrl 
      ? composedStoryUrl 
      : currentImageUrl;
      
    if (!urlToDownload) return;

    try {
      // For composed images (data URL), create blob directly
      if (urlToDownload.startsWith('data:')) {
        const response = await fetch(urlToDownload);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `elrugido-${tipo}-${activeTab}-${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const response = await fetch(urlToDownload);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `elrugido-${tipo}-${activeTab}-${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
      toast.success("Imagen descargada");
    } catch (error) {
      toast.error("Error al descargar la imagen");
    }
  };

  const handleWhatsAppShare = () => {
    const text = fallbackText || `¡Mira el contenido de hoy en ElRugido! https://elrugido.com`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopyLink = async () => {
    // For composed images, we can't copy a link - copy the website instead
    const urlToCopy = (activeTab === 'story' && isComposedStory) 
      ? 'https://elrugido.com' 
      : currentImageUrl;
      
    if (!urlToCopy) return;

    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      toast.success(isComposedStory && activeTab === 'story' ? "Enlace web copiado" : "Enlace copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Error al copiar el enlace");
    }
  };

  const handleNativeShare = async () => {
    const urlToShare = activeTab === 'story' && isComposedStory && composedStoryUrl 
      ? composedStoryUrl 
      : currentImageUrl;
      
    if (!urlToShare) return;

    if (navigator.share) {
      try {
        // Try to share with image
        const response = await fetch(urlToShare);
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
            url: 'https://elrugido.com',
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
                  isComposedStory && postUrl ? (
                    <ComposedStoryImage 
                      postUrl={postUrl} 
                      alt={`${tipoLabels[tipo]} - Story`}
                      onComposed={setComposedStoryUrl}
                    />
                  ) : (
                    <div className="relative aspect-[9/16] max-h-[400px] mx-auto overflow-hidden rounded-lg border">
                      <img
                        src={storyUrl}
                        alt={`${tipoLabels[tipo]} - Story`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )
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
