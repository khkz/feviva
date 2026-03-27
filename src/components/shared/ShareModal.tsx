import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Facebook, 
  MessageCircle, 
  Mail, 
  Link2, 
  Share2,
  Download,
  Loader2
} from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  text: string;
  reference?: string;
}

// Logo URL for branding
const LOGO_URL = '/logo-elrugido.svg';

// Generate Post (1:1) image with canvas
const GeneratedPostImage = ({ 
  text, 
  reference,
  onGenerated 
}: { 
  text: string; 
  reference?: string;
  onGenerated?: (dataUrl: string) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';

    const compose = (hasLogo: boolean) => {
      const size = 1080;
      canvas.width = size;
      canvas.height = size;

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(0.5, '#16213e');
      gradient.addColorStop(1, '#0f0f1a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // Add subtle pattern overlay
      ctx.fillStyle = 'rgba(212, 175, 55, 0.03)';
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 40 + 10, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw logo at top
      if (hasLogo) {
        const logoSize = 100;
        const logoX = (size - logoSize) / 2;
        const logoY = 60;
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      }

      // Draw decorative border
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, size - 80, size - 80);

      // Inner decorative border
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)';
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 60, size - 120, size - 120);

      // Quote text
      const displayText = text.length > 300 ? text.substring(0, 300) + "..." : text;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'italic 42px Nunito, sans-serif';
      ctx.textAlign = 'center';
      
      // Word wrap text
      const maxWidth = size - 160;
      const lineHeight = 56;
      const words = displayText.split(' ');
      let line = '';
      const lines: string[] = [];
      
      for (const word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== '') {
          lines.push(line.trim());
          line = word + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line.trim());

      // Calculate starting Y to center text
      const totalTextHeight = lines.length * lineHeight;
      let startY = (size - totalTextHeight) / 2 + 40;

      // Draw opening quote
      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 80px Montserrat, sans-serif';
      ctx.fillText('"', size / 2 - maxWidth / 2 + 40, startY - 20);

      // Draw text lines
      ctx.fillStyle = '#ffffff';
      ctx.font = 'italic 42px Nunito, sans-serif';
      lines.forEach((l, i) => {
        ctx.fillText(l, size / 2, startY + i * lineHeight);
      });

      // Draw closing quote
      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 80px Montserrat, sans-serif';
      ctx.fillText('"', size / 2 + maxWidth / 2 - 40, startY + (lines.length - 1) * lineHeight + 20);

      // Reference text
      if (reference) {
        ctx.fillStyle = '#D4AF37';
        ctx.font = 'bold 32px Montserrat, sans-serif';
        ctx.fillText(`— ${reference}`, size / 2, startY + lines.length * lineHeight + 60);
      }

      // Draw branding at bottom
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '28px Nunito, sans-serif';
      ctx.fillText('elrugido.com', size / 2, size - 60);

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png');
      setGeneratedUrl(dataUrl);
      setIsGenerating(false);
      onGenerated?.(dataUrl);
    };

    logoImg.onload = () => compose(true);
    logoImg.onerror = () => compose(false);
    logoImg.src = LOGO_URL;
  }, [text, reference, onGenerated]);

  if (isGenerating) {
    return (
      <div className="relative aspect-square max-h-[300px] mx-auto overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <div className="relative aspect-square max-h-[300px] mx-auto overflow-hidden rounded-lg border">
      {generatedUrl ? (
        <img
          src={generatedUrl}
          alt="Post para Instagram"
          className="w-full h-full object-contain bg-[#1a1a2e]"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <p className="text-muted-foreground">Error al generar imagen</p>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

// Generate Story (9:16) image with canvas
const GeneratedStoryImage = ({ 
  text, 
  reference,
  onGenerated 
}: { 
  text: string; 
  reference?: string;
  onGenerated?: (dataUrl: string) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';

    const compose = (hasLogo: boolean) => {
      const storyWidth = 1080;
      const storyHeight = 1920;
      canvas.width = storyWidth;
      canvas.height = storyHeight;

      // Create gradient background
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

      // Draw logo at top center
      if (hasLogo) {
        const logoSize = 120;
        const logoX = (storyWidth - logoSize) / 2;
        const logoY = 80;
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

        // Add branding text below logo
        ctx.fillStyle = '#D4AF37';
        ctx.font = 'bold 48px Montserrat, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ElRugido', storyWidth / 2, logoY + logoSize + 50);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '28px Nunito, sans-serif';
        ctx.fillText('elrugido.com', storyWidth / 2, logoY + logoSize + 90);

        // Decorative line
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(storyWidth / 2 - 100, logoY + logoSize + 115);
        ctx.lineTo(storyWidth / 2 + 100, logoY + logoSize + 115);
        ctx.stroke();
      }

      // Draw decorative border
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, storyWidth - 80, storyHeight - 80);

      // Quote text - centered in the middle area
      const displayText = text.length > 400 ? text.substring(0, 400) + "..." : text;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'italic 52px Nunito, sans-serif';
      ctx.textAlign = 'center';

      // Word wrap text
      const maxWidth = storyWidth - 160;
      const lineHeight = 70;
      const words = displayText.split(' ');
      let line = '';
      const lines: string[] = [];

      for (const word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== '') {
          lines.push(line.trim());
          line = word + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line.trim());

      // Calculate starting Y to center text
      const totalTextHeight = lines.length * lineHeight;
      const startY = (storyHeight - totalTextHeight) / 2;

      // Draw opening quote
      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 100px Montserrat, sans-serif';
      ctx.fillText('"', storyWidth / 2 - maxWidth / 2 + 60, startY - 30);

      // Draw text lines
      ctx.fillStyle = '#ffffff';
      ctx.font = 'italic 52px Nunito, sans-serif';
      lines.forEach((l, i) => {
        ctx.fillText(l, storyWidth / 2, startY + i * lineHeight);
      });

      // Draw closing quote
      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 100px Montserrat, sans-serif';
      ctx.fillText('"', storyWidth / 2 + maxWidth / 2 - 60, startY + (lines.length - 1) * lineHeight + 30);

      // Reference text
      if (reference) {
        ctx.fillStyle = '#D4AF37';
        ctx.font = 'bold 40px Montserrat, sans-serif';
        ctx.fillText(`— ${reference}`, storyWidth / 2, startY + lines.length * lineHeight + 80);
      }

      // Draw small logo at bottom
      if (hasLogo) {
        const bottomLogoSize = 80;
        ctx.drawImage(logoImg, (storyWidth - bottomLogoSize) / 2, storyHeight - bottomLogoSize - 60, bottomLogoSize, bottomLogoSize);
      }

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png');
      setGeneratedUrl(dataUrl);
      setIsGenerating(false);
      onGenerated?.(dataUrl);
    };

    logoImg.onload = () => compose(true);
    logoImg.onerror = () => compose(false);
    logoImg.src = LOGO_URL;
  }, [text, reference, onGenerated]);

  if (isGenerating) {
    return (
      <div className="relative aspect-[9/16] max-h-[400px] mx-auto overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <div className="relative aspect-[9/16] max-h-[400px] mx-auto overflow-hidden rounded-lg border">
      {generatedUrl ? (
        <img
          src={generatedUrl}
          alt="Story para Instagram"
          className="w-full h-full object-contain bg-[#1a1a2e]"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <p className="text-muted-foreground">Error al generar imagen</p>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export const ShareModal = ({ isOpen, onClose, title, text, reference }: ShareModalProps) => {
  const { toast } = useToast();
  const [copying, setCopying] = useState(false);
  const [activeTab, setActiveTab] = useState<'story' | 'post'>('story');
  const [storyDataUrl, setStoryDataUrl] = useState<string | null>(null);
  const [postDataUrl, setPostDataUrl] = useState<string | null>(null);

  const shareText = reference 
    ? `"${text}" - ${reference}\n\nvía elrugido.com` 
    : `${text}\n\nvía elrugido.com`;
  const shareUrl = "https://elrugido.com";

  const isInIframe = typeof window !== 'undefined' && window !== window.parent;

  const handleDownload = async () => {
    const urlToDownload = activeTab === 'story' ? storyDataUrl : postDataUrl;
    if (!urlToDownload) return;

    try {
      const response = await fetch(urlToDownload);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `elrugido-${activeTab}-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast({
        title: "Imagen descargada",
        description: "La imagen se ha guardado en tu dispositivo",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo descargar la imagen",
        variant: "destructive",
      });
    }
  };

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      ),
      color: "bg-[#25D366]",
      action: async () => {
        if (isInIframe) {
          try {
            await navigator.clipboard.writeText(shareText);
            toast({
              title: "Texto copiado",
              description: "Abre WhatsApp y pega el texto en tu chat",
            });
          } catch (error) {
            toast({
              title: "Error",
              description: "No se pudo copiar el texto",
              variant: "destructive",
            });
          }
        } else {
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
        }
      },
    },
    {
      name: "Facebook",
      icon: <Facebook className="h-6 w-6" />,
      color: "bg-[#1877F2]",
      action: async () => {
        try {
          await navigator.clipboard.writeText(shareText);
          if (!isInIframe) {
            window.open('https://www.facebook.com', '_blank', 'noopener,noreferrer');
          }
          toast({
            title: "Texto copiado",
            description: isInIframe 
              ? "Abre Facebook y pega el texto en tu publicación" 
              : "Pega el texto en tu publicación de Facebook",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "No se pudo copiar el texto",
            variant: "destructive",
          });
        }
      },
    },
    {
      name: "X",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: "bg-black",
      action: async () => {
        if (isInIframe) {
          try {
            await navigator.clipboard.writeText(shareText);
            toast({
              title: "Texto copiado",
              description: "Abre X (Twitter) y pega el texto en tu tweet",
            });
          } catch (error) {
            toast({
              title: "Error",
              description: "No se pudo copiar el texto",
              variant: "destructive",
            });
          }
        } else {
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
            "_blank",
            "width=600,height=400"
          );
        }
      },
    },
    {
      name: "Mensajes",
      icon: <MessageCircle className="h-6 w-6" />,
      color: "bg-[#34C759]",
      action: () => {
        window.open(`sms:?body=${encodeURIComponent(shareText)}`);
      },
    },
    {
      name: "Copiar",
      icon: <Link2 className="h-6 w-6" />,
      color: "bg-muted",
      textColor: "text-foreground",
      action: async () => {
        setCopying(true);
        try {
          await navigator.clipboard.writeText(shareText);
          toast({
            title: "Copiado",
            description: "Texto copiado al portapapeles",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "No se pudo copiar el texto",
            variant: "destructive",
          });
        }
        setCopying(false);
      },
    },
    {
      name: "Correo",
      icon: <Mail className="h-6 w-6" />,
      color: "bg-muted",
      textColor: "text-foreground",
      action: () => {
        window.open(
          `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareText)}`
        );
      },
    },
  ];

  const handleNativeShare = async () => {
    const urlToShare = activeTab === 'story' ? storyDataUrl : postDataUrl;
    
    if (navigator.share && urlToShare) {
      try {
        const response = await fetch(urlToShare);
        const blob = await response.blob();
        const file = new File([blob], `elrugido-${activeTab}.png`, { type: 'image/png' });

        await navigator.share({
          title,
          text: shareText,
          files: [file],
        });
      } catch (error) {
        // Fallback to text share
        try {
          await navigator.share({
            title,
            text: shareText,
            url: shareUrl,
          });
        } catch (e) {
          // User cancelled
        }
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Compartir</DialogTitle>
        </DialogHeader>

        {/* Image Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'story' | 'post')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="story">Story (9:16)</TabsTrigger>
            <TabsTrigger value="post">Post (1:1)</TabsTrigger>
          </TabsList>

          <TabsContent value="story" className="mt-4">
            <GeneratedStoryImage 
              text={text} 
              reference={reference}
              onGenerated={setStoryDataUrl}
            />
          </TabsContent>

          <TabsContent value="post" className="mt-4">
            <GeneratedPostImage 
              text={text} 
              reference={reference}
              onGenerated={setPostDataUrl}
            />
          </TabsContent>
        </Tabs>

        {/* Download Button */}
        <div className="flex justify-center">
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Descargar imagen
          </Button>
        </div>

        {/* Share Options */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={option.action}
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${option.color} ${option.textColor || "text-white"}`}
              >
                {option.icon}
              </div>
              <span className="text-xs text-muted-foreground text-center leading-tight">
                {option.name}
              </span>
            </button>
          ))}
        </div>

        {/* Native Share Button (for mobile) */}
        {typeof navigator !== 'undefined' && navigator.share && (
          <Button onClick={handleNativeShare} variant="outline" className="w-full mt-2">
            <Share2 className="h-4 w-4 mr-2" />
            Más opciones
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};
