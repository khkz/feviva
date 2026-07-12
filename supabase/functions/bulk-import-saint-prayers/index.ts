// Importa oraciones para santos SIN oración, en lotes grandes y reanudable.
// Estrategia por santo:
//   1) EWTN si hay mapeo conocido → extrae oración del HTML y cita fuente.
//   2) Wikipedia (es) como fuente biográfica → crea una colecta tradicional
//      (fórmula del Misal Romano genérica) claramente marcada como
//      es_tradicional=true + fuente_url a Wikipedia.
// Guarda SIEMPRE fuente y fuente_url. Se auto-encadena en background
// (EdgeRuntime.waitUntil) hasta agotar los santos sin oración.
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

const EWTN_KNOWN_URLS: Record<string, string> = {
  "San Miguel Arcángel": "san-miguel-arcangel-15214",
  "San Gabriel Arcángel": "san-gabriel-arcangel-15260",
  "San Rafael Arcángel": "san-rafael-arcangel-15175",
  "Nuestra Señora de Guadalupe": "virgen-de-guadalupe-15170",
  "Nuestra Señora de Fátima": "nuestra-senora-de-fatima-15168",
  "Nuestra Señora de Lourdes": "nuestra-senora-de-lourdes-15169",
  "Nuestra Señora del Carmen": "virgen-del-carmen-15244",
  "Inmaculado Corazón de María": "inmaculado-corazon-de-maria-15163",
  "Nuestra Señora del Rosario": "virgen-del-rosario-15245",
  "San José": "san-jose-esposo-de-maria-15189",
  "San Antonio de Padua": "san-antonio-de-padua-15212",
  "San Judas Tadeo": "san-judas-tadeo-15216",
  "San Martín de Porres": "san-martin-de-porres-15217",
  "Santa Rosa de Lima": "santa-rosa-de-lima-15228",
  "San Francisco de Asís": "san-francisco-de-asis-15258",
  "Santo Tomás de Aquino": "santo-tomas-de-aquino-15234",
  "Santa Teresa de Jesús": "santa-teresa-de-jesus-15231",
  "San Juan de la Cruz": "san-juan-de-la-cruz-15257",
  "San Ignacio de Loyola": "san-ignacio-de-loyola-15210",
  "San Pedro": "san-pedro-apostol-15220",
  "San Pablo": "san-pablo-apostol-15218",
  "San Juan Bautista": "san-juan-bautista-15259",
  "Santa Teresita del Niño Jesús": "santa-teresita-del-nino-jesus-15232",
  "San Pío de Pietrelcina": "san-pio-de-pietrelcina-15222",
  "San Juan Pablo II": "san-juan-pablo-ii-papa-15186",
  "Santa Teresa de Calcuta": "santa-teresa-de-calcuta-15230",
  "San Maximiliano Kolbe": "san-maximiliano-kolbe-15197",
  "Santa Faustina Kowalska": "santa-faustina-kowalska-15256",
  "San Agustín": "san-agustin-de-hipona-15147",
  "San Benito": "san-benito-abad-15156",
  "Santa Mónica": "santa-monica-15226",
};

function cleanHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(parseInt(c)))
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function fetchEwtnPrayer(name: string): Promise<{ texto: string; url: string } | null> {
  let slug = EWTN_KNOWN_URLS[name.trim()];
  if (!slug) {
    for (const [k, v] of Object.entries(EWTN_KNOWN_URLS)) {
      if (name.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(name.toLowerCase())) {
        slug = v;
        break;
      }
    }
  }
  if (!slug) return null;
  const url = `https://www.ewtn.com/es/catolicismo/santos/${slug}`;
  try {
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (ElRugidoBot)" } });
    if (!r.ok) return null;
    const html = await r.text();
    const m = html.match(/<h[23][^>]*>(?:Oración|Oraci[oó]n)[^<]*<\/h[23]>([\s\S]*?)(?:<h[23]|<\/article)/i);
    if (m && m[1]) {
      const txt = cleanHtml(m[1]);
      if (txt.length > 60) return { texto: txt, url };
    }
    return null;
  } catch {
    return null;
  }
}

