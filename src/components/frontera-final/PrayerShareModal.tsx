import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Copy, Check, Share2, Code2 } from "lucide-react";
import { toast } from "sonner";

interface PrayerShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  prayer: string;
  saints?: string;
}

// Canvas component for Story format (9:16)
function PrayerStoryImage({ 
  title, 
  prayer, 
  saints,
  onGenerated 
}: { 
  title: string; 
  prayer: string; 
  saints?: string;
  onGenerated: (dataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    // Background gradient (space theme)
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.5, '#1e1b4b');
    gradient.addColorStop(1, '#164e63');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add nebula effects
    const nebulaGradient1 = ctx.createRadialGradient(200, 400, 0, 200, 400, 400);
    nebulaGradient1.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
    nebulaGradient1.addColorStop(1, 'rgba(139, 92, 246, 0)');
    ctx.fillStyle = nebulaGradient1;
    ctx.fillRect(0, 0, width, height);

    const nebulaGradient2 = ctx.createRadialGradient(880, 1400, 0, 880, 1400, 500);
    nebulaGradient2.addColorStop(0, 'rgba(34, 211, 238, 0.12)');
    nebulaGradient2.addColorStop(1, 'rgba(34, 211, 238, 0)');
    ctx.fillStyle = nebulaGradient2;
    ctx.fillRect(0, 0, width, height);

    // Draw stars
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 2 + 0.5;
      const opacity = Math.random() * 0.8 + 0.2;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fill();
    }

    // Logo placeholder area
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FRONTERA FINAL', width / 2, 120);

    // Badge with icon
    const badgeWidth = 500;
    const badgeHeight = 60;
    const badgeX = (width - badgeWidth) / 2;
    const badgeY = 200;

    ctx.fillStyle = 'rgba(34, 211, 238, 0.2)';
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 30);
    ctx.fill();
    ctx.stroke();

    // Badge text
    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🙏 ' + title.toUpperCase(), width / 2, badgeY + 40);

    // Prayer text - split into lines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = 'italic 32px Georgia, serif';
    ctx.textAlign = 'center';
    
    const maxWidth = width - 120;
    const lineHeight = 48;
    const words = prayer.split(' ');
    let line = '';
    let y = 380;
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

    // Center the text block vertically
    const totalTextHeight = lines.length * lineHeight;
    const startY = (height - totalTextHeight) / 2 - 50;

    lines.forEach((textLine, index) => {
      ctx.fillText(textLine, width / 2, startY + (index * lineHeight));
    });

    // Saints note
    if (saints) {
      const saintsY = startY + totalTextHeight + 80;
      ctx.fillStyle = 'rgba(251, 191, 36, 0.9)';
      ctx.font = '24px system-ui, sans-serif';
      ctx.fillText('Patronos: ' + saints, width / 2, saintsY);
    }

    // Footer branding
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '24px system-ui, sans-serif';
    ctx.fillText('elrugido.com', width / 2, height - 80);

    // Decorative line
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 100, height - 120);
    ctx.lineTo(width / 2 + 100, height - 120);
    ctx.stroke();

    onGenerated(canvas.toDataURL('image/png'));
  }, [title, prayer, saints, onGenerated]);

  return <canvas ref={canvasRef} className="hidden" />;
}

// Canvas component for Post format (1:1)
function PrayerPostImage({ 
  title, 
  prayer, 
  saints,
  onGenerated 
}: { 
  title: string; 
  prayer: string; 
  saints?: string;
  onGenerated: (dataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 1080;
    canvas.width = size;
    canvas.height = size;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.5, '#1e1b4b');
    gradient.addColorStop(1, '#164e63');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Nebula effects
    const nebulaGradient = ctx.createRadialGradient(size * 0.8, size * 0.2, 0, size * 0.8, size * 0.2, 300);
    nebulaGradient.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
    nebulaGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
    ctx.fillStyle = nebulaGradient;
    ctx.fillRect(0, 0, size, size);

    // Stars
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = Math.random() * 1.5 + 0.5;
      const opacity = Math.random() * 0.7 + 0.3;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fill();
    }

    // Logo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FRONTERA FINAL', size / 2, 70);

    // Badge
    const badgeWidth = 420;
    const badgeHeight = 50;
    const badgeX = (size - badgeWidth) / 2;
    const badgeY = 110;

    ctx.fillStyle = 'rgba(34, 211, 238, 0.2)';
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 25);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('🙏 ' + title.toUpperCase(), size / 2, badgeY + 34);

    // Prayer text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = 'italic 26px Georgia, serif';
    
    const maxWidth = size - 100;
    const lineHeight = 38;
    const words = prayer.split(' ');
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

    const totalTextHeight = lines.length * lineHeight;
    const startY = (size - totalTextHeight) / 2 + 40;

    lines.forEach((textLine, index) => {
      ctx.fillText(textLine, size / 2, startY + (index * lineHeight));
    });

    // Saints
    if (saints) {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.9)';
      ctx.font = '20px system-ui, sans-serif';
      ctx.fillText('Patronos: ' + saints, size / 2, size - 100);
    }

    // Footer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillText('elrugido.com', size / 2, size - 50);

    onGenerated(canvas.toDataURL('image/png'));
  }, [title, prayer, saints, onGenerated]);

  return <canvas ref={canvasRef} className="hidden" />;
}

