import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Share2, 
  Copy, 
  Check,
  Sparkles,
  MessageCircle,
  Facebook,
  Twitter,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import logoElRugido from '@/assets/logo-elrugido.svg';

interface FactShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  fact: string;
}

// Generate Post Image (1:1)
const FactPostImage = ({ 
  fact,
  onGenerated 
}: { 
  fact: string;
  onGenerated: (dataUrl: string) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    // Space gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.5, '#1e1b4b');
    gradient.addColorStop(1, '#164e63');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add stars
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2 + 0.5;
      const opacity = Math.random() * 0.8 + 0.2;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fill();
    }

    // Add subtle nebula effect
    const nebulaGradient = ctx.createRadialGradient(
      width * 0.3, height * 0.3, 0,
      width * 0.3, height * 0.3, width * 0.5
    );
    nebulaGradient.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
    nebulaGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
    ctx.fillStyle = nebulaGradient;
    ctx.fillRect(0, 0, width, height);

    // Load and draw logo
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.onload = () => {
      // Draw logo at top center
      const logoSize = 80;
      ctx.drawImage(logo, (width - logoSize) / 2, 60, logoSize, logoSize);

      // "FRONTERA FINAL" title
      ctx.font = 'bold 42px "Orbitron", "Arial Black", sans-serif';
      ctx.fillStyle = '#22d3ee';
      ctx.textAlign = 'center';
      ctx.fillText('FRONTERA FINAL', width / 2, 190);

      // Badge "Dato del Día"
      const badgeY = 260;
      const badgeWidth = 200;
      const badgeHeight = 40;
      const badgeX = (width - badgeWidth) / 2;
      
      ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 20);
      ctx.fill();
      ctx.stroke();
      
      ctx.font = 'bold 18px Arial, sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('✨ DATO DEL DÍA', width / 2, badgeY + 27);

      // Fact text - with word wrapping
      ctx.font = '32px Arial, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      
      const maxWidth = width - 140;
      const lineHeight = 48;
      const words = fact.split(' ');
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
      
      const startY = (height / 2) - ((lines.length - 1) * lineHeight / 2) + 40;
      lines.forEach((l, i) => {
        ctx.fillText(l, width / 2, startY + i * lineHeight);
      });

      // Decorative line
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width * 0.2, height - 180);
      ctx.lineTo(width * 0.8, height - 180);
      ctx.stroke();

      // Branding
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText('elrugido.com/frontera-final', width / 2, height - 100);

      setIsGenerating(false);
      onGenerated(canvas.toDataURL('image/png'));
    };
    logo.src = logoElRugido;
  }, [fact, onGenerated]);

  return (
    <div className="relative">
      <canvas 
        ref={canvasRef} 
        className="w-full max-w-[300px] mx-auto rounded-lg shadow-lg"
        style={{ aspectRatio: '1/1' }}
      />
      {isGenerating && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
};

// Generate Story Image (9:16)
const FactStoryImage = ({ 
  fact,
  onGenerated 
}: { 
  fact: string;
  onGenerated: (dataUrl: string) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    // Space gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.3, '#1e1b4b');
    gradient.addColorStop(0.7, '#164e63');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add stars
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2.5 + 0.5;
      const opacity = Math.random() * 0.8 + 0.2;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fill();
    }

    // Add nebula effects
    const nebulaGradient1 = ctx.createRadialGradient(
      width * 0.7, height * 0.2, 0,
      width * 0.7, height * 0.2, width * 0.6
    );
    nebulaGradient1.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
    nebulaGradient1.addColorStop(1, 'rgba(139, 92, 246, 0)');
    ctx.fillStyle = nebulaGradient1;
    ctx.fillRect(0, 0, width, height);

    const nebulaGradient2 = ctx.createRadialGradient(
      width * 0.2, height * 0.7, 0,
      width * 0.2, height * 0.7, width * 0.5
    );
    nebulaGradient2.addColorStop(0, 'rgba(34, 211, 238, 0.15)');
    nebulaGradient2.addColorStop(1, 'rgba(34, 211, 238, 0)');
    ctx.fillStyle = nebulaGradient2;
    ctx.fillRect(0, 0, width, height);

    // Load and draw logo
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.onload = () => {
      // Draw logo at top center
      const logoSize = 120;
      ctx.drawImage(logo, (width - logoSize) / 2, 120, logoSize, logoSize);

      // "FRONTERA FINAL" title
      ctx.font = 'bold 56px "Orbitron", "Arial Black", sans-serif';
      ctx.fillStyle = '#22d3ee';
      ctx.textAlign = 'center';
      ctx.fillText('FRONTERA FINAL', width / 2, 320);

      // Subtitle
      ctx.font = '28px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText('Donde la Fe conquista el Vacío', width / 2, 380);

      // Badge "Dato del Día"
      const badgeY = height / 2 - 200;
      const badgeWidth = 280;
      const badgeHeight = 56;
      const badgeX = (width - badgeWidth) / 2;
      
      ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 28);
      ctx.fill();
      ctx.stroke();
      
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('✨ DATO DEL DÍA', width / 2, badgeY + 38);

      // Fact text - with word wrapping
      ctx.font = '44px Arial, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      
      const maxWidth = width - 160;
      const lineHeight = 64;
      const words = fact.split(' ');
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
      
      const startY = height / 2 - 40;
      lines.forEach((l, i) => {
        ctx.fillText(l, width / 2, startY + i * lineHeight);
      });

      // Decorative orbital rings
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(width / 2, height - 400, 300, 80, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Branding section
      ctx.font = 'bold 32px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('elrugido.com/frontera-final', width / 2, height - 150);

      ctx.font = '24px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillText('Fe · Ciencia · Cosmos', width / 2, height - 100);

      setIsGenerating(false);
      onGenerated(canvas.toDataURL('image/png'));
    };
    logo.src = logoElRugido;
  }, [fact, onGenerated]);

  return (
    <div className="relative">
      <canvas 
        ref={canvasRef} 
        className="w-full max-w-[180px] mx-auto rounded-lg shadow-lg"
        style={{ aspectRatio: '9/16' }}
      />
      {isGenerating && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
};

export const FactShareModal = ({ isOpen, onClose, fact }: FactShareModalProps) => {
  const [activeTab, setActiveTab] = useState<'story' | 'post'>('story');
  const [storyDataUrl, setStoryDataUrl] = useState<string | null>(null);
  const [postDataUrl, setPostDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const shareText = `✨ ${fact}\n\n🚀 Descubre más en Frontera Final - Donde la Fe conquista el Vacío\n\n👉 elrugido.com/frontera-final`;
  const shareUrl = 'https://elrugido.com/frontera-final';

  const handleDownload = () => {
    const dataUrl = activeTab === 'story' ? storyDataUrl : postDataUrl;
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `frontera-final-dato-${activeTab}.png`;
    link.href = dataUrl;
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
    const encodedUrl = encodeURIComponent(shareUrl);
    
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodedText}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      email: `mailto:?subject=${encodeURIComponent('Dato del Día - Frontera Final')}&body=${encodedText}`,
    };

    window.open(urls[platform], '_blank');
  };

  const handleNativeShare = async () => {
    const dataUrl = activeTab === 'story' ? storyDataUrl : postDataUrl;
    
    if (navigator.share) {
      try {
        if (dataUrl) {
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const file = new File([blob], `frontera-final-dato.png`, { type: 'image/png' });
          
          await navigator.share({
            title: 'Dato del Día - Frontera Final',
            text: shareText,
            files: [file],
          });
        } else {
          await navigator.share({
            title: 'Dato del Día - Frontera Final',
            text: shareText,
            url: shareUrl,
          });
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Error al compartir');
        }
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-cyan-500/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2 font-orbitron text-cyan-400">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Compartir Dato del Día
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'story' | 'post')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800">
            <TabsTrigger value="story" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              Story (9:16)
            </TabsTrigger>
            <TabsTrigger value="post" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              Post (1:1)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="story" className="mt-4">
            <FactStoryImage fact={fact} onGenerated={setStoryDataUrl} />
          </TabsContent>

          <TabsContent value="post" className="mt-4">
            <FactPostImage fact={fact} onGenerated={setPostDataUrl} />
          </TabsContent>
        </Tabs>

        {/* Download button */}
        <Button 
          onClick={handleDownload} 
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
          disabled={activeTab === 'story' ? !storyDataUrl : !postDataUrl}
        >
          <Download className="w-4 h-4 mr-2" />
          Descargar Imagen
        </Button>

        {/* Share buttons */}
        <div className="grid grid-cols-5 gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleShare('whatsapp')}
            className="border-green-500/50 hover:bg-green-500/20 text-green-400"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleShare('twitter')}
            className="border-sky-500/50 hover:bg-sky-500/20 text-sky-400"
          >
            <Twitter className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleShare('facebook')}
            className="border-blue-500/50 hover:bg-blue-500/20 text-blue-400"
          >
            <Facebook className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="border-slate-500/50 hover:bg-slate-500/20 text-slate-400"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleShare('email')}
            className="border-amber-500/50 hover:bg-amber-500/20 text-amber-400"
          >
            <Mail className="w-4 h-4" />
          </Button>
        </div>

        {/* Native share button */}
        {'share' in navigator && (
          <Button 
            onClick={handleNativeShare}
            variant="outline"
            className="w-full border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartir
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};
