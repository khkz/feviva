import { useNavigate } from "react-router-dom";
import { ChevronRight, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface NovenaProgress {
  dia_actual: number;
  completada: boolean;
}

interface Novena {
  id: string;
  titulo: string;
  intencion: string;
  imagen_url: string | null;
}

interface NovenaCarouselProps {
  novenas: Novena[];
  getProgress: (id: string) => NovenaProgress | null;
  loading: boolean;
}

export function NovenaCarousel({ novenas, getProgress, loading }: NovenaCarouselProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <section className="px-5 py-4">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-48 h-56 rounded-2xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  const activeNovenas = novenas.filter(n => {
    const progress = getProgress(n.id);
    return progress && !progress.completada;
  });

  const displayNovenas = activeNovenas.length > 0 ? activeNovenas : novenas.slice(0, 4);

  return (
    <section className="py-4">
      <div className="flex items-center justify-between px-5 mb-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          {activeNovenas.length > 0 ? "Continúa tu Camino" : "Novenas Destacadas"}
        </h2>
        <button 
          onClick={() => navigate("/novenas")}
          className="flex items-center gap-1 text-sm text-primary"
        >
          Ver todas
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto px-5 pb-2 scrollbar-hide">
        {displayNovenas.map((novena) => {
          const progress = getProgress(novena.id);
          const progressPercent = progress ? (progress.dia_actual / 9) * 100 : 0;

          return (
            <button
              key={novena.id}
              onClick={() => navigate("/novenas")}
              className="flex-shrink-0 w-44 glass-card rounded-2xl overflow-hidden transition-smooth hover:scale-[1.02] active:scale-[0.98] text-left"
            >
              {/* Image */}
              <div className="relative h-28 bg-gradient-to-br from-primary/30 to-secondary/30">
                {novena.imagen_url ? (
                  <img 
                    src={novena.imagen_url} 
                    alt={novena.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-muted-foreground/40" />
                  </div>
                )}
                {/* Day Badge */}
                {progress && !progress.completada && (
                  <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm">
                    Día {progress.dia_actual}/9
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-3">
                <h3 className="font-medium text-sm text-foreground line-clamp-2 mb-1">
                  {novena.titulo}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                  {novena.intencion}
                </p>
                {progress && !progress.completada && (
                  <Progress value={progressPercent} className="h-1" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
