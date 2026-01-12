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
  Loader2,
  Rocket,
  Star,
  Trophy
} from "lucide-react";

interface SpaceShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  rosariosCompletados: number;
  logrosDesbloqueados: number;
  totalLogros: number;
  puntosCósmicos: number;
  articulosLeidos: number;
}

const LOGO_URL = '/logo-elrugido.svg';

// Generate Post (1:1) image with space theme
const SpacePostImage = ({ 
  rosarios,
  logros,
  totalLogros,
  puntos,
  articulos,
  onGenerated 
}: { 
  rosarios: number;
  logros: number;
  totalLogros: number;
  puntos: number;
  articulos: number;
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

      // Create deep space gradient
      const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size);
      gradient.addColorStop(0, '#0a0a1a');
      gradient.addColorStop(0.3, '#0f172a');
      gradient.addColorStop(0.6, '#0c1929');
      gradient.addColorStop(1, '#020617');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // Add nebula effect
      const nebulaGradient = ctx.createRadialGradient(size * 0.7, size * 0.3, 0, size * 0.7, size * 0.3, size * 0.5);
      nebulaGradient.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
      nebulaGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.08)');
      nebulaGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = nebulaGradient;
      ctx.fillRect(0, 0, size, size);

      // Second nebula
      const nebula2 = ctx.createRadialGradient(size * 0.2, size * 0.8, 0, size * 0.2, size * 0.8, size * 0.4);
      nebula2.addColorStop(0, 'rgba(6, 182, 212, 0.12)');
      nebula2.addColorStop(1, 'transparent');
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, size, size);

      // Draw stars
      for (let i = 0; i < 150; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = Math.random() * 2 + 0.5;
        const opacity = Math.random() * 0.8 + 0.2;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
      }

      // Draw a few bright stars with glow
      for (let i = 0; i < 10; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        
        const starGlow = ctx.createRadialGradient(x, y, 0, x, y, 15);
        starGlow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        starGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        starGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = starGlow;
        ctx.fillRect(x - 15, y - 15, 30, 30);
      }

      // Decorative border with glow
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 3;
      ctx.strokeRect(50, 50, size - 100, size - 100);

      // Inner border
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(70, 70, size - 140, size - 140);

      // Draw logo at top
      if (hasLogo) {
        const logoSize = 100;
        const logoX = (size - logoSize) / 2;
        const logoY = 90;
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      }

      // Title "FRONTERA FINAL"
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 56px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FRONTERA FINAL', size / 2, hasLogo ? 250 : 180);

      // Subtitle
      ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
      ctx.font = '28px system-ui, sans-serif';
      ctx.fillText('Mi viaje cósmico', size / 2, hasLogo ? 300 : 230);

      // Stats section
      const statsY = size / 2 - 40;
      const statsSpacing = 180;

      // Rosarios
      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 72px Orbitron, sans-serif';
      ctx.fillText(rosarios.toString(), size / 2 - statsSpacing, statsY);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '22px system-ui, sans-serif';
      ctx.fillText('ROSARIOS', size / 2 - statsSpacing, statsY + 40);
      // Rocket icon placeholder (circle)
      ctx.beginPath();
      ctx.arc(size / 2 - statsSpacing, statsY - 80, 25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.3)';
      ctx.fill();
      ctx.fillStyle = '#06b6d4';
      ctx.font = '30px system-ui';
      ctx.fillText('🚀', size / 2 - statsSpacing, statsY - 70);

      // Logros
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 72px Orbitron, sans-serif';
      ctx.fillText(`${logros}/${totalLogros}`, size / 2, statsY);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '22px system-ui, sans-serif';
      ctx.fillText('LOGROS', size / 2, statsY + 40);
      ctx.beginPath();
      ctx.arc(size / 2, statsY - 80, 25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.font = '30px system-ui';
      ctx.fillText('🏆', size / 2, statsY - 70);

      // Puntos
      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 72px Orbitron, sans-serif';
      ctx.fillText(puntos.toString(), size / 2 + statsSpacing, statsY);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '22px system-ui, sans-serif';
      ctx.fillText('PUNTOS', size / 2 + statsSpacing, statsY + 40);
      ctx.beginPath();
      ctx.arc(size / 2 + statsSpacing, statsY - 80, 25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
      ctx.fill();
      ctx.fillStyle = '#a855f7';
      ctx.font = '30px system-ui';
      ctx.fillText('⭐', size / 2 + statsSpacing, statsY - 70);

      // Articles read
      ctx.fillStyle = '#64748b';
      ctx.font = '24px system-ui, sans-serif';
      ctx.fillText(`${articulos}/7 artículos explorados`, size / 2, statsY + 120);

      // Motivational text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'italic 32px Georgia, serif';
      ctx.fillText('"Donde la Fe conquista el Vacío"', size / 2, size - 180);

      // Branding at bottom
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '26px system-ui, sans-serif';
      ctx.fillText('elrugido.com/frontera-final', size / 2, size - 100);

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png');
      setGeneratedUrl(dataUrl);
      setIsGenerating(false);
      onGenerated?.(dataUrl);
    };

    logoImg.onload = () => compose(true);
    logoImg.onerror = () => compose(false);
    logoImg.src = LOGO_URL;
  }, [rosarios, logros, totalLogros, puntos, articulos, onGenerated]);

  if (isGenerating) {
    return (
      <div className="relative aspect-square max-h-[300px] mx-auto overflow-hidden rounded-lg border border-cyan-500/30 bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <div className="relative aspect-square max-h-[300px] mx-auto overflow-hidden rounded-lg border border-cyan-500/30">
      {generatedUrl ? (
        <img
          src={generatedUrl}
          alt="Post para redes sociales"
          className="w-full h-full object-contain bg-slate-900"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-900">
          <p className="text-gray-400">Error al generar imagen</p>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

// Generate Story (9:16) image with space theme
const SpaceStoryImage = ({ 
  rosarios,
  logros,
  totalLogros,
  puntos,
  articulos,
  onGenerated 
}: { 
  rosarios: number;
  logros: number;
  totalLogros: number;
  puntos: number;
  articulos: number;
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
      const width = 1080;
      const height = 1920;
      canvas.width = width;
      canvas.height = height;

      // Create deep space gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#020617');
      gradient.addColorStop(0.2, '#0f172a');
      gradient.addColorStop(0.5, '#0a0a1a');
      gradient.addColorStop(0.8, '#0f172a');
      gradient.addColorStop(1, '#020617');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Multiple nebula effects
      const nebula1 = ctx.createRadialGradient(width * 0.8, height * 0.2, 0, width * 0.8, height * 0.2, width * 0.6);
      nebula1.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
      nebula1.addColorStop(0.5, 'rgba(59, 130, 246, 0.1)');
      nebula1.addColorStop(1, 'transparent');
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, width, height);

      const nebula2 = ctx.createRadialGradient(width * 0.2, height * 0.7, 0, width * 0.2, height * 0.7, width * 0.5);
      nebula2.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
      nebula2.addColorStop(1, 'transparent');
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, width, height);

      const nebula3 = ctx.createRadialGradient(width * 0.5, height * 0.4, 0, width * 0.5, height * 0.4, width * 0.4);
      nebula3.addColorStop(0, 'rgba(251, 191, 36, 0.08)');
      nebula3.addColorStop(1, 'transparent');
      ctx.fillStyle = nebula3;
      ctx.fillRect(0, 0, width, height);

      // Draw many stars
      for (let i = 0; i < 300; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = Math.random() * 2 + 0.5;
        const opacity = Math.random() * 0.8 + 0.2;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
      }

      // Bright stars with glow
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        
        const starGlow = ctx.createRadialGradient(x, y, 0, x, y, 20);
        starGlow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        starGlow.addColorStop(0.4, 'rgba(255, 255, 255, 0.3)');
        starGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = starGlow;
        ctx.fillRect(x - 20, y - 20, 40, 40);
      }

      // Decorative border
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
      ctx.lineWidth = 4;
      ctx.strokeRect(50, 50, width - 100, height - 100);

      // Draw logo at top
      if (hasLogo) {
        const logoSize = 120;
        const logoX = (width - logoSize) / 2;
        const logoY = 120;
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      }

      // Title "FRONTERA FINAL"
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 72px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FRONTERA', width / 2, hasLogo ? 320 : 250);
      ctx.fillText('FINAL', width / 2, hasLogo ? 400 : 330);

      // Subtitle with glow effect
      ctx.fillStyle = '#06b6d4';
      ctx.font = '36px system-ui, sans-serif';
      ctx.fillText('Mi viaje cósmico', width / 2, hasLogo ? 480 : 410);

      // Decorative line
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 150, hasLogo ? 520 : 450);
      ctx.lineTo(width / 2 + 150, hasLogo ? 520 : 450);
      ctx.stroke();

      // Stats section - larger for story format
      const baseY = height / 2 - 100;
      const statHeight = 180;

      // Rosarios
      let currentY = baseY;
      ctx.beginPath();
      ctx.arc(width / 2 - 200, currentY + 20, 40, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.fill();
      ctx.font = '50px system-ui';
      ctx.fillText('🚀', width / 2 - 200, currentY + 35);
      
      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 100px Orbitron, sans-serif';
      ctx.fillText(rosarios.toString(), width / 2 + 50, currentY + 50);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '28px system-ui, sans-serif';
      ctx.fillText('ROSARIOS INTERESTELARES', width / 2, currentY + 110);

      // Logros
      currentY += statHeight;
      ctx.beginPath();
      ctx.arc(width / 2 - 200, currentY + 20, 40, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
      ctx.fill();
      ctx.font = '50px system-ui';
      ctx.fillText('🏆', width / 2 - 200, currentY + 35);
      
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 100px Orbitron, sans-serif';
      ctx.fillText(`${logros}/${totalLogros}`, width / 2 + 50, currentY + 50);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '28px system-ui, sans-serif';
      ctx.fillText('LOGROS ESPACIALES', width / 2, currentY + 110);

      // Puntos
      currentY += statHeight;
      ctx.beginPath();
      ctx.arc(width / 2 - 200, currentY + 20, 40, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
      ctx.fill();
      ctx.font = '50px system-ui';
      ctx.fillText('⭐', width / 2 - 200, currentY + 35);
      
      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 100px Orbitron, sans-serif';
      ctx.fillText(puntos.toString(), width / 2 + 50, currentY + 50);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '28px system-ui, sans-serif';
      ctx.fillText('PUNTOS CÓSMICOS', width / 2, currentY + 110);

      // Articles progress
      currentY += statHeight;
      ctx.fillStyle = '#64748b';
      ctx.font = '30px system-ui, sans-serif';
      ctx.fillText(`${articulos}/7 artículos explorados`, width / 2, currentY + 30);

      // Progress bar for articles
      const barWidth = 400;
      const barHeight = 12;
      const barX = (width - barWidth) / 2;
      const barY = currentY + 60;
      
      ctx.fillStyle = 'rgba(100, 116, 139, 0.3)';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barWidth, barHeight, 6);
      ctx.fill();
      
      const progressGradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
      progressGradient.addColorStop(0, '#06b6d4');
      progressGradient.addColorStop(1, '#a855f7');
      ctx.fillStyle = progressGradient;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barWidth * (articulos / 7), barHeight, 6);
      ctx.fill();

      // Motivational quote
      ctx.fillStyle = '#ffffff';
      ctx.font = 'italic 40px Georgia, serif';
      ctx.fillText('"Donde la Fe', width / 2, height - 320);
      ctx.fillText('conquista el Vacío"', width / 2, height - 260);

      // Draw small logo at bottom
      if (hasLogo) {
        const bottomLogoSize = 80;
        ctx.drawImage(logoImg, (width - bottomLogoSize) / 2, height - 200, bottomLogoSize, bottomLogoSize);
      }

      // Branding
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '28px system-ui, sans-serif';
      ctx.fillText('elrugido.com/frontera-final', width / 2, height - 100);

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png');
      setGeneratedUrl(dataUrl);
      setIsGenerating(false);
      onGenerated?.(dataUrl);
    };

    logoImg.onload = () => compose(true);
    logoImg.onerror = () => compose(false);
    logoImg.src = LOGO_URL;
  }, [rosarios, logros, totalLogros, puntos, articulos, onGenerated]);

  if (isGenerating) {
    return (
      <div className="relative aspect-[9/16] max-h-[400px] mx-auto overflow-hidden rounded-lg border border-cyan-500/30 bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <div className="relative aspect-[9/16] max-h-[400px] mx-auto overflow-hidden rounded-lg border border-cyan-500/30">
      {generatedUrl ? (
        <img
          src={generatedUrl}
          alt="Story para redes sociales"
          className="w-full h-full object-contain bg-slate-900"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-900">
          <p className="text-gray-400">Error al generar imagen</p>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export function SpaceShareModal({ 
  isOpen, 
  onClose, 
  rosariosCompletados,
  logrosDesbloqueados,
  totalLogros,
  puntosCósmicos,
  articulosLeidos
}: SpaceShareModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'story' | 'post'>('story');
  const [storyDataUrl, setStoryDataUrl] = useState<string | null>(null);
  const [postDataUrl, setPostDataUrl] = useState<string | null>(null);

  const shareText = `🚀 Mi viaje cósmico en Frontera Final:
✨ ${rosariosCompletados} rosarios interestelares
🏆 ${logrosDesbloqueados}/${totalLogros} logros espaciales
⭐ ${puntosCósmicos} puntos cósmicos

¡Explora la Fe en la Frontera Final! 🌌
https://elrugido.com/frontera-final`;

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
      a.download = `frontera-final-${activeTab}-${new Date().toISOString().split('T')[0]}.png`;
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
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      ),
      color: "bg-[#25D366]",
      action: async () => {
        if (isInIframe) {
          await navigator.clipboard.writeText(shareText);
          toast({ title: "Texto copiado", description: "Abre WhatsApp y pega el texto" });
        } else {
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
        }
      },
    },
    {
      name: "X",
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: "bg-black",
      action: async () => {
        if (isInIframe) {
          await navigator.clipboard.writeText(shareText);
          toast({ title: "Texto copiado", description: "Abre X y pega el texto" });
        } else {
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank");
        }
      },
    },
    {
      name: "Facebook",
      icon: <Facebook className="h-5 w-5" />,
      color: "bg-[#1877F2]",
      action: async () => {
        await navigator.clipboard.writeText(shareText);
        toast({ title: "Texto copiado", description: "Pega en tu publicación de Facebook" });
        if (!isInIframe) {
          window.open('https://www.facebook.com', '_blank');
        }
      },
    },
    {
      name: "Copiar",
      icon: <Link2 className="h-5 w-5" />,
      color: "bg-gray-600",
      action: async () => {
        await navigator.clipboard.writeText(shareText);
        toast({ title: "Texto copiado", description: "Listo para pegar donde quieras" });
      },
    },
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi viaje cósmico - Frontera Final',
          text: shareText,
          url: 'https://elrugido.com/frontera-final',
        });
      } catch (err) {
        // User cancelled
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="glass-cyber border-cyan-500/30 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-white text-center flex items-center justify-center gap-2">
            <Rocket className="w-5 h-5 text-cyan-400" />
            Compartir mi Viaje Cósmico
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'story' | 'post')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-800/50">
            <TabsTrigger 
              value="story" 
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              Story (9:16)
            </TabsTrigger>
            <TabsTrigger 
              value="post"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              Post (1:1)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="story" className="mt-0">
            <SpaceStoryImage
              rosarios={rosariosCompletados}
              logros={logrosDesbloqueados}
              totalLogros={totalLogros}
              puntos={puntosCósmicos}
              articulos={articulosLeidos}
              onGenerated={setStoryDataUrl}
            />
          </TabsContent>

          <TabsContent value="post" className="mt-0">
            <SpacePostImage
              rosarios={rosariosCompletados}
              logros={logrosDesbloqueados}
              totalLogros={totalLogros}
              puntos={puntosCósmicos}
              articulos={articulosLeidos}
              onGenerated={setPostDataUrl}
            />
          </TabsContent>
        </Tabs>

        {/* Download button */}
        <Button
          onClick={handleDownload}
          disabled={activeTab === 'story' ? !storyDataUrl : !postDataUrl}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
        >
          <Download className="w-4 h-4 mr-2" />
          Descargar Imagen
        </Button>

        {/* Native share button */}
        {typeof navigator !== 'undefined' && navigator.share && (
          <Button
            onClick={handleNativeShare}
            variant="outline"
            className="w-full border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartir
          </Button>
        )}

        {/* Social share buttons */}
        <div className="grid grid-cols-4 gap-2">
          {shareOptions.map((option) => (
            <Button
              key={option.name}
              onClick={option.action}
              className={`${option.color} hover:opacity-90 text-white`}
              size="sm"
            >
              {option.icon}
            </Button>
          ))}
        </div>

        <p className="text-xs text-gray-500 text-center">
          Descarga la imagen y compártela en tus historias de Instagram o redes favoritas
        </p>
      </DialogContent>
    </Dialog>
  );
}
