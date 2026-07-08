import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface GridProps {
  count?: number;
  className?: string;
  cardClassName?: string;
}

/** Grilla de tarjetas con silueta (card thumb + título + subtítulo). */
export function CardGridSkeleton({ count = 6, className, cardClassName }: GridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-2xl border border-border/40 bg-card/40 overflow-hidden",
            cardClassName,
          )}
        >
          <Skeleton className="w-full aspect-[16/10]" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Lista vertical de filas (para oraciones, posts). */
export function ListRowsSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3 animate-fade-in", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/40 p-3"
        >
          <Skeleton className="h-11 w-11 rounded-xl flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton específico para el lector de Biblia 365. */
export function BiblePlanSkeleton() {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Hero */}
      <div className="glass-hero relative overflow-hidden">
        <div className="px-4 lg:px-6 pt-12 lg:pt-6 pb-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 max-w-md pt-2">
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
          </div>
          <Skeleton className="h-1 w-full max-w-md rounded" />
        </div>
      </div>
      <div className="px-4 lg:px-6 py-4 space-y-4">
        <Skeleton className="h-10 w-full max-w-xl rounded-xl" />
        <div className="lg:grid lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-border/40 p-4 space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="w-full aspect-video rounded-lg" />
            </div>
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
          <div className="hidden lg:block space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
