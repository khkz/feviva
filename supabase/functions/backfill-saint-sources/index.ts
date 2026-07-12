// Rellena fuente_url en calendar_saints usando SOLO la API de Wikipedia ES (sin IA).
// Resolución del artículo en 3 pasos, en orden:
//   (1) Lookup DIRECTO por título con action=query&titles=<NombreSinPrefijo>&redirects=1.
//       Quita "San/Santa/Santo/Santos/Beato/Beata" del inicio.
//   (2) Si no existe, busca con generator=search&gsrlimit=5 y DESCARTA títulos que sean
//       lugares o instituciones (blacklist).
//   (3) Valida el artículo elegido: infobox de santo/persona, o palabras clave hagiográficas
//       en los primeros 1000 chars. Si no valida, deja fuente_url NULL y estado sin_fuente.
//
// Modo `repair`: reprocesa SOLO los santos cuyo fuente_url actual matchee la blacklist
// (fuente falsa: edificio/institución/lugar). No toca los que ya están OK.
//
// NO toca feast_day, feast_month, tags, description.
// SALTA los que están en 'discrepancia_corregida' (los verificó el humano), pero
// SÍ les rellena fuente_url si aún es NULL.
// Secuencial, ~350ms entre llamadas, backoff en 429.
// Reanudable y background-encadenado (EdgeRuntime.waitUntil).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { verifyAdmin } from "../_shared/verifyAdmin.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const MONTHS: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10,
  noviembre: 11, diciembre: 12,
};

// Títulos a rechazar: lugares, edificios, instituciones, desambiguaciones, etc.
// Se comparan como palabra en el título (case-insensitive, sin acentos).
const BLACKLIST_TOKENS = [
  "santuario", "catedral", "procatedral", "basilica", "iglesia", "parroquia",
  "capilla", "ermita", "convento", "monasterio", "abadia", "colegio",
  "universidad", "hospital", "museo", "estatua", "puente", "calle", "plaza",
  "isla", "islas", "municipio", "canton", "distrito",
  "desambiguacion", "club", "futbol", "pelicula",
];
// Prefijos de namespace tipo "Anexo:"
const BLACKLIST_PREFIXES = ["anexo:"];

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function titleLooksLikePlaceOrInstitution(title: string): boolean {
  const t = normalize(title);
  for (const p of BLACKLIST_PREFIXES) {
    if (t.startsWith(p)) return true;
  }
  // palabras separadas por no-alfanum
  const words = t.split(/[^a-z0-9]+/).filter(Boolean);
  for (const w of words) {
    if (BLACKLIST_TOKENS.includes(w)) return true;
  }
  return false;
}

function stripSaintPrefix(name: string): string {
  return name.replace(
    /^\s*(san|santa|santo|santos|santas|beato|beata|beatos|beatas|el\s+santisimo|santisimo|santisima)\s+/i,
    "",
  ).trim();
}

interface WikiHit {
  title: string;
  url: string;
  wikitext: string;
}

async function wikiFetch(url: string, attempt = 0): Promise<Response> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "ElRugidoBackfill/1.1 (contact: soporte@elrugido.com)",
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

function urlFromTitle(title: string): string {
  return `https://es.wikipedia.org/wiki/${
    encodeURIComponent(title.replace(/ /g, "_")).replace(/%2F/g, "/").replace(/%3A/g, ":")
  }`;
}

function extractWikitext(page: any): string {
  return page?.revisions?.[0]?.slots?.main?.content ??
    page?.revisions?.[0]?.content ?? "";
}

// (1) Lookup directo por título.
async function directTitleLookup(title: string): Promise<WikiHit | null> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    redirects: "1",
    titles: title,
    prop: "revisions",
    rvprop: "content",
    rvslots: "main",
    formatversion: "2",
    origin: "*",
  });
  const res = await wikiFetch(`https://es.wikipedia.org/w/api.php?${params}`);
  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  const page = json?.query?.pages?.[0];
  if (!page || page.missing) return null;
  const wt = extractWikitext(page);
  const finalTitle = String(page.title || "").trim();
  if (!wt || !finalTitle) return null;
  if (titleLooksLikePlaceOrInstitution(finalTitle)) return null;
  return { title: finalTitle, url: urlFromTitle(finalTitle), wikitext: wt };
}

// (2) Búsqueda con filtro de blacklist. Toma el primer candidato aceptable.
async function searchAndFilter(query: string): Promise<WikiHit | null> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    redirects: "1",
    generator: "search",
    gsrsearch: query,
    gsrlimit: "5",
    prop: "revisions",
    rvprop: "content",
    rvslots: "main",
    formatversion: "2",
    origin: "*",
  });
  const res = await wikiFetch(`https://es.wikipedia.org/w/api.php?${params}`);
  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  const pages: any[] = json?.query?.pages ?? [];
  if (!pages.length) return null;
  // Ordenar por index (relevancia del search)
  pages.sort((a, b) => (a.index ?? 999) - (b.index ?? 999));
  for (const p of pages) {
    const title = String(p.title || "").trim();
    if (!title) continue;
    if (titleLooksLikePlaceOrInstitution(title)) continue;
    const wt = extractWikitext(p);
    if (!wt) continue;
    return { title, url: urlFromTitle(title), wikitext: wt };
  }
  return null;
}

