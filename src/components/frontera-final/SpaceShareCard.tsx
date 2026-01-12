import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Download, Twitter, Facebook, Copy, Check, Rocket, Star, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface SpaceShareCardProps {
  rosariosCompletados: number;
  logrosDesbloqueados: number;
  totalLogros: number;
  puntosCósmicos: number;
}

export function SpaceShareCard({ 
  rosariosCompletados, 
  logrosDesbloqueados, 
  totalLogros,
  puntosCósmicos 
}: SpaceShareCardProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `🚀 Mi viaje cósmico en El Rugido:
✨ ${rosariosCompletados} rosarios interestelares
🏆 ${logrosDesbloqueados}/${totalLogros} logros espaciales
⭐ ${puntosCósmicos} puntos cósmicos

¡Explora la Fe en la Frontera Final! 🌌`;

  const shareUrl = 'https://elrugido.com/frontera-final';

  const handleCopyText = () => {
    navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
    setCopied(true);
    toast.success('¡Texto copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi viaje cósmico en El Rugido',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Compartir mi Viaje Cósmico
        </Button>
      </DialogTrigger>

      <DialogContent className="glass-cyber border-amber-400/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-white text-center">
            Compartir tu Viaje
          </DialogTitle>
        </DialogHeader>

        {/* Preview Card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-cyan-400/30 p-6 my-4">
          {/* Stars background */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-0.5 h-0.5 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Rocket className="w-6 h-6 text-cyan-400" />
              <span className="font-orbitron text-lg font-bold text-white">
                Frontera Final
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center mb-1">
                  <Star className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="text-2xl font-orbitron font-bold text-white">
                  {rosariosCompletados}
                </div>
                <div className="text-[10px] text-gray-400 uppercase">
                  Rosarios
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center mb-1">
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-2xl font-orbitron font-bold text-white">
                  {logrosDesbloqueados}/{totalLogros}
                </div>
                <div className="text-[10px] text-gray-400 uppercase">
                  Logros
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center mb-1">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    <Star className="w-5 h-5 text-purple-400" />
                  </motion.div>
                </div>
                <div className="text-2xl font-orbitron font-bold text-white">
                  {puntosCósmicos}
                </div>
                <div className="text-[10px] text-gray-400 uppercase">
                  Puntos
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-gray-300 text-xs">
                elrugido.com/frontera-final
              </p>
            </div>
          </div>
        </div>

        {/* Share buttons */}
        <div className="space-y-3">
          {navigator.share && (
            <Button
              onClick={handleNativeShare}
              className="w-full bg-gradient-to-r from-cyan-500 to-amber-500"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </Button>
          )}

          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={handleShareTwitter}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Twitter className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              onClick={handleShareFacebook}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Facebook className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              onClick={handleCopyText}
              className="border-white/20 text-white hover:bg-white/10"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}