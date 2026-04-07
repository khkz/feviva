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

    const categories = ["tech_vs_fe", "dato_historico", "pregunta_provocadora", "contradiccion_aparente", "santo_desconocido"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    const styleGuides: Record<string, string> = {
      tech_vs_fe: `TONO: Irónico-asombrado. Como un tuit de alguien que acaba de leer algo que le voló la cabeza.
EJEMPLO BUENO: "OpenAI gasta $700,000 al día en servidores. Los monjes benedictinos del siglo XII copiaban la Biblia a mano durante 15 meses. Uno cambió el mundo con electricidad. El otro, sin ella."
EJEMPLO MALO (no hacer): "La tecnología avanza pero la fe permanece" — esto es LinkedIn genérico.
Usa contraste dramático entre NÚMEROS ESPECÍFICOS. Nada de "mucho" o "gran cantidad". Cifras exactas.`,
      dato_historico: `TONO: Narrador de podcast que cuenta un secreto. Como si dijeras "¿sabías que...?" en una cena con amigos.
EJEMPLO BUENO: "En 1927, un cura belga le dijo a Einstein que el universo se estaba expandiendo. Einstein lo llamó loco. Dos años después, Hubble le dio la razón al cura. Se llamaba Georges Lemaître y su idea hoy la conocemos como el Big Bang."
EJEMPLO MALO: "A lo largo de la historia, la Iglesia ha contribuido al avance científico" — muerto de aburrimiento.
Cuenta la historia en miniatura. Con nombre propio, año, lugar. Que sea una escena que puedas visualizar.`,
      pregunta_provocadora: `TONO: Filosófico-directo. Como un graffiti inteligente en una pared de universidad.
EJEMPLO BUENO: "Si una IA puede escribir una oración perfecta, ¿por qué no te conmueve? Quizás porque orar no es producir palabras. Es abrir una herida."
EJEMPLO MALO: "¿Te has preguntado alguna vez sobre el sentido de la vida?" — esto lo dice cualquier IA.
Haz preguntas que duelan un poquito. Que se queden pegadas. Que alguien las screenshot.`,
      contradiccion_aparente: `TONO: Provocador-lúcido. Como un profesor que te suelta una bomba y espera tu reacción.
EJEMPLO BUENO: "La Iglesia que 'persiguió' a Galileo tenía un observatorio astronómico 200 años antes que la Royal Society. El Vaticano financió las investigaciones de Galileo durante 20 años. Pero eso no cabe en un meme."
Elige una acusación común contra la Iglesia y desmóntala con HECHOS verificables, no con opiniones.`,
      santo_desconocido: `TONO: Storyteller de bar. Como cuando alguien dice "espera que te cuento una historia increíble".
EJEMPLO BUENO: "Bartolomé de las Casas fue dueño de esclavos en Cuba. A los 30 años leyó Eclesiástico 34:22 y liberó a todos. Pasó los siguientes 50 años luchando por los derechos indígenas. A veces la conversión empieza por la vergüenza."
Cuenta una historia de un santo o figura católica poco conocida. Con giro dramático. Que parezca guión de película.`,
    };

    // Rotating writing styles to avoid pattern detection
    const writingStyles = [
      "Escribe como si estuvieras contando esto en un bar a las 2 AM a alguien que no es católico",
      "Escribe como un hilo de Twitter que te despierta a las 6 AM",
      "Escribe como una nota al margen de un libro que alguien subrayó 14 veces",
      "Escribe como el primer párrafo de una crónica en Gatopardo o El Malpensante",
      "Escribe como un mensaje de voz que le mandarías a tu mejor amigo",
    ];
    const randomStyle = writingStyles[Math.floor(Math.random() * writingStyles.length)];

    const prompt = `Genera una "cápsula del día" para ElRugido, una plataforma católica para la era digital.

CATEGORÍA: ${randomCategory}

${styleGuides[randomCategory]}

ESTILO DE ESCRITURA: ${randomStyle}

REGLAS ABSOLUTAS:
- El dato DEBE ser REAL y verificable. Incluye la fuente real (nombre de estudio, institución, año, página o DOI si es posible)
- Máximo 2 frases para el dato. CONCRETAS: números, fechas, nombres propios. NADA de "muchos", "gran cantidad", "a lo largo de"
- La reflexión: 2-3 frases. NO prediques. NO moralices. NO uses frases motivacionales de LinkedIn. Conecta el dato con algo que duela, sorprenda o incomode — algo HUMANO
- PROHIBIDO: "En un mundo donde...", "Quizás la respuesta está en...", "Esto nos recuerda que...", "La fe nos enseña...", "A lo largo de la historia..."
- Varía la longitud: una frase de 5 palabras seguida de una de 30. Un "O sea." suelto. Una interrupción: "—bueno, ya me entiendes—"
- El emoji debe ser inesperado pero coherente (no el obvio: si hablas de ciencia, no pongas 🔬)
- El color hex: vibrante, distinto cada vez, NUNCA #F59E0B de nuevo

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
        model: "google/gemini-3-pro-preview",
        temperature: 0.95,
        messages: [
          { role: "system", content: "Eres un escritor de microcopy viral. No eres un asistente. Eres un autor con voz propia, impredecible, a veces incómodo, siempre magnético. Escribes como alguien que acaba de descubrir algo alucinante y no puede evitar contarlo. NUNCA suenas a comunicado de prensa, artículo de Wikipedia, ni post de LinkedIn motivacional. Cada pieza que escribes suena diferente a la anterior. Tu firma no es un estilo fijo: es la ausencia de estilo fijo." },
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