export function PrayerShareModal({ 
  isOpen, 
  onClose, 
  title, 
  prayer, 
  saints 
}: PrayerShareModalProps) {
  const [activeTab, setActiveTab] = useState<'story' | 'post'>('story');
  const [storyImage, setStoryImage] = useState<string>('');
  const [postImage, setPostImage] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const currentImage = activeTab === 'story' ? storyImage : postImage;
  const shareText = `🙏 ${title}\n\n"${prayer.substring(0, 200)}..."\n\n✨ Patronos: ${saints || 'San Isidoro de Sevilla y Beato Carlo Acutis'}\n\n🚀 Descubre más en Frontera Final - elrugido.com`;

  const handleDownload = () => {
    if (!currentImage) return;
    
    const link = document.createElement('a');
    link.download = `oracion-programador-${activeTab}.png`;
    link.href = currentImage;
    link.click();
    toast.success('Imagen descargada');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    toast.success('Texto copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const url = encodeURIComponent('https://elrugido.com/frontera-final');
    
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodedText}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodedText}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodedText}`,
    };

    window.open(urls[platform], '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share && currentImage) {
      try {
        const response = await fetch(currentImage);
        const blob = await response.blob();
        const file = new File([blob], `oracion-programador-${activeTab}.png`, { type: 'image/png' });
        
        await navigator.share({
          title: title,
          text: shareText,
          files: [file],
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Error al compartir');
        }
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-slate-900 border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            Compartir Oración
          </DialogTitle>
        </DialogHeader>

        {/* Hidden canvas components */}
        <PrayerStoryImage 
          title={title} 
          prayer={prayer} 
          saints={saints}
          onGenerated={setStoryImage} 
        />
        <PrayerPostImage 
          title={title} 
          prayer={prayer} 
          saints={saints}
          onGenerated={setPostImage} 
        />

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'story' | 'post')}>
          <TabsList className="grid w-full grid-cols-2 bg-slate-800">
            <TabsTrigger value="story" className="data-[state=active]:bg-cyan-500/20">
              Story (9:16)
            </TabsTrigger>
            <TabsTrigger value="post" className="data-[state=active]:bg-cyan-500/20">
              Post (1:1)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="story" className="mt-4">
            {storyImage && (
              <div className="relative aspect-[9/16] max-h-[400px] mx-auto overflow-hidden rounded-lg border border-cyan-500/30">
                <img 
                  src={storyImage} 
                  alt="Preview Story" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="post" className="mt-4">
            {postImage && (
              <div className="relative aspect-square max-h-[400px] mx-auto overflow-hidden rounded-lg border border-cyan-500/30">
                <img 
                  src={postImage} 
                  alt="Preview Post" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button 
            onClick={handleDownload} 
            className="bg-cyan-500 hover:bg-cyan-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar
          </Button>
          <Button 
            onClick={handleCopy} 
            variant="outline" 
            className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
          >
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copiado' : 'Copiar texto'}
          </Button>
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-4 gap-2 mt-2">
          <Button 
            onClick={() => handleShare('whatsapp')} 
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            WhatsApp
          </Button>
          <Button 
            onClick={() => handleShare('twitter')} 
            size="sm"
            className="bg-slate-700 hover:bg-slate-600"
          >
            X
          </Button>
          <Button 
            onClick={() => handleShare('facebook')} 
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Facebook
          </Button>
          <Button 
            onClick={() => handleShare('email')} 
            size="sm"
            variant="outline"
            className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
          >
            Email
          </Button>
        </div>

        {/* Native share */}
        {typeof navigator !== 'undefined' && navigator.share && (
          <Button 
            onClick={handleNativeShare} 
            className="w-full mt-2 bg-purple-600 hover:bg-purple-700"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartir...
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
