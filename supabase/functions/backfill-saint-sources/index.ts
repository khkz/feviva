// Rellena fuente_url en calendar_saints usando SOLO la API de Wikipedia ES (sin IA).
// Por cada santo:
//   1) Busca el mejor artículo con generator=search y trae el wikitext de la revisión actual.
//   2) Guarda fuente_url = https://es.wikipedia.org/wiki/<titulo_con_guiones_bajos>.
//   3) Extrae fechas del infobox campo "festividad" y, si no está, busca cerca de
//      "festividad|fiesta litúrgica|memoria litúrgica|se celebra|se conmemora" en el cuerpo.
//   4) Contrasta con feast_day/feast_month:
//        - coincide alguna → estado_verificacion = 'contrastado_ok'
//        - no coincide ninguna → 'discrepancia' + discrepancia_detalle {app,fuente,cita}
//        - sin artículo o sin fechas encontradas → 'sin_fuente'
//   NO toca feast_day, feast_month, tags, description.
//   SALTA los que ya están en 'discrepancia_corregida' (los verificó el humano),
//   pero SÍ les rellena fuente_url si aún es NULL.
//   Secuencial, ~350ms entre llamadas, backoff en 429.
//   Reanudable y background-encadenado (EdgeRuntime.waitUntil).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { verifyAdmin } from "../_shared/verifyAdmin.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_KEY = Deno.env.get("ADMIN_API_KEY") || "";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const MONTHS: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10,
  noviembre: 11, diciembre: 12,
};

interface WikiHit {
  title: string;
  url: string;
  wikitext: string;
}

async function wikiFetch(url: string, attempt = 0): Promise<Response> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "ElRugidoBackfill/1.0 (contact: soporte@elrugido.com)",
      "Accept": "application/json",
    },
  });
  if (res.status === 429 && attempt < 4) {
    const wait = 1200 * Math.pow(2, attempt);
    console.warn(`[wiki] 429, backoff ${wait}ms attempt ${attempt + 1}`);
    await new Promise((r) => setTimeout(r, wait));
    return wikiFetch(url, attempt + 1);
  }
  return res;
}

async function searchWikipedia(name: string): Promise<WikiHit | null> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    redirects: "1",
    generator: "search",
    gsrsearch: name,
    gsrlimit: "1",
    prop: "revisions",
    rvprop: "content",
    rvslots: "main",
    formatversion: "2",
    origin: "*",
  });
  const url = `https://es.wikipedia.org/w/api.php?${params.toString()}`;
  const res = await wikiFetch(url);
  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  const page = json?.query?.pages?.[0];
  if (!page || page.missing) return null;
  const wikitext: string =
    page?.revisions?.[0]?.slots?.main?.content ??
    page?.revisions?.[0]?.content ??
    "";
  if (!wikitext) return null;
  const title = String(page.title || "").trim();
  if (!title) return null;
  const titleUrl = encodeURIComponent(title.replace(/ /g, "_"))
    .replace(/%2F/g, "/")
    .replace(/%3A/g, ":");
  return {
    title,
    url: `https://es.wikipedia.org/wiki/${titleUrl}`,
    wikitext,
  };
}

// Extrae valor del campo `festividad` del primer infobox del wikitext.
function extractInfoboxFestividad(wt: string): string | null {
  const m = wt.match(/\|\s*festividad\s*=\s*([\s\S]*?)(?=\n\s*\||\n\}\})/i);
  return m ? m[1].trim() : null;
}

// Escanea el cuerpo por menciones cercanas (≤120 chars) a los términos de fiesta.
function extractBodyContext(wt: string): string[] {
  const contexts: string[] = [];
  const re = /(festividad|fiesta lit[úu]rgica|memoria lit[úu]rgica|se celebra|se conmemora)/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(wt)) !== null) {
    const start = match.index;
    const chunk = wt.slice(start, start + 120 + match[0].length);
    contexts.push(chunk);
    if (contexts.length >= 6) break;
  }
  return contexts;
}