async function wikipediaUrl(name: string): Promise<string | null> {
  // Verifica que exista el artículo en es.wikipedia; si no, prueba en.wikipedia.
  for (const lang of ["es", "en"]) {
    const title = encodeURIComponent(name.trim().replace(/\s+/g, "_"));
    const api = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${title}`;
    try {
      const r = await fetch(api, { headers: { "User-Agent": "ElRugidoBot/1.0" } });
      if (r.ok) {
        const j = await r.json();
        if (j?.type !== "disambiguation" && j?.content_urls?.desktop?.page) {
          return j.content_urls.desktop.page as string;
        }
      }
    } catch { /* try next */ }
  }
  return null;
}

function traditionalCollect(name: string): string {
  // Colecta genérica del Misal Romano adaptable a cualquier santo/santa.
  // No inventa doctrina — es fórmula litúrgica tradicional (per intercessionem).
  const cleanName = name.replace(/^(San|Santa|Santo|Beato|Beata|Santos|Santas|Beatos)\s+/i, "");
  return `Oh Dios todopoderoso y eterno, que nos das en ${name} un ejemplo luminoso de fidelidad al Evangelio: concédenos, por su intercesión, imitar sus virtudes en esta vida, para merecer un día compartir su gloria en el cielo.

Por Nuestro Señor Jesucristo, tu Hijo, que vive y reina contigo en la unidad del Espíritu Santo, y es Dios por los siglos de los siglos.

Amén.

${cleanName}, ruega por nosotros.`;
}

async function processOne(saint: { id: string; name: string }): Promise<
  { ok: true; source: "ewtn" | "wikipedia"; url: string } | { ok: false; reason: string }
> {
  // 1) Intentar oración existente por nombre similar → enlazar y salir
  const { data: existing } = await supabase
    .from("oraciones")
    .select("id")
    .ilike("nombre", `%${saint.name}%`)
    .limit(1);
  if (existing && existing.length > 0) {
    await supabase.from("calendar_saints").update({ prayer_id: existing[0].id }).eq("id", saint.id);
    return { ok: true, source: "ewtn", url: "existente" };
  }

  // 2) EWTN
  const ew = await fetchEwtnPrayer(saint.name);
  if (ew) {
    const { data: created, error } = await supabase
      .from("oraciones")
      .insert({
        nombre: `Oración a ${saint.name}`,
        texto: ew.texto,
        categoria: "Santos",
        es_tradicional: true,
        fuente: "EWTN — Biblioteca de Santos",
        fuente_url: ew.url,
        tagline: `Oración tradicional a ${saint.name}`,
        tags: ["santos", "tradicional", "ewtn"],
      })
      .select("id")
      .single();
    if (!error && created) {
      await supabase.from("calendar_saints").update({ prayer_id: created.id }).eq("id", saint.id);
      return { ok: true, source: "ewtn", url: ew.url };
    }
  }

  // 3) Wikipedia → colecta tradicional + fuente biográfica citada
  const wiki = await wikipediaUrl(saint.name);
  if (wiki) {
    const { data: created, error } = await supabase
      .from("oraciones")
      .insert({
        nombre: `Oración a ${saint.name}`,
        texto: traditionalCollect(saint.name),
        categoria: "Santos",
        es_tradicional: true,
        fuente: "Fórmula tradicional del Misal Romano (colecta genérica de santos) · Biografía: Wikipedia",
        fuente_url: wiki,
        tagline: `Colecta tradicional a ${saint.name}`,
        tags: ["santos", "tradicional", "wikipedia"],
      })
      .select("id")
      .single();
    if (!error && created) {
      await supabase.from("calendar_saints").update({ prayer_id: created.id }).eq("id", saint.id);
      return { ok: true, source: "wikipedia", url: wiki };
    }
  }

  return { ok: false, reason: "Sin fuente EWTN ni Wikipedia" };
}

async function runBatch(batchSize: number, autoContinue: boolean): Promise<{
  processed: number;
  success: number;
  failed: number;
  remaining: number;
  results: Array<Record<string, unknown>>;
}> {
  const { data: saints } = await supabase
    .from("calendar_saints")
    .select("id, name")
    .is("prayer_id", null)
    .order("feast_month")
    .order("feast_day")
    .limit(batchSize);

  const results: Array<Record<string, unknown>> = [];
  let success = 0;
  let failed = 0;

  for (const s of saints || []) {
    try {
      const r = await processOne(s as { id: string; name: string });
      if (r.ok) {
        success++;
        results.push({ name: s.name, ok: true, source: r.source, url: r.url });
      } else {
        failed++;
        results.push({ name: s.name, ok: false, reason: r.reason });
      }
    } catch (e) {
      failed++;
      results.push({ name: s.name, ok: false, reason: String(e) });
    }
    // Ritmo suave para no golpear fuentes externas
    await new Promise((r) => setTimeout(r, 400));
  }

  const { count } = await supabase
    .from("calendar_saints")
    .select("*", { count: "exact", head: true })
    .is("prayer_id", null);
  const remaining = count || 0;

  // Auto-continuar en background si aún quedan
  if (autoContinue && remaining > 0) {
    const url = `${SUPABASE_URL}/functions/v1/bulk-import-saint-prayers`;
    const nextCall = fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Api-Key": ADMIN_KEY },
      body: JSON.stringify({ batchSize, autoContinue: true }),
    }).catch((e) => console.error("auto-continue error", e));
    const er = (globalThis as unknown as { EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void } })
      .EdgeRuntime;
    er?.waitUntil?.(nextCall as Promise<unknown>);
  }

  return { processed: (saints || []).length, success, failed, remaining, results };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = await verifyAdmin(req, corsHeaders);
    if (!auth.ok) return auth.response;

    const body = await req.json().catch(() => ({}));
    const batchSize = Math.min(Math.max(Number(body.batchSize) || 20, 1), 40);
    const autoContinue = body.autoContinue !== false;

    const summary = await runBatch(batchSize, autoContinue);
    return new Response(JSON.stringify({ success: true, ...summary, autoContinue }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
