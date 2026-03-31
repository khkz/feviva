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
import { ShareImageType } from "@/hooks/useDailyShareImages";
import { useDailyContent } from "@/hooks/useDailyContent";
import { useDailyGospel } from "@/hooks/useDailyGospel";
import { useSaintOfDay } from "@/hooks/useSaintOfDay";
import { toast } from "sonner";
import logoElRugido from '@/assets/logo-elrugido.png';

interface DailyShareButtonProps {
  tipo: ShareImageType;
  title?: string;
  fallbackText?: string;
  directContent?: {
    mainText: string;
    reference?: string;
    subtitle?: string;
  };
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

interface ContentData {
  mainText: string;
  reference?: string;
  subtitle?: string;
}

// Helper to calculate dynamic font size based on text length
const calculateFontSize = (
  textLength: number,
  format: 'post' | 'story'
): { fontSize: number; lineHeight: number } => {
  if (format === 'post') {
    // Para formato 1:1 (1080x1080)
    if (textLength < 80) {
      return { fontSize: 42, lineHeight: 58 }; // Texto muy corto - grande
    } else if (textLength < 150) {
      return { fontSize: 34, lineHeight: 48 }; // Texto corto
    } else if (textLength < 250) {
      return { fontSize: 28, lineHeight: 40 }; // Texto medio
    } else {
      return { fontSize: 22, lineHeight: 32 }; // Texto largo - pequeño
    }
  } else {
    // Para formato 9:16 (1080x1920)
    if (textLength < 80) {
      return { fontSize: 52, lineHeight: 72 }; // Texto muy corto - grande
    } else if (textLength < 150) {
      return { fontSize: 44, lineHeight: 62 }; // Texto corto
    } else if (textLength < 300) {
      return { fontSize: 36, lineHeight: 54 }; // Texto medio
    } else {
      return { fontSize: 28, lineHeight: 42 }; // Texto largo - pequeño
    }
  }
};

// Helper to wrap text into lines
const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  
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
  return lines;
};

