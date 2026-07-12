import { ShieldAlert, CheckCircle2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CalendarSaint } from '@/hooks/useSantos';
import { formatSaintCategory } from '@/lib/saintCategories';
import { formatSaintTag } from '@/lib/saintTags';

// Country code to name mapping (subset)
const countryNames: Record<string, string> = {
  AR: 'Argentina', BO: 'Bolivia', BR: 'Brasil', CL: 'Chile', CO: 'Colombia',
  CR: 'Costa Rica', CU: 'Cuba', DO: 'Rep. Dominicana', EC: 'Ecuador', SV: 'El Salvador',
  GT: 'Guatemala', HN: 'Honduras', MX: 'México', NI: 'Nicaragua', PA: 'Panamá',
  PY: 'Paraguay', PE: 'Perú', PR: 'Puerto Rico', UY: 'Uruguay', VE: 'Venezuela',
  ES: 'España', US: 'Estados Unidos',
};

type SaintLike = Pick<
  CalendarSaint,
  'feast_month' | 'feast_day' | 'category' | 'country_code' | 'tags'
> & {
  estado_verificacion?: string | null;
  fuente_descripcion?: string | null;
  description_source?: string | null;
  fuente_url?: string | null;
};

function formatDate(month: number, day: number) {
  const date = new Date(2024, month - 1, day);
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
}

export function InspiredStoryBadge({ saint }: { saint: SaintLike }) {
  const isUnverified =
    saint.estado_verificacion === 'sin_verificar' ||
    saint.fuente_descripcion === 'ia_generada' ||
    !saint.description_source;

  if (!isUnverified) {
    return (
      <div className="flex items-center gap-2 text-xs text-emerald-700">
        <CheckCircle2 className="h-4 w-4" />
        Datos verificados por el equipo editorial.
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
      <ShieldAlert className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
      <div className="text-xs leading-relaxed">
        <Badge variant="outline" className="mb-1 border-amber-600 text-amber-700">
          Relato inspirado · dramatización
        </Badge>
        <p className="text-muted-foreground">
          La narración siguiente es un relato inspirado en la tradición, no un documento
          histórico verificado. Los <strong>datos verificables</strong> aparecen más abajo.
        </p>
      </div>
    </div>
  );
}

export function VerifiableDataBlock({ saint }: { saint: SaintLike }) {
  const isPatron = saint.category === 'patron_country';
  return (
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
          <dd className="font-medium">{formatSaintCategory(saint.category)}</dd>
        </div>
        {isPatron && saint.country_code && (
          <div>
            <dt className="text-muted-foreground text-xs">Patronazgo</dt>
            <dd className="font-medium">{countryNames[saint.country_code] || saint.country_code}</dd>
          </div>
        )}
        {saint.tags && saint.tags.length > 0 && (
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground text-xs">Atributos</dt>
            <dd className="font-medium">
              {saint.tags.map(formatSaintTag).join(' · ')}
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
  );
}
