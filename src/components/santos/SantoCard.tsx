import { motion } from 'framer-motion';
import { Church, BookOpen, Sparkles, ImageOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarSaint } from '@/hooks/useSantos';
import { cn } from '@/lib/utils';

// Country code to flag emoji mapping
const countryFlags: Record<string, string> = {
  AR: '🇦🇷', BO: '🇧🇴', BR: '🇧🇷', CL: '🇨🇱', CO: '🇨🇴',
  CR: '🇨🇷', CU: '🇨🇺', DO: '🇩🇴', EC: '🇪🇨', SV: '🇸🇻',
  GT: '🇬🇹', HN: '🇭🇳', MX: '🇲🇽', NI: '🇳🇮', PA: '🇵🇦',
  PY: '🇵🇾', PE: '🇵🇪', PR: '🇵🇷', UY: '🇺🇾', VE: '🇻🇪',
};

// Country code to name mapping
const countryNames: Record<string, string> = {
  AR: 'Argentina', BO: 'Bolivia', BR: 'Brasil', CL: 'Chile', CO: 'Colombia',
  CR: 'Costa Rica', CU: 'Cuba', DO: 'Rep. Dominicana', EC: 'Ecuador', SV: 'El Salvador',
  GT: 'Guatemala', HN: 'Honduras', MX: 'México', NI: 'Nicaragua', PA: 'Panamá',
  PY: 'Paraguay', PE: 'Perú', PR: 'Puerto Rico', UY: 'Uruguay', VE: 'Venezuela',
};

interface SantoCardProps {
  saint: CalendarSaint;
  onSelect: () => void;
  isToday?: boolean;
}

export function SantoCard({ saint, onSelect, isToday = false }: SantoCardProps) {
  const formatDate = (month: number, day: number) => {
    const date = new Date(2024, month - 1, day);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const isPatron = saint.category === 'patron_country';
  const hasImage = !!saint.image_url;
  const hasPrayer = !!saint.prayer_id;
  const hasDescription = saint.description && saint.description.length > 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          'overflow-hidden cursor-pointer transition-all hover:shadow-md',
          isToday && 'ring-2 ring-secondary bg-secondary/5',
          isPatron && 'border-primary/30'
        )}
        onClick={onSelect}
      >
        <CardContent className="p-0">
          {/* Image section with optimized loading */}
          <div className="relative h-32 bg-gradient-to-br from-primary/10 to-secondary/10">
            {hasImage ? (
              <img
                src={saint.image_url!}
                alt={`Imagen de ${saint.name}`}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Church className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}
            
            {/* Country flag for patrons */}
            {isPatron && saint.country_code && (
              <div className="absolute top-2 right-2 text-2xl">
                {countryFlags[saint.country_code] || '🏳️'}
              </div>
            )}

            {/* Date badge */}
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                {formatDate(saint.feast_month, saint.feast_day)}
              </Badge>
            </div>

            {/* Today badge */}
            {isToday && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-secondary text-secondary-foreground">
                  Hoy
                </Badge>
              </div>
            )}
          </div>

          {/* Content section */}
          <div className="p-3 space-y-2">
            <h3 className="font-semibold text-sm line-clamp-1">{saint.name}</h3>
            
            {isPatron && saint.country_code && (
              <p className="text-xs text-muted-foreground">
                Patrono/a de {countryNames[saint.country_code] || saint.country_code}
              </p>
            )}

            {/* Status indicators */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {hasPrayer && (
                <Badge variant="outline" className="text-xs gap-1 px-1.5 py-0">
                  <Sparkles className="h-3 w-3" />
                  Oración
                </Badge>
              )}
              {hasDescription && (
                <Badge variant="outline" className="text-xs gap-1 px-1.5 py-0">
                  <BookOpen className="h-3 w-3" />
                  Historia
                </Badge>
              )}
              {!hasImage && (
                <Badge variant="outline" className="text-xs gap-1 px-1.5 py-0 text-muted-foreground">
                  <ImageOff className="h-3 w-3" />
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
