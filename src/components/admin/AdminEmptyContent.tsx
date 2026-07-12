import { AlertCircle } from "lucide-react";

/**
 * Banner de "Sin contenido" para paneles admin de módulos vacíos.
 * Deja claro que no hay data cargada — no que el módulo esté roto.
 */
export function AdminEmptyContent({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 p-6 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15">
        <AlertCircle className="h-5 w-5 text-amber-600" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {hint || "Este módulo aún no tiene contenido cargado. En la app pública se oculta o muestra un estado 'Próximamente'."}
      </p>
    </div>
  );
}