// (3) Validación hagiográfica del artículo.
const HAGIO_INFOBOX_RE =
  /\{\{\s*ficha\s+de\s+(santo|beato|beata|persona|clérigo|religioso|papa|obispo)/i;
const HAGIO_KEYWORDS_RE =
  /\b(santo|santa|beato|beata|m[áa]rtir|obispo|presb[íi]tero|virgen|abad|abadesa|papa|fiesta|festividad)\b/i;

function validateHagiographic(wt: string): boolean {
  if (HAGIO_INFOBOX_RE.test(wt)) return true;
  const head = wt.slice(0, 1000);
  return HAGIO_KEYWORDS_RE.test(head);
}

async function resolveArticle(saintName: string): Promise<WikiHit | null> {
  const stripped = stripSaintPrefix(saintName);
  // (1) Directo con nombre sin prefijo
  if (stripped && stripped.toLowerCase() !== saintName.toLowerCase()) {
    const direct = await directTitleLookup(stripped);
    if (direct && validateHagiographic(direct.wikitext)) return direct;
  }
  // (1b) Directo con nombre completo (por si el artículo canónico lo lleva)
  const directFull = await directTitleLookup(saintName);
  if (directFull && validateHagiographic(directFull.wikitext)) return directFull;

  // (2) Búsqueda con filtro
  const query = stripped || saintName;
  const searched = await searchAndFilter(query);
  if (searched && validateHagiographic(searched.wikitext)) return searched;
  // (2b) Segundo intento con nombre completo
  if (query !== saintName) {
    const searched2 = await searchAndFilter(saintName);
    if (searched2 && validateHagiographic(searched2.wikitext)) return searched2;
  }
  return null;
}

// Extrae valor del campo `festividad` del primer infobox del wikitext.
function extractInfoboxFestividad(wt: string): string | null {
  const m = wt.match(/\|\s*festividad\s*=\s*([\s\S]*?)(?=\n\s*\||\n\}\})/i);
  return m ? m[1].trim() : null;
}

function extractBodyContext(wt: string): string[] {
  const contexts: string[] = [];
  const re = /(festividad|fiesta lit[úu]rgica|memoria lit[úu]rgica|se celebra|se conmemora)/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(wt)) !== null) {
    contexts.push(wt.slice(match.index, match.index + 120 + match[0].length));
    if (contexts.length >= 6) break;
  }
  return contexts;
}

function findDates(fragment: string): Array<{ day: number; month: number }> {
  const out: Array<{ day: number; month: number }> = [];
  const clean = fragment
    .replace(/\[\[[^\]|]*\|([^\]]+)\]\]/g, "$1")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\{\{[^}]*\}\}/g, " ");
  const re = /(\d{1,2})\s+de\s+([a-záéíóúñ]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(clean)) !== null) {
    const day = parseInt(m[1], 10);
    const monthName = m[2].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const month = MONTHS[monthName];
    if (month && day >= 1 && day <= 31) out.push({ day, month });
  }
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

async function markSinFuente(id: string, keepUrl: string | null = null) {
  await supabase.from("calendar_saints").update({
    fuente_url: keepUrl,
    estado_verificacion: "sin_fuente",
    discrepancia_detalle: null,
    verificado_at: new Date().toISOString(),
    verificado_por_agente: "backfill_wikipedia_es_v2",
  }).eq("id", id);
}