// Canvas component for generating Post (1:1) images
const DailyPostImage = ({
  tipo,
  content,
  onGenerated,
}: {
  tipo: ShareImageType;
  content: ContentData;
  onGenerated: (dataUrl: string) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const hasGenerated = useRef(false);

  useEffect(() => {
    // Prevent regenerating if already generated
    if (hasGenerated.current) return;
    const canvas = canvasRef.current;
    if (!canvas || !content.mainText) return;
    
    hasGenerated.current = true;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 1080;
    canvas.width = size;
    canvas.height = size;

    // Load logo
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.onload = () => {
      // Background gradient based on type
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      if (tipo === 'versiculo') {
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#2d1b4e');
        gradient.addColorStop(1, '#1a2e3b');
      } else if (tipo === 'evangelio') {
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#2e2a1a');
        gradient.addColorStop(1, '#1a1a2e');
      } else if (tipo === 'reflexion') {
        gradient.addColorStop(0, '#1e1b2e');
        gradient.addColorStop(0.5, '#2e1b2a');
        gradient.addColorStop(1, '#1a2e2e');
      } else {
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f0f1a');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // Add stars
      for (let i = 0; i < 60; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = Math.random() * 1.5 + 0.5;
        const opacity = Math.random() * 0.6 + 0.2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
      }

      // Subtle nebula effect
      const nebulaGradient = ctx.createRadialGradient(
        size * 0.7, size * 0.3, 0,
        size * 0.7, size * 0.3, size * 0.5
      );
      nebulaGradient.addColorStop(0, 'rgba(139, 92, 246, 0.1)');
      nebulaGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = nebulaGradient;
      ctx.fillRect(0, 0, size, size);

      // Draw logo at top center
      const logoSize = 80;
      ctx.drawImage(logo, (size - logoSize) / 2, 50, logoSize, logoSize);

      // Brand name
      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 36px Montserrat, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ElRugido', size / 2, 160);

      // Type badge
      const badgeLabels: Record<ShareImageType, string> = {
        versiculo: '📖 VERSÍCULO DEL DÍA',
        evangelio: '✝️ EVANGELIO DEL DÍA',
        reflexion: '💭 REFLEXIÓN DEL DÍA',
        santo: '🙏 SANTO DEL DÍA',
      };

      const badgeLabel = badgeLabels[tipo];
      const badgeWidth = 340;
      const badgeHeight = 44;
      const badgeX = (size - badgeWidth) / 2;
      const badgeY = 190;

      ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 22);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.fillText(badgeLabel, size / 2, badgeY + 30);

      // Main content text - dynamic font size based on text length
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      const { fontSize, lineHeight } = calculateFontSize(content.mainText.length, 'post');
      ctx.font = tipo === 'versiculo' 
        ? `italic ${fontSize}px Nunito, sans-serif` 
        : `${fontSize - 2}px Nunito, sans-serif`;
      ctx.textAlign = 'center';

      const maxWidth = size - 120;
      
      // Limit text length to fit in canvas
      const displayText = content.mainText.length > 400 
        ? content.mainText.substring(0, 400) + '...'
        : content.mainText;
      
      const lines = wrapText(ctx, displayText, maxWidth);
      
      // Calculate vertical position to center the text block
      const totalTextHeight = lines.length * lineHeight;
      const availableSpace = size - 280 - 180; // Space between badge and footer
      const startY = 280 + (availableSpace - totalTextHeight) / 2;

      lines.slice(0, 12).forEach((textLine, index) => {
        ctx.fillText(textLine, size / 2, startY + index * lineHeight);
      });

      // Reference (if available)
      if (content.reference) {
        ctx.fillStyle = '#D4AF37';
        ctx.font = 'bold 22px Montserrat, sans-serif';
        ctx.fillText(`— ${content.reference}`, size / 2, size - 140);
      }

      // Decorative line
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(size * 0.3, size - 100);
      ctx.lineTo(size * 0.7, size - 100);
      ctx.stroke();

      // Draw small logo at bottom
      const bottomLogoSize = 40;
      ctx.drawImage(logo, (size - bottomLogoSize) / 2, size - 85, bottomLogoSize, bottomLogoSize);

      // Footer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '18px Arial, sans-serif';
      ctx.fillText('elrugido.com', size / 2, size - 30);

      setIsGenerating(false);
      const dataUrl = canvas.toDataURL('image/png');
      setImageDataUrl(dataUrl);
      onGenerated(dataUrl);
    };

    logo.onerror = () => {
      hasGenerated.current = false;
      setIsGenerating(false);
      console.error('Failed to load logo');
    };

    logo.src = logoElRugido;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, content.mainText, content.reference]);

  return (
    <div className="relative">
      {imageDataUrl ? (
        <img 
          src={imageDataUrl} 
          alt="Preview" 
          className="w-full max-w-[300px] mx-auto rounded-lg shadow-lg"
        />
      ) : (
        <>
          <canvas
            ref={canvasRef}
            className="w-full max-w-[300px] mx-auto rounded-lg shadow-lg"
            style={{ aspectRatio: '1/1' }}
          />
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </>
      )}
    </div>
  );
};
// Canvas component for generating Story (9:16) images
const DailyStoryImage = ({
  tipo,
  content,
  onGenerated,
}: {
  tipo: ShareImageType;
  content: ContentData;
  onGenerated: (dataUrl: string) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const hasGenerated = useRef(false);

  useEffect(() => {
    // Prevent regenerating if already generated
    if (hasGenerated.current) return;

    const canvas = canvasRef.current;
    if (!canvas || !content.mainText) return;

    hasGenerated.current = true;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    // Load logo
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.onload = () => {
      // Background gradient based on type
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      if (tipo === 'versiculo') {
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.3, '#2d1b4e');
        gradient.addColorStop(0.7, '#1a2e3b');
        gradient.addColorStop(1, '#0f0f1a');
      } else if (tipo === 'evangelio') {
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.3, '#2e2a1a');
        gradient.addColorStop(0.7, '#1a1a2e');
        gradient.addColorStop(1, '#0f0f1a');
      } else if (tipo === 'reflexion') {
        gradient.addColorStop(0, '#1e1b2e');
        gradient.addColorStop(0.3, '#2e1b2a');
        gradient.addColorStop(0.7, '#1a2e2e');
        gradient.addColorStop(1, '#0f0f1a');
      } else {
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.3, '#16213e');
        gradient.addColorStop(0.5, '#1a1a2e');
        gradient.addColorStop(0.7, '#16213e');
        gradient.addColorStop(1, '#0f0f1a');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add stars
      for (let i = 0; i < 120; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = Math.random() * 2 + 0.5;
        const opacity = Math.random() * 0.7 + 0.2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
      }

      // Nebula effects
      const nebulaGradient1 = ctx.createRadialGradient(
        width * 0.2, height * 0.3, 0,
        width * 0.2, height * 0.3, width * 0.6
      );
      nebulaGradient1.addColorStop(0, 'rgba(139, 92, 246, 0.12)');
      nebulaGradient1.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = nebulaGradient1;
      ctx.fillRect(0, 0, width, height);

      const nebulaGradient2 = ctx.createRadialGradient(
        width * 0.8, height * 0.7, 0,
        width * 0.8, height * 0.7, width * 0.5
      );
      nebulaGradient2.addColorStop(0, 'rgba(212, 175, 55, 0.08)');
      nebulaGradient2.addColorStop(1, 'rgba(212, 175, 55, 0)');
      ctx.fillStyle = nebulaGradient2;
      ctx.fillRect(0, 0, width, height);

      // Draw logo at top center
      const logoSize = 120;
      ctx.drawImage(logo, (width - logoSize) / 2, 80, logoSize, logoSize);

      // Brand name
      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 52px Montserrat, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ElRugido', width / 2, 250);

      // Tagline
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '28px Montserrat, sans-serif';
      ctx.fillText('elrugido.com', width / 2, 300);

      // Decorative line
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 100, 340);
      ctx.lineTo(width / 2 + 100, 340);
      ctx.stroke();

      // Type badge
      const badgeLabels: Record<ShareImageType, string> = {
        versiculo: '📖 VERSÍCULO DEL DÍA',
        evangelio: '✝️ EVANGELIO DEL DÍA',
        reflexion: '💭 REFLEXIÓN DEL DÍA',
        santo: '🙏 SANTO DEL DÍA',
      };

      const badgeLabel = badgeLabels[tipo];
      const badgeWidth = 420;
      const badgeHeight = 56;
      const badgeX = (width - badgeWidth) / 2;
      const badgeY = 420;

      ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 28);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 26px Arial, sans-serif';
      ctx.fillText(badgeLabel, width / 2, badgeY + 38);

      // Main content text - dynamic font size based on text length
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      const { fontSize, lineHeight } = calculateFontSize(content.mainText.length, 'story');
      ctx.font = tipo === 'versiculo' 
        ? `italic ${fontSize}px Nunito, sans-serif` 
        : `${fontSize - 2}px Nunito, sans-serif`;
      ctx.textAlign = 'center';

      const maxWidth = width - 140;
      
      // Limit text length to fit in canvas
      const displayText = content.mainText.length > 500 
        ? content.mainText.substring(0, 500) + '...'
        : content.mainText;
      
      const lines = wrapText(ctx, displayText, maxWidth);

      // Calculate vertical position (center in available space)
      const startY = 580;
      const maxLines = Math.min(lines.length, 15);

      lines.slice(0, maxLines).forEach((textLine, index) => {
        ctx.fillText(textLine, width / 2, startY + index * lineHeight);
      });

      // Reference (if available)
      if (content.reference) {
        const refY = startY + maxLines * lineHeight + 40;
        ctx.fillStyle = '#D4AF37';
        ctx.font = 'bold 28px Montserrat, sans-serif';
        ctx.fillText(`— ${content.reference}`, width / 2, Math.min(refY, height - 280));
      }

      // Bottom decorative line
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width * 0.2, height - 200);
      ctx.lineTo(width * 0.8, height - 200);
      ctx.stroke();

      // Draw logo at bottom
      const bottomLogoSize = 70;
      ctx.drawImage(logo, (width - bottomLogoSize) / 2, height - 170, bottomLogoSize, bottomLogoSize);

      // Footer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '24px Arial, sans-serif';
      ctx.fillText('elrugido.com', width / 2, height - 60);

      setIsGenerating(false);
      const dataUrl = canvas.toDataURL('image/png');
      setImageDataUrl(dataUrl);
      onGenerated(dataUrl);
    };

    logo.onerror = () => {
      hasGenerated.current = false;
      setIsGenerating(false);
      console.error('Failed to load logo');
    };

    logo.src = logoElRugido;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, content.mainText, content.reference]);

  return (
    <div className="relative">
      {imageDataUrl ? (
        <img 
          src={imageDataUrl} 
          alt="Preview" 
          className="w-full max-w-[180px] mx-auto rounded-lg shadow-lg"
        />
      ) : (
        <>
          <canvas
            ref={canvasRef}
            className="w-full max-w-[180px] mx-auto rounded-lg shadow-lg"
            style={{ aspectRatio: '9/16' }}
          />
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Compose Story for Santo (from saint image)
const ComposedSantoStoryImage = ({
  saintName,
  saintImageUrl,
  onGenerated,
}: {
  saintName: string;
  saintImageUrl?: string;
  onGenerated: (dataUrl: string) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const hasGenerated = useRef(false);

  useEffect(() => {
    // Prevent regenerating if already generated
    if (hasGenerated.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    hasGenerated.current = true;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    const logo = new Image();
    logo.crossOrigin = 'anonymous';

    const saintImg = saintImageUrl ? new Image() : null;
    if (saintImg) {
      saintImg.crossOrigin = 'anonymous';
    }

    let logoLoaded = false;
    let saintLoaded = !saintImageUrl; // true if no image to load

    const drawCanvas = () => {
      if (!logoLoaded || !saintLoaded) return;

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(0.3, '#16213e');
      gradient.addColorStop(0.5, '#1a1a2e');
      gradient.addColorStop(0.7, '#16213e');
      gradient.addColorStop(1, '#0f0f1a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Stars
      for (let i = 0; i < 80; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 2 + 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.6 + 0.2})`;
        ctx.fill();
      }

      // Draw logo at top
      const logoSize = 120;
      ctx.drawImage(logo, (width - logoSize) / 2, 60, logoSize, logoSize);

      // Brand text
      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 48px Montserrat, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ElRugido', width / 2, 230);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '28px Montserrat, sans-serif';
      ctx.fillText('elrugido.com', width / 2, 280);

      // Decorative line
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 100, 310);
      ctx.lineTo(width / 2 + 100, 310);
      ctx.stroke();

      // Draw saint image if available
      if (saintImg && saintImageUrl) {
        const imgSize = width - 80;
        const imgY = 400;
        
        // Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 10;
        ctx.drawImage(saintImg, 40, imgY, imgSize, imgSize);
        ctx.shadowColor = 'transparent';
      }

      // Badge
      const badgeY = saintImageUrl ? 1500 : 500;
      const badgeWidth = 420;
      const badgeHeight = 56;
      const badgeX = (width - badgeWidth) / 2;

      ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 28);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 26px Arial, sans-serif';
      ctx.fillText('🙏 SANTO DEL DÍA', width / 2, badgeY + 38);

      // Saint name
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = 'bold 42px Montserrat, sans-serif';
      ctx.fillText(saintName, width / 2, badgeY + 100);

      // Bottom logo
      const bottomLogoSize = 70;
      ctx.drawImage(logo, (width - bottomLogoSize) / 2, height - 140, bottomLogoSize, bottomLogoSize);

      // Footer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '24px Arial, sans-serif';
      ctx.fillText('elrugido.com', width / 2, height - 50);

      setIsGenerating(false);
      const dataUrl = canvas.toDataURL('image/png');
      setImageDataUrl(dataUrl);
      onGenerated(dataUrl);
    };

    logo.onload = () => {
      logoLoaded = true;
      drawCanvas();
    };

    logo.onerror = () => {
      hasGenerated.current = false;
      setIsGenerating(false);
      console.error('Failed to load logo');
    };

    if (saintImg) {
      saintImg.onload = () => {
        saintLoaded = true;
        drawCanvas();
      };
      saintImg.onerror = () => {
        saintLoaded = true;
        drawCanvas();
      };
      saintImg.src = saintImageUrl!;
    }

    logo.src = logoElRugido;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saintName, saintImageUrl]);

  return (
    <div className="relative">
      {imageDataUrl ? (
        <img 
          src={imageDataUrl} 
          alt="Preview" 
          className="w-full max-w-[180px] mx-auto rounded-lg shadow-lg"
        />
      ) : (
        <>
          <canvas
            ref={canvasRef}
            className="w-full max-w-[180px] mx-auto rounded-lg shadow-lg"
            style={{ aspectRatio: '9/16' }}
          />
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const DailyShareButton = ({
  tipo,
  title = "Compartir",
  fallbackText,
  directContent,
  className,
  variant = "outline",
  size = "default",
}: DailyShareButtonProps) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'story' | 'post'>('story');
  const [storyDataUrl, setStoryDataUrl] = useState<string | null>(null);
  const [postDataUrl, setPostDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch content based on type
  const { content: dailyContent, loading: isLoadingContent } = useDailyContent();
  const { gospel, isLoading: isLoadingGospel } = useDailyGospel();
  const { saint, loading: isLoadingSaint } = useSaintOfDay();

  // Determine loading state and content
  const isLoading = tipo === 'versiculo' || tipo === 'reflexion' 
    ? isLoadingContent 
    : tipo === 'evangelio' 
      ? isLoadingGospel 
      : isLoadingSaint;

  // Build content data based on type
  const getContentData = (): ContentData | null => {
    // If directContent is provided, use it first
    if (directContent) {
      return directContent;
    }
    
    if (tipo === 'versiculo' && dailyContent) {
      return {
        mainText: dailyContent.versiculo_texto,
        reference: dailyContent.versiculo_referencia,
      };
    }
    if (tipo === 'reflexion' && dailyContent) {
      return {
        mainText: dailyContent.reflexion_ia,
      };
    }
    if (tipo === 'evangelio' && gospel) {
      return {
        mainText: gospel.titulo || 'Evangelio del día',
        reference: gospel.referencia,
        subtitle: gospel.tiempo_liturgico || undefined,
      };
    }
    if (tipo === 'santo' && saint) {
      return {
        mainText: saint.name,
        subtitle: saint.description || undefined,
      };
    }
    return null;
  };

  const contentData = getContentData();
  const hasContent = !!contentData;

  const currentImageUrl = activeTab === 'story' ? storyDataUrl : postDataUrl;

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
    const text = fallbackText || `¡Mira el contenido de hoy en ElRugido! https://elrugido.com`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText('https://elrugido.com');
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
        const response = await fetch(currentImageUrl);
        const blob = await response.blob();
        const file = new File([blob], `elrugido-${tipo}.png`, { type: 'image/png' });

        await navigator.share({
          title: title,
          text: fallbackText || `Contenido de ElRugido`,
          files: [file],
        });
      } catch (error) {
        try {
          await navigator.share({
            title: title,
            text: fallbackText || `Contenido de ElRugido`,
            url: 'https://elrugido.com',
          });
        } catch (e) {
          // User cancelled
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
        ) : hasContent && contentData ? (
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'story' | 'post')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="story">Story (9:16)</TabsTrigger>
                <TabsTrigger value="post">Post (1:1)</TabsTrigger>
              </TabsList>

              <TabsContent value="story" className="mt-4">
                {tipo === 'santo' && saint ? (
                  <ComposedSantoStoryImage
                    saintName={saint.name}
                    saintImageUrl={saint.image_url || undefined}
                    onGenerated={setStoryDataUrl}
                  />
                ) : (
                  <DailyStoryImage
                    tipo={tipo}
                    content={contentData}
                    onGenerated={setStoryDataUrl}
                  />
                )}
              </TabsContent>

              <TabsContent value="post" className="mt-4">
                <DailyPostImage
                  tipo={tipo}
                  content={contentData}
                  onGenerated={setPostDataUrl}
                />
              </TabsContent>
            </Tabs>

            <div className="flex flex-wrap gap-2 justify-center pt-2">
              <Button onClick={handleDownload} variant="outline" size="sm" disabled={!currentImageUrl}>
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
                <Button onClick={handleNativeShare} variant="default" size="sm" disabled={!currentImageUrl}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>El contenido de hoy aún no está disponible.</p>
            <p className="text-sm mt-2">Se genera automáticamente cada día.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
