import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (authHeader?.startsWith("Bearer ")) {
      const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user }, error } = await anonClient.auth.getUser();
      if (error || !user) {
        return new Response(JSON.stringify({ error: "No autorizado" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      return new Response(JSON.stringify({ error: "Auth requerida" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const targetDate = body.fecha || new Date().toISOString().split("T")[0];

    const { data: existing } = await supabase
      .from("daily_capsules")
      .select("id")
      .eq("fecha", targetDate)
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ message: "Cápsula ya existe para esta fecha", id: existing.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const categories = ["tech_vs_fe", "dato_historico", "pregunta_provocadora"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    // Style varies by category
    const styleGuides: Record<string, string> = {
      tech_vs_fe: `TONO: Irónico-asombrado. Como un tuit de alguien que acaba de leer algo que le voló la cabeza. Ej: "OpenAI gasta $700,000 al día en servidores. Los monjes benedictinos del siglo XII copiaban la Biblia a mano durante 15 meses. Uno cambió el mundo con electricidad. El otro, sin ella."
Usa humor sutil, contraste dramático, datos duros vs. datos humanos.`,
      dato_historico: `TONO: Narrador de podcast que cuenta un secreto. Como si dijeras "¿sabías que...?" en una cena. Ej: "En 1927, un cura belga le dijo a Einstein que el universo se estaba expandiendo. Einstein lo llamó loco. Dos años después, Hubble le dio la razón al cura. Se llamaba Georges Lemaître y su idea hoy la conocemos como el Big Bang."
Cuenta la historia en miniatura. Con personajes, año, lugar.`,
      pregunta_provocadora: `TONO: Filosófico-directo. Como un graffiti inteligente. Ej: "Si una IA puede escribir una oración perfecta, ¿por qué no te conmueve? Quizás porque orar no es producir palabras. Es abrir una herida."
Haz preguntas que duelan un poquito. Que se queden pegadas.`,
    };

    const prompt = `Genera una "cápsula del día" para ElRugido, una plataforma católica.

CATEGORÍA: ${randomCategory}

${styleGuides[randomCategory]}

REGLAS ABSOLUTAS:
- El dato DEBE ser REAL y verificable. Incluye la fuente real (nombre de estudio, institución, año)
- Máximo 2 frases para el dato. Que sean CONCRETAS (números, fechas, nombres propios)
- La reflexión: 2-3 frases. NO prediques. NO moralices. Conecta el dato con algo profundamente humano
- Escribe como una persona real, no como un bot. Imperfecciones intencionales: una frase corta seguida de una larga. Un "o sea" ocasional. Un "mira" para empezar
- El emoji debe ser inesperado pero que tenga sentido (no el obvio)
- El color hex debe ser vibrante y distinto cada vez

Responde SOLO en JSON:
{
  "dato_impactante": "...",
  "reflexion": "...",
  "fuente": "...",
  "categoria": "${randomCategory}",
  "emoji_icon": "...",
  "color_accent": "#..."
}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Eres un escritor de microcopy viral. No eres un asistente, eres un autor con voz propia. Escribes como alguien que acaba de descubrir algo alucinante y no puede evitar contarlo. Nunca suenas a comunicado de prensa ni a artículo de Wikipedia." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const err = await aiResponse.text();
      throw new Error(`AI API error: ${aiResponse.status} - ${err}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) throw new Error("No AI content returned");

    const capsuleData = JSON.parse(content);

    const { data: inserted, error: insertError } = await supabase
      .from("daily_capsules")
      .insert({
        fecha: targetDate,
        dato_impactante: capsuleData.dato_impactante,
        reflexion: capsuleData.reflexion,
        fuente: capsuleData.fuente,
        categoria: capsuleData.categoria || randomCategory,
        emoji_icon: capsuleData.emoji_icon || "⚡",
        color_accent: capsuleData.color_accent || "#F59E0B",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ success: true, capsule: inserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Error generating capsule:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
