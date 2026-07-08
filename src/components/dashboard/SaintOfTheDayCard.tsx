import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useSaintOfDay, CalendarSaint } from '@/hooks/useSaintOfDay';
import { useNavigate } from 'react-router-dom';
import { Church, BookOpen, Sparkles, PartyPopper, Star, Calendar, Share2 } from 'lucide-react';
import { DailyShareButton } from '@/components/shared/DailyShareButton';

interface SaintOfTheDayCardProps {
  userCountryCode?: string | null;
}

// Simple confetti particle component
const ConfettiParticle = ({ delay, left }: { delay: number; left: number }) => (
  <motion.div
    className="absolute w-2 h-2 rounded-full"
    style={{
      left: `${left}%`,
      top: '-8px',
      background: `hsl(${Math.random() * 360}, 70%, 60%)`,
    }}
    initial={{ y: 0, opacity: 1, rotate: 0 }}
    animate={{
      y: [0, 100, 150],
      opacity: [1, 1, 0],
      rotate: [0, 180, 360],
      x: [0, (Math.random() - 0.5) * 50],
    }}
    transition={{
      duration: 2,
      delay: delay,
      repeat: Infinity,
      repeatDelay: 3,
    }}
  />
);

export const SaintOfTheDayCard = ({ userCountryCode }: SaintOfTheDayCardProps) => {
  const navigate = useNavigate();
  const { saint, isNationalFeast, loading, allSaintsToday } = useSaintOfDay(userCountryCode);
  const [showHistory, setShowHistory] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isNationalFeast) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isNationalFeast]);

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-6 w-48 mb-3" />
          <Skeleton className="h-16 w-full mb-3" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!saint) {
    return null;
  }

  const handlePrayNow = () => {
    if (saint.prayer_id) {
      navigate(`/oraciones/app?oracion=${saint.prayer_id}`);
    } else {
      navigate('/oraciones/app');
    }
  };

  const formatDate = (month: number, day: number) => {
    const date = new Date(2024, month - 1, day);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          className={`overflow-hidden relative ${
            isNationalFeast
              ? 'ring-2 ring-yellow-500 bg-gradient-to-br from-yellow-50/50 to-amber-50/50 dark:from-yellow-900/20 dark:to-amber-900/20'
              : 'bg-gradient-to-br from-primary/5 to-secondary/5'
          }`}
        >
          {/* Confetti for national feast */}
          {showConfetti && isNationalFeast && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <ConfettiParticle key={i} delay={i * 0.2} left={10 + i * 7} />
              ))}
            </div>
          )}

          <CardContent className="p-4 relative">
            {/* Header with badges */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {formatDate(saint.feast_month, saint.feast_day)}
                </span>
              </div>

              {isNationalFeast ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                >
                  <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0">
                    <PartyPopper className="h-3 w-3 mr-1" />
                    Fiesta Nacional
                  </Badge>
                </motion.div>
              ) : (
                <Badge variant="secondary">
                  <Star className="h-3 w-3 mr-1" />
                  Santo del día
                </Badge>
              )}
            </div>

            {/* Saint name with icon */}
            <div className="flex items-start gap-3 mb-3">
              <div
                className={`p-2 rounded-full ${
                  isNationalFeast
                    ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                <Church className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3
                  className={`font-bold text-lg leading-tight ${
                    isNationalFeast ? 'text-amber-900 dark:text-amber-100' : ''
                  }`}
                >
                  {saint.name}
                </h3>
                {saint.category === 'patron_country' && saint.country_code && (
                  <p className="text-sm text-muted-foreground">
                    Patrono/a de tu país
                  </p>
                )}
              </div>
            </div>

            {/* Description preview */}
            {saint.description && (
              <>
                <Badge variant="outline" className="text-[10px] mb-2 border-amber-500/40 text-amber-700 dark:text-amber-300">
                  Relato inspirado · dramatización
                </Badge>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {saint.description}
                </p>
              </>
            )}

            {/* Tags */}
            {saint.tags && saint.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {saint.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs capitalize">
                    {tag.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className={
                  isNationalFeast
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white'
                    : ''
                }
                onClick={handlePrayNow}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Rezar ahora
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowHistory(true)}
              >
                <BookOpen className="h-4 w-4 mr-1" />
                Ver historia
              </Button>
              <DailyShareButton 
                tipo="santo"
                title="Compartir"
                fallbackText={`🙏 Hoy celebramos a ${saint.name}. ¡Conoce su historia en ElRugido!`}
                variant="ghost"
                size="sm"
                className="text-primary"
              />
            </div>

            {/* Show more saints indicator */}
            {allSaintsToday.length > 1 && (
              <p 
                className="text-xs text-muted-foreground mt-3 cursor-pointer hover:text-primary transition-colors"
                onClick={() => navigate('/santos')}
              >
                +{allSaintsToday.length - 1} santo(s) más hoy →
              </p>
            )}

            {/* Link to all saints */}
            <p 
              className="text-xs text-primary mt-2 cursor-pointer hover:underline"
              onClick={() => navigate('/santos')}
            >
              Ver todos los santos →
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* History modal */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Church className="h-5 w-5 text-primary" />
              {saint.name}
            </DialogTitle>
            <DialogDescription>
              Fiesta: {formatDate(saint.feast_month, saint.feast_day)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {saint.image_url && (
              <img
                src={saint.image_url}
                alt={saint.name}
                className="w-full h-48 object-cover object-top rounded-lg"
              />
            )}
            <div>
              <Badge variant="outline" className="text-[10px] mb-2 border-amber-500/40 text-amber-700 dark:text-amber-300">
                Relato inspirado · dramatización
              </Badge>
              <p className="text-sm leading-relaxed">{saint.description}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/40 p-3 space-y-1">
              <p className="text-xs font-semibold text-foreground">Datos verificables</p>
              <ul className="text-xs text-muted-foreground space-y-0.5 list-disc pl-4">
                <li><span className="font-medium text-foreground">Nombre:</span> {saint.name}</li>
                <li><span className="font-medium text-foreground">Fiesta litúrgica:</span> {formatDate(saint.feast_month, saint.feast_day)}</li>
                {saint.tags && saint.tags.length > 0 && (
                  <li><span className="font-medium text-foreground">Reconocido/a por:</span> {saint.tags.slice(0, 4).map(t => t.replace(/_/g, ' ')).join(', ')}</li>
                )}
                <li className="italic">Canonizado/a por la Iglesia Católica.</li>
              </ul>
            </div>
              <div>
                <p className="text-sm font-medium mb-2">Patronazgos:</p>
                <div className="flex flex-wrap gap-1.5">
                  {saint.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="capitalize">
                      {tag.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <Button className="w-full" onClick={handlePrayNow}>
              <Sparkles className="h-4 w-4 mr-2" />
              Ir a rezar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
