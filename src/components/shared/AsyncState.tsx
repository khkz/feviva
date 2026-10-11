import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AsyncStateKind = "loading" | "empty" | "error";

interface AsyncStateProps {
  kind: AsyncStateKind;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const defaults: Record<AsyncStateKind, { title: string; description: string }> = {
  loading: {
    title: "Cargando contenido",
    description: "Esto tomará solo un momento.",
  },
  empty: {
    title: "Aún no hay contenido",
    description: "Vuelve más tarde para encontrar nuevas propuestas.",
  },
  error: {
    title: "No pudimos cargar el contenido",
    description: "Revisa tu conexión e inténtalo de nuevo.",
  },
};

export function AsyncState({
  kind,
  title = defaults[kind].title,
  description = defaults[kind].description,
  actionLabel,
  onAction,
  className,
}: AsyncStateProps) {
  const Icon = kind === "loading" ? Loader2 : kind === "error" ? AlertCircle : Inbox;

  return (
    <section
      className={cn(
        "flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center",
        "animate-in fade-in duration-300 motion-reduce:animate-none",
        className,
      )}
      aria-live={kind === "error" ? "assertive" : "polite"}
      aria-busy={kind === "loading"}
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-muted">
        <Icon
          className={cn("h-5 w-5 text-muted-foreground", kind === "loading" && "animate-spin motion-reduce:animate-none")}
          aria-hidden="true"
        />
      </div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      {actionLabel && onAction && (
        <Button className="mt-5" variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </section>
  );
}