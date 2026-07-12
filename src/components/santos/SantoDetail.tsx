import { motion, AnimatePresence } from 'framer-motion';
import { X, Church, BookOpen, Sparkles, Calendar, MapPin, ArrowLeft, ShieldAlert, CheckCircle2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarSaint } from '@/hooks/useSantos';
import { useNavigate } from 'react-router-dom';

// Country code to name mapping
const countryNames: Record<string, string> = {
  AR: 'Argentina', BO: 'Bolivia', BR: 'Brasil', CL: 'Chile', CO: 'Colombia',
  CR: 'Costa Rica', CU: 'Cuba', DO: 'Rep. Dominicana', EC: 'Ecuador', SV: 'El Salvador',
  GT: 'Guatemala', HN: 'Honduras', MX: 'México', NI: 'Nicaragua', PA: 'Panamá',
  PY: 'Paraguay', PE: 'Perú', PR: 'Puerto Rico', UY: 'Uruguay', VE: 'Venezuela',
};

// Country code to flag emoji mapping
const countryFlags: Record<string, string> = {
  AR: '🇦🇷', BO: '🇧🇴', BR: '🇧🇷', CL: '🇨🇱', CO: '🇨🇴',
  CR: '🇨🇷', CU: '🇨🇺', DO: '🇩🇴', EC: '🇪🇨', SV: '🇸🇻',
  GT: '🇬🇹', HN: '🇭🇳', MX: '🇲🇽', NI: '🇳🇮', PA: '🇵🇦',
  PY: '🇵🇾', PE: '🇵🇪', PR: '🇵🇷', UY: '🇺🇾', VE: '🇻🇪',
};

interface SantoDetailProps {
  saint: CalendarSaint;
  onClose: () => void;
}

export function SantoDetail({ saint, onClose }: SantoDetailProps) {
  const navigate = useNavigate();

  const formatDate = (month: number, day: number) => {
    const date = new Date(2024, month - 1, day);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  };

  const handlePrayNow = () => {
    if (saint.prayer_id) {
      navigate(`/oraciones/app?oracion=${saint.prayer_id}`);
    } else {
      navigate('/oraciones/app');
    }
  };

  const isPatron = saint.category === 'patron_country';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background"
      >
        {/* Header with image */}
        <div className="relative h-64 bg-gradient-to-br from-primary/20 to-secondary/20">
          {saint.image_url ? (
            <img
              src={saint.image_url}
              alt={saint.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Church className="h-24 w-24 text-muted-foreground/20" />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

          {/* Back button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 rounded-full bg-background/50 backdrop-blur-sm"
            onClick={onClose}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Country flag for patrons */}
          {isPatron && saint.country_code && (
            <div className="absolute top-4 right-4 text-4xl">
              {countryFlags[saint.country_code] || '🏳️'}
            </div>
          )}
        </div>

        {/* Content */}
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="px-5 pb-24 space-y-6 -mt-16 relative">
            {/* Title section */}
            <div className="space-y-3">
              <h1 className="text-2xl font-bold">{saint.name}</h1>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(saint.feast_month, saint.feast_day)}
                </Badge>
                
                {isPatron && saint.country_code && (
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    Patrono/a de {countryNames[saint.country_code]}
                  </Badge>
                )}
              </div>
            </div>

            {/* Tags */}
            {saint.tags && saint.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {saint.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs capitalize">
                    {tag.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            )}

            {/* Aviso de credibilidad: relato dramatizado vs. datos verificables. */}
            {(() => {
              const isUnverified =
                saint.estado_verificacion === 'sin_verificar' ||
                saint.fuente_descripcion === 'ia_generada' ||
                (!saint.description_source);
              return isUnverified ? (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
                  <ShieldAlert className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="text-xs leading-relaxed">
                    <Badge variant="outline" className="mb-1 border-amber-600 text-amber-700">
                      Relato inspirado · dramatización
                    </Badge>
                    <p className="text-muted-foreground">
                      La narración siguiente es un relato inspirado en la tradición, no un documento histórico verificado. Los <strong>datos verificables</strong> aparecen más abajo.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Datos verificados por el equipo editorial.
                </div>
              );
            })()}

            {/* Description / History (relato dramatizado) */}
            {saint.description ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold">Relato</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {saint.description}
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Historia próximamente...</p>
              </div>
            )}

            {/* Datos verificables (hechos objetivos + fuente) */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <h3 className="font-semibold">Datos verificables</h3>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground text-xs">Fiesta litúrgica</dt>
                  <dd className="font-medium">{formatDate(saint.feast_month, saint.feast_day)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Categoría</dt>
                  <dd className="font-medium capitalize">{saint.category.replace(/_/g, ' ')}</dd>
                </div>
                {isPatron && saint.country_code && (
                  <div>
                    <dt className="text-muted-foreground text-xs">Patronazgo</dt>
                    <dd className="font-medium">{countryNames[saint.country_code]}</dd>
                  </div>
                )}
                {saint.tags && saint.tags.length > 0 && (
                  <div className="sm:col-span-2">
                    <dt className="text-muted-foreground text-xs">Atributos</dt>
                    <dd className="font-medium capitalize">
                      {saint.tags.map((t) => t.replace(/_/g, ' ')).join(' · ')}
                    </dd>
                  </div>
                )}
              </dl>
              <div className="pt-2 border-t text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Fuente: </span>
                {saint.fuente_url ? (
                  <a
                    href={saint.fuente_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Ver fuente en Wikipedia
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="italic text-muted-foreground/70">
                    Fuente pendiente de verificación
                  </span>
                )}
              </div>
            </div>

            {/* Prayer button */}
            {saint.prayer_id && (
              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={handlePrayNow}
              >
                <Sparkles className="h-5 w-5" />
                Rezar ahora
              </Button>
            )}
          </div>
        </ScrollArea>
      </motion.div>
    </AnimatePresence>
  );
}
