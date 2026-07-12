import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Loader2, ShieldCheck, AlertTriangle, HelpCircle, ExternalLink, RefreshCw, Play } from "lucide-react";

interface VerifRow {
  id: string;
  name: string;
  feast_day: number;
  feast_month: number;
  tags: string[] | null;
  estado_verificacion: string;
  fuente_url: string | null;
  description_source: string | null;
  discrepancia_detalle: Record<string, unknown> | null;
  verificado_at: string | null;
}

const MONTH = ["", "Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

export default function SaintsVerificationPanel() {
  const qc = useQueryClient();
  const [batchSize, setBatchSize] = useState(15);

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: ["saints-verification"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_saints")
        .select("id,name,feast_day,feast_month,tags,estado_verificacion,fuente_url,description_source,discrepancia_detalle,verificado_at")
        .order("estado_verificacion")
        .order("feast_month")
        .order("feast_day")
        .limit(3000);
      if (error) throw error;
      return data as VerifRow[];
    },
    refetchInterval: 4000,
  });

  const counts = {
    total: rows.length,
    sin: rows.filter(r => r.estado_verificacion === "sin_verificar").length,
    ok: rows.filter(r => r.estado_verificacion === "contrastado_ok").length,
    disc: rows.filter(r => r.estado_verificacion === "discrepancia").length,
    sinFuente: rows.filter(r => r.estado_verificacion === "sin_fuente").length,
  };
  const done = counts.total - counts.sin;
  const pct = counts.total ? Math.round((done / counts.total) * 100) : 0;

  const runBatch = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("verify-saints-batch", {
        body: { limit: batchSize },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Verificados ${data?.processed ?? 0}. Quedan ${data?.remaining ?? 0} sin verificar.`);
      qc.invalidateQueries({ queryKey: ["saints-verification"] });
    },
    onError: (e: Error) => toast.error("Error: " + e.message),
  });

  const runAllUntilDone = useMutation({
    mutationFn: async () => {
      let remaining = counts.sin;
      let processed = 0;
      while (remaining > 0) {
        const { data, error } = await supabase.functions.invoke("verify-saints-batch", {
          body: { limit: batchSize },
        });
        if (error) throw error;
        processed += data?.processed ?? 0;
        remaining = data?.remaining ?? 0;
        qc.invalidateQueries({ queryKey: ["saints-verification"] });
        if ((data?.processed ?? 0) === 0) break;
      }
      return { processed, remaining };
    },
    onSuccess: (r) => toast.success(`Terminado. Verificados ${r.processed}. Restantes: ${r.remaining}.`),
    onError: (e: Error) => toast.error("Loop error: " + e.message),
  });

  const discrepancias = rows.filter(r => r.estado_verificacion === "discrepancia");
  const sinFuente = rows.filter(r => r.estado_verificacion === "sin_fuente");

  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Pase de verificación contra fuente citada
          </CardTitle>
          <CardDescription>
            Contrasta fecha de fiesta y condición de mártir de cada santo con su artículo de Wikipedia.
            <strong className="text-foreground"> No modifica los datos</strong>, solo los marca para tu revisión.
            Reanudable y por lotes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatBox label="Total" value={counts.total} />
            <StatBox label="Sin verificar" value={counts.sin} color="text-muted-foreground" />
            <StatBox label="Contrastado OK" value={counts.ok} color="text-green-600" icon={<ShieldCheck className="h-4 w-4" />} />
            <StatBox label="Discrepancias" value={counts.disc} color="text-red-600" icon={<AlertTriangle className="h-4 w-4" />} />
            <StatBox label="Sin fuente" value={counts.sinFuente} color="text-amber-600" icon={<HelpCircle className="h-4 w-4" />} />
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-1">Progreso: {done}/{counts.total} ({pct}%)</div>
            <Progress value={pct} />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <select
              className="border rounded px-3 py-2 bg-background text-sm"
              value={batchSize}
              onChange={(e) => setBatchSize(parseInt(e.target.value))}
            >
              <option value={5}>Lote 5</option>
              <option value={10}>Lote 10</option>
              <option value={15}>Lote 15</option>
              <option value={20}>Lote 20</option>
              <option value={30}>Lote 30</option>
            </select>
            <Button onClick={() => runBatch.mutate()} disabled={runBatch.isPending || counts.sin === 0} className="gap-2">
              {runBatch.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Verificar {Math.min(batchSize, counts.sin)}
            </Button>
            <Button
              variant="secondary"
              onClick={() => runAllUntilDone.mutate()}
              disabled={runAllUntilDone.isPending || counts.sin === 0}
              className="gap-2"
            >
              {runAllUntilDone.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              🚀 Verificar TODOS ({counts.sin})
            </Button>
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refrescar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Discrepancias detectadas ({discrepancias.length})
          </CardTitle>
          <CardDescription>Revisar manualmente. La app dice X, la fuente citada dice Y.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[520px] pr-2">
            {discrepancias.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin discrepancias todavía.</p>
            ) : (
              <div className="space-y-3">
                {discrepancias.map((r) => {
                  const d = (r.discrepancia_detalle ?? {}) as Record<string, any>;
                  return (
                    <div key={r.id} className="border rounded-lg p-3 bg-red-50/30 dark:bg-red-950/10">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold">{r.name}</div>
                          <div className="text-xs text-muted-foreground">
                            App: {r.feast_day} {MONTH[r.feast_month]} · tags: {(r.tags ?? []).join(", ") || "—"}
                          </div>
                        </div>
                        {d.fuente_url && (
                          <a href={d.fuente_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                            Fuente <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        {d.fecha_mismatch && (
                          <Badge variant="destructive" className="justify-start">
                            Fecha: app {d.fecha_app} vs fuente {d.fecha_fuente}
                          </Badge>
                        )}
                        {d.martir_mismatch && (
                          <Badge variant="destructive" className="justify-start">
                            Mártir: app {String(d.martir_app)} vs fuente {String(d.martir_fuente)}
                          </Badge>
                        )}
                      </div>
                      {d.cita && (
                        <p className="mt-2 text-xs italic text-muted-foreground border-l-2 border-red-400 pl-2">
                          "{d.cita}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-amber-600 flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Sin fuente verificable ({sinFuente.length})
          </CardTitle>
          <CardDescription>No hay Wikipedia u otra fuente registrada para contrastar.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[260px] pr-2">
            {sinFuente.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todos los verificados tenían fuente.</p>
            ) : (
              <ul className="text-sm space-y-1">
                {sinFuente.map((r) => (
                  <li key={r.id} className="flex justify-between border-b py-1">
                    <span>{r.name}</span>
                    <span className="text-xs text-muted-foreground">{r.feast_day} {MONTH[r.feast_month]}</span>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function StatBox({ label, value, color, icon }: { label: string; value: number; color?: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-3 bg-background">
      <div className={`flex items-center gap-1 text-2xl font-bold ${color ?? ""}`}>
        {icon}{value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