// Devuelve todas las fechas (día, mes) encontradas en un fragmento de texto.
function findDates(fragment: string): Array<{ day: number; month: number }> {
  const out: Array<{ day: number; month: number }> = [];
  // Limpia plantillas simples tipo {{Fecha|...}} y wikilinks [[..|X]]
  const clean = fragment
    .replace(/\[\[[^\]|]*\|([^\]]+)\]\]/g, "$1")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\{\{[^}]*\}\}/g, " ");
  const re = /(\d{1,2})\s+de\s+([a-záéíóúñ]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(clean)) !== null) {
    const day = parseInt(m[1], 10);
    const monthName = m[2].toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const month = MONTHS[monthName];
    if (month && day >= 1 && day <= 31) {
      out.push({ day, month });
    }
  }
  // Dedup
  const seen = new Set<string>();
  return out.filter((d) => {
    const k = `${d.day}-${d.month}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

interface SaintRow {
  id: string;
  name: string;
  feast_day: number;
  feast_month: number;
  estado_verificacion: string;
  fuente_url: string | null;
}

interface ProcessResult {
  name: string;
  ok: boolean;
  status: string;
  fuente_url?: string;
  detail?: unknown;
}

async function processOne(saint: SaintRow): Promise<ProcessResult> {
  const isCorrected = saint.estado_verificacion === "discrepancia_corregida";

  const hit = await searchWikipedia(saint.name);
  if (!hit) {
    // No hay artículo → si es corregido a mano lo dejamos como está,
    // si no, lo marcamos sin_fuente.
    if (!isCorrected) {
      await supabase.from("calendar_saints").update({
        estado_verificacion: "sin_fuente",
        verificado_at: new Date().toISOString(),
        verificado_por_agente: "backfill_wikipedia_es_v1",
      }).eq("id", saint.id);
    }
    return { name: saint.name, ok: false, status: "sin_articulo" };
  }

  // Buscar fechas: primero infobox, luego cuerpo.
  const infoField = extractInfoboxFestividad(hit.wikitext);
  const infoDates = infoField ? findDates(infoField) : [];
  let dates = infoDates;
  let citaFuente = infoField ? `festividad = ${infoField.slice(0, 160)}` : "";

  if (dates.length === 0) {
    const contexts = extractBodyContext(hit.wikitext);
    for (const c of contexts) {
      const found = findDates(c);
      if (found.length > 0) {
        dates = found;
        citaFuente = c.replace(/\s+/g, " ").slice(0, 200);
        break;
      }
    }
  }

  // Para los corregidos a mano: solo rellenamos fuente_url, no tocamos estado.
  if (isCorrected) {
    if (!saint.fuente_url) {
      await supabase.from("calendar_saints").update({
        fuente_url: hit.url,
      }).eq("id", saint.id);
    }
    return {
      name: saint.name,
      ok: true,
      status: "corregido_a_mano_fuente_rellena",
      fuente_url: hit.url,
    };
  }

  if (dates.length === 0) {
    // Hay artículo pero no encontramos festividad: guardamos la URL pero
    // marcamos sin_fuente (no pudimos contrastar).
    await supabase.from("calendar_saints").update({
      fuente_url: hit.url,
      estado_verificacion: "sin_fuente",
      verificado_at: new Date().toISOString(),
      verificado_por_agente: "backfill_wikipedia_es_v1",
    }).eq("id", saint.id);
    return { name: saint.name, ok: false, status: "sin_festividad_en_articulo", fuente_url: hit.url };
  }

  const matches = dates.some(
    (d) => d.day === saint.feast_day && d.month === saint.feast_month,
  );

  if (matches) {
    await supabase.from("calendar_saints").update({
      fuente_url: hit.url,
      estado_verificacion: "contrastado_ok",
      discrepancia_detalle: null,
      verificado_at: new Date().toISOString(),
      verificado_por_agente: "backfill_wikipedia_es_v1",
    }).eq("id", saint.id);
    return { name: saint.name, ok: true, status: "contrastado_ok", fuente_url: hit.url };
  }

  const discDetail = {
    fecha_mismatch: true,
    fecha_app: `${saint.feast_day}/${saint.feast_month}`,
    fecha_fuente: dates.map((d) => `${d.day}/${d.month}`).join(", "),
    fuente_url: hit.url,
    fuente_titulo: hit.title,
    cita: citaFuente,
  };

  await supabase.from("calendar_saints").update({
    fuente_url: hit.url,
    estado_verificacion: "discrepancia",
    discrepancia_detalle: discDetail,
    verificado_at: new Date().toISOString(),
    verificado_por_agente: "backfill_wikipedia_es_v1",
  }).eq("id", saint.id);

  return { name: saint.name, ok: true, status: "discrepancia", fuente_url: hit.url, detail: discDetail };
}

async function pendingCount(): Promise<number> {
  // Un santo "pendiente" es: no tiene fuente_url O nunca lo procesamos con este agente.
  const { count } = await supabase
    .from("calendar_saints")
    .select("*", { count: "exact", head: true })
    .or("fuente_url.is.null,verificado_por_agente.is.null");
  return count || 0;
}

async function fetchBatch(limit: number): Promise<SaintRow[]> {
  const { data, error } = await supabase
    .from("calendar_saints")
    .select("id,name,feast_day,feast_month,estado_verificacion,fuente_url,verificado_por_agente")
    .or("fuente_url.is.null,verificado_por_agente.is.null")
    .order("feast_month")
    .order("feast_day")
    .limit(limit);
  if (error) throw error;
  return (data || []) as unknown as SaintRow[];
}

async function runBatch(limit: number): Promise<{
  processed: number;
  ok: number;
  failed: number;
  remaining: number;
  results: ProcessResult[];
}> {
  const saints = await fetchBatch(limit);
  const results: ProcessResult[] = [];
  let ok = 0;
  let failed = 0;
  for (const s of saints) {
    try {
      const r = await processOne(s);
      results.push(r);
      if (r.ok) ok++; else failed++;
    } catch (e) {
      failed++;
      results.push({ name: s.name, ok: false, status: "error:" + String(e) });
    }
    // Rate limit amistoso con Wikipedia.
    await new Promise((r) => setTimeout(r, 350));
  }
  const remaining = await pendingCount();
  return { processed: saints.length, ok, failed, remaining, results };
}

async function runUntilDone(batchSize: number): Promise<{
  processed: number;
  ok: number;
  failed: number;
  remaining: number;
}> {
  let processed = 0, ok = 0, failed = 0, remaining = 0;
  for (let i = 0; i < 30; i++) {
    const s = await runBatch(batchSize);
    processed += s.processed;
    ok += s.ok;
    failed += s.failed;
    remaining = s.remaining;
    console.log("backfill-saint-sources batch", JSON.stringify({
      iter: i, processed: s.processed, ok: s.ok, failed: s.failed, remaining,
    }));
    if (s.processed === 0 || remaining === 0) break;
  }
  return { processed, ok, failed, remaining };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = await verifyAdmin(req, corsHeaders);
    if (!auth.ok) return auth.response;

    const body = await req.json().catch(() => ({}));
    const batchSize = Math.min(Math.max(Number(body.batchSize) || 20, 1), 40);
    const background = body.background !== false;

    if (background) {
      const before = await pendingCount();
      const job = runUntilDone(batchSize)
        .then((s) => console.log("backfill-saint-sources completed", JSON.stringify(s)))
        .catch((e) => console.error("backfill-saint-sources bg error", e));
      const er = (globalThis as unknown as { EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void } }).EdgeRuntime;
      er?.waitUntil?.(job);
      return new Response(JSON.stringify({
        success: true, accepted: true, beforeRemaining: before, batchSize,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const s = await runBatch(batchSize);
    return new Response(JSON.stringify({ success: true, ...s }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
