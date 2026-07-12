// Verificación reanudable de santos contra su fuente citada (Wikipedia).
// - Toma N santos con estado_verificacion='sin_verificar'
// - Descarga el artículo de Wikipedia (description_source / fuente_url / búsqueda por nombre)
// - Extrae con IA la fecha de fiesta católica y si fue mártir
// - Compara con feast_day/feast_month y con tags
// - Escribe estado_verificacion + discrepancia_detalle en la fila
// - NO modifica los datos originales; solo marca discrepancias para revisión humana.
import { createClient } from "npm:@supabase/supabase-js@2";
import { verifyAdmin } from "../_shared/verifyAdmin.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-api-key",
};

const MONTHS_ES: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10,
  noviembre: 11, diciembre: 12,
};

function normalizeName(name: string): string {
  return name
    .replace(/^(San|Santo|Santa|Beato|Beata|Sto\.?|Sta\.?)\s+/i, "")
    .replace(/\s+(de|del|de la|de los)\s+.*$/i, (m) => m) // keep for context
    .trim();
}

async function fetchWikipediaExtract(saintName: string, hintUrl?: string | null):
  Promise<{ url: string; text: string } | null> {
  try {
    // Si tenemos URL directa, úsala; si no busca por título.
    let title: string | null = null;
    let lang = "es";

    if (hintUrl && /wikipedia\.org\/wiki\//i.test(hintUrl)) {
      const m = hintUrl.match(/https?:\/\/([a-z]+)\.wikipedia\.org\/wiki\/([^?#]+)/i);
      if (m) {
        lang = m[1];
        title = decodeURIComponent(m[2]);
      }
    }

    if (!title) {
      // Búsqueda en Wikipedia ES
      const q = normalizeName(saintName);
      const searchUrl = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        "santo " + q,
      )}&format=json&srlimit=1&origin=*`;
      const sr = await fetch(searchUrl);
      const sj = await sr.json();
      const first = sj?.query?.search?.[0];
      if (!first) return null;
      title = first.title;
    }

    const extractUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&exsectionformat=plain&titles=${encodeURIComponent(
      title!,
    )}&format=json&redirects=1&origin=*`;
    const er = await fetch(extractUrl);
    const ej = await er.json();
    const pages = ej?.query?.pages ?? {};
    const page: any = Object.values(pages)[0];
    const text: string = page?.extract ?? "";
    if (!text || text.length < 100) return null;
    const canonical = `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title!.replace(/ /g, "_"))}`;
    return { url: canonical, text: text.slice(0, 8000) };
  } catch (_e) {
    return null;
  }
}

async function extractFactsWithAI(saintName: string, wikiText: string):
  Promise<{ feast_day: number | null; feast_month: number | null; is_martyr: boolean | null; note: string } | null> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return null;

  const prompt = `Del siguiente texto biográfico de Wikipedia sobre "${saintName}", extrae:
1) La fecha de la fiesta litúrgica CATÓLICA (día y mes). Si el texto menciona varias iglesias, prioriza la Iglesia Católica Romana. Si no aparece, deja null.
2) Si murió como MÁRTIR (asesinado por la fe) o no. Si el texto no lo aclara, deja null.

Responde SOLO JSON válido con esta forma exacta:
{"feast_day": <1-31 o null>, "feast_month_name": <"enero"|"febrero"|...|"diciembre"|null>, "is_martyr": <true|false|null>, "note": "cita breve del texto que sustenta la respuesta"}

Texto:
"""
${wikiText}
"""`;

  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Extraes datos factuales de textos. Respondes SOLO JSON válido." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!r.ok) {
      console.error("AI error", r.status, await r.text());
      return null;
    }
    const j = await r.json();
    const raw = j?.choices?.[0]?.message?.content ?? "{}";
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    const monthName: string | null = parsed?.feast_month_name?.toLowerCase?.() ?? null;
    return {
      feast_day: typeof parsed?.feast_day === "number" ? parsed.feast_day : null,
      feast_month: monthName && MONTHS_ES[monthName] ? MONTHS_ES[monthName] : null,
      is_martyr: typeof parsed?.is_martyr === "boolean" ? parsed.is_martyr : null,
      note: String(parsed?.note ?? "").slice(0, 500),
    };
  } catch (e) {
    console.error("AI parse error", e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const auth = await verifyAdmin(req, corsHeaders);
  if (!auth.ok) return auth.response;

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Math.max(parseInt(body.limit) || 15, 1), 30);
    const resetAll = body.resetAll === true;

    if (resetAll) {
      await admin.from("calendar_saints").update({
        estado_verificacion: "sin_verificar",
        discrepancia_detalle: null,
        verificado_at: null,
      }).neq("estado_verificacion", "sin_verificar");
    }

    const { data: pending, error } = await admin
      .from("calendar_saints")
      .select("id, name, feast_day, feast_month, tags, description_source, fuente_url")
      .eq("estado_verificacion", "sin_verificar")
      .order("feast_month")
      .order("feast_day")
      .limit(limit);

    if (error) throw error;

    const results: any[] = [];
    for (const s of pending ?? []) {
      const hasSource = !!s.description_source || !!s.fuente_url;
      if (!hasSource) {
        await admin.from("calendar_saints").update({
          estado_verificacion: "sin_fuente",
          verificado_at: new Date().toISOString(),
          discrepancia_detalle: { motivo: "El santo no tiene description_source ni fuente_url guardada." },
        }).eq("id", s.id);
        results.push({ id: s.id, name: s.name, status: "sin_fuente" });
        continue;
      }

      const wiki = await fetchWikipediaExtract(s.name, s.fuente_url);
      if (!wiki) {
        await admin.from("calendar_saints").update({
          estado_verificacion: "sin_fuente",
          verificado_at: new Date().toISOString(),
          discrepancia_detalle: { motivo: "No se pudo obtener texto de Wikipedia para verificar." },
        }).eq("id", s.id);
        results.push({ id: s.id, name: s.name, status: "sin_fuente" });
        continue;
      }

      const facts = await extractFactsWithAI(s.name, wiki.text);
      if (!facts) {
        results.push({ id: s.id, name: s.name, status: "error_ai" });
        continue; // dejamos como sin_verificar para reintentar
      }

      const app_martir = Array.isArray(s.tags) && s.tags.some((t: string) => /m[aá]rtir/i.test(t));
      const dateMismatch =
        facts.feast_day != null && facts.feast_month != null &&
        (facts.feast_day !== s.feast_day || facts.feast_month !== s.feast_month);
      const martyrMismatch =
        facts.is_martyr != null && facts.is_martyr !== app_martir;

      const hasDiscrepancy = dateMismatch || martyrMismatch;
      const detalle = {
        fuente_url: wiki.url,
        fecha_app: `${s.feast_day}/${s.feast_month}`,
        fecha_fuente: facts.feast_day && facts.feast_month ? `${facts.feast_day}/${facts.feast_month}` : "no encontrada",
        fecha_mismatch: dateMismatch,
        martir_app: app_martir,
        martir_fuente: facts.is_martyr,
        martir_mismatch: martyrMismatch,
        cita: facts.note,
      };

      await admin.from("calendar_saints").update({
        estado_verificacion: hasDiscrepancy ? "discrepancia" : "contrastado_ok",
        verificado_at: new Date().toISOString(),
        fuente_url: wiki.url,
        discrepancia_detalle: hasDiscrepancy ? detalle : null,
      }).eq("id", s.id);

      results.push({ id: s.id, name: s.name, status: hasDiscrepancy ? "discrepancia" : "contrastado_ok", detalle });
    }

    // Cuenta global restante
    const { count: remaining } = await admin
      .from("calendar_saints")
      .select("*", { count: "exact", head: true })
      .eq("estado_verificacion", "sin_verificar");

    return new Response(
      JSON.stringify({ processed: results.length, remaining: remaining ?? 0, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("verify-saints-batch fatal", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
