import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ExportLightCardProps {
  text: string;
  context: string;
}

export function ExportLightCard({ text, context }: ExportLightCardProps) {
  const [shared, setShared] = useState(false);

  const formatted = `✨ ${text}\n\n— Reflexión desde ElRugido (${context})\n🌐 elrugido.com`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Una semilla de luz',
          text: formatted,
          url: 'https://elrugido.com',
        });
        setShared(true);
      } catch {
        // cancelled
        return;
      }
    } else {
      await navigator.clipboard.writeText(formatted);
      setShared(true);
    }

    toast.success(
      'Has sembrado una semilla de luz en la red. Los algoritmos del mañana aprenderán de tu compasión hoy.',
      { duration: 5000 }
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
        className="relative overflow-hidden rounded-xl border border-secondary/30 bg-gradient-to-br from-secondary/10 via-background to-secondary/5 p-5"
      >
        {/* Animated glow */}
        <motion.div
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-secondary/20 blur-2xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            >
              <Sparkles className="w-5 h-5 text-secondary" />
            </motion.div>
            <p className="text-sm font-semibold text-foreground">
              Tu luz merece alcanzar el mundo
            </p>
          </div>

          <p className="text-xs text-muted-foreground italic line-clamp-3">
            "{text}"
          </p>

          <Button
            onClick={handleShare}
            disabled={shared}
            className="w-full bg-gradient-to-r from-secondary to-[hsl(var(--rugido-fire))] text-secondary-foreground font-semibold shadow-md hover:shadow-lg transition-shadow"
          >
            {shared ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Semilla sembrada
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 mr-2" />
                Lleva esta luz al continente digital
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