async function processOne(saint: SaintRow): Promise<ProcessResult> {
  const isCorrected = saint.estado_verificacion === "discrepancia_corregida";

  const hit = await resolveArticle(saint.name);
  if (!hit) {
    if (!isCorrected) await markSinFuente(saint.id, null);
    return { name: saint.name, ok: false, status: "no_article_valid" };
  }

  // Buscar fechas: infobox → cuerpo
  const infoField = extractInfoboxFestividad(hit.wikitext);
  let dates = infoField ? findDates(infoField) : [];
  let citaFuente = infoField ? `festividad = ${infoField.slice(0, 160)}` : "";

  if (dates.length === 0) {
    for (const c of extractBodyContext(hit.wikitext)) {
      const found = findDates(c);
      if (found.length > 0) {
        dates = found;
        citaFuente = c.replace(/\s+/g, " ").slice(0, 200);
        break;
      }
    }
  }

  // Corregido a mano: solo rellenamos fuente_url si falta
  if (isCorrected) {
    if (!saint.fuente_url) {
      await supabase.from("calendar_saints").update({ fuente_url: hit.url }).eq("id", saint.id);
    }
    return { name: saint.name, ok: true, status: "corregido_a_mano_fuente_rellena", fuente_url: hit.url };
  }

  if (dates.length === 0) {
    await supabase.from("calendar_saints").update({
      fuente_url: hit.url,
      estado_verificacion: "sin_fuente",
      discrepancia_detalle: null,
      verificado_at: new Date().toISOString(),
      verificado_por_agente: "backfill_wikipedia_es_v2",
    }).eq("id", saint.id);
    return { name: saint.name, ok: false, status: "sin_festividad_en_articulo", fuente_url: hit.url };
  }

  const matches = dates.some((d) => d.day === saint.feast_day && d.month === saint.feast_month);

  if (matches) {
    await supabase.from("calendar_saints").update({
      fuente_url: hit.url,
      estado_verificacion: "contrastado_ok",
      discrepancia_detalle: null,
      verificado_at: new Date().toISOString(),
      verificado_por_agente: "backfill_wikipedia_es_v2",
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
    verificado_por_agente: "backfill_wikipedia_es_v2",
  }).eq("id", saint.id);

  return { name: saint.name, ok: true, status: "discrepancia", fuente_url: hit.url, detail: discDetail };
}

// ---------- Cola: pendientes normales ----------
async function pendingCount(): Promise<number> {
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
    .order("feast_month").order("feast_day")
    .limit(limit);
  if (error) throw error;
  return (data || []) as unknown as SaintRow[];
}

// ---------- Cola: reparación de fuentes dudosas ----------
function urlLooksSuspicious(url: string): boolean {
  try {
    const path = decodeURIComponent(new URL(url).pathname.replace(/^\/wiki\//, ""));
    return titleLooksLikePlaceOrInstitution(path.replace(/_/g, " "));
  } catch {
    return false;
  }
}

async function fetchAllForRepair(): Promise<SaintRow[]> {
  const { data, error } = await supabase
    .from("calendar_saints")
    .select("id,name,feast_day,feast_month,estado_verificacion,fuente_url")
    .not("fuente_url", "is", null)
    .neq("estado_verificacion", "discrepancia_corregida")
    .limit(3000);
  if (error) throw error;
  return (data || []).filter((r: any) => urlLooksSuspicious(r.fuente_url as string)) as SaintRow[];
}

async function suspiciousCount(): Promise<number> {
  const all = await fetchAllForRepair();
  return all.length;
}

async function runBatch(limit: number, mode: "normal" | "repair"): Promise<{
  processed: number; ok: number; failed: number; remaining: number; results: ProcessResult[];
}> {
  let saints: SaintRow[];
  if (mode === "repair") {
    const all = await fetchAllForRepair();
    saints = all.slice(0, limit);
    // Antes de re-resolver, limpiamos la fuente falsa para no confundir el estado
    for (const s of saints) {
      await supabase.from("calendar_saints").update({ fuente_url: null }).eq("id", s.id);
      s.fuente_url = null;
    }
  } else {
    saints = await fetchBatch(limit);
  }

  const results: ProcessResult[] = [];
  let ok = 0, failed = 0;
  for (const s of saints) {
    try {
      const r = await processOne(s);
      results.push(r);
      if (r.ok) ok++; else failed++;
    } catch (e) {
      failed++;
      results.push({ name: s.name, ok: false, status: "error:" + String(e) });
    }
    await new Promise((r) => setTimeout(r, 350));
  }
  const remaining = mode === "repair" ? await suspiciousCount() : await pendingCount();
  return { processed: saints.length, ok, failed, remaining, results };
}

async function runUntilDone(batchSize: number, mode: "normal" | "repair") {
  let processed = 0, ok = 0, failed = 0, remaining = 0;
  for (let i = 0; i < 30; i++) {
    const s = await runBatch(batchSize, mode);
    processed += s.processed; ok += s.ok; failed += s.failed; remaining = s.remaining;
    console.log("backfill-saint-sources batch", JSON.stringify({
      mode, iter: i, processed: s.processed, ok: s.ok, failed: s.failed, remaining,
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
    const mode: "normal" | "repair" = body.mode === "repair" ? "repair" : "normal";

    if (mode === "repair" && body.countOnly) {
      const n = await suspiciousCount();
      return new Response(JSON.stringify({ success: true, suspicious: n }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (background) {
      const before = mode === "repair" ? await suspiciousCount() : await pendingCount();
      const job = runUntilDone(batchSize, mode)
        .then((s) => console.log("backfill-saint-sources completed", JSON.stringify({ mode, ...s })))
        .catch((e) => console.error("backfill-saint-sources bg error", e));
      const er = (globalThis as unknown as { EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void } }).EdgeRuntime;
      er?.waitUntil?.(job);
      return new Response(JSON.stringify({
        success: true, accepted: true, mode, beforeRemaining: before, batchSize,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const s = await runBatch(batchSize, mode);
    return new Response(JSON.stringify({ success: true, mode, ...s }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
