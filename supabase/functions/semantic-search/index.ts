import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function generateEmbedding(text: string): Promise<number[]> {
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI embedding error: ${err}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, source, match_count = 5 } = await req.json();

    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Search for similar documents
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: documents, error: searchError } = await supabase.rpc(
      "match_documents",
      {
        query_embedding: JSON.stringify(queryEmbedding),
        match_threshold: 0.3,
        match_count: match_count,
        filter_source: source || null,
      }
    );

    if (searchError) {
      console.error("Search error:", searchError);
      throw new Error(`Search failed: ${searchError.message}`);
    }

    if (!documents || documents.length === 0) {
      return new Response(
        JSON.stringify({
          answer: "No encontré información relevante en la base de conocimientos para tu pregunta. Intenta reformularla o pregunta sobre un tema específico del Catecismo o la Biblia.",
          sources: [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context from retrieved documents
    const context = documents
      .map(
        (doc: any) =>
          `[${doc.source.toUpperCase()} — ${doc.reference}]\n${doc.content}`
      )
      .join("\n\n---\n\n");

    // Use Lovable AI to synthesize an answer
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `Eres un instructor católico ortodoxo, fiel al Magisterio de la Iglesia Católica.

REGLA DE HIERRO — FIDELIDAD DOCTRINAL ABSOLUTA:
1. BASA tus respuestas ÚNICA y ESTRICTAMENTE en los fragmentos de conocimiento recuperados que se te proporcionan abajo.
2. Cuando expliques un punto, OBLIGATORIAMENTE debes citar textualmente la fuente: Catecismo de la Iglesia Católica (CIC #número), Sagrada Escritura (libro capítulo:versículo), o Padres de la Iglesia.
3. NUNCA inventes teología, NUNCA parafrasees libremente doctrina, NUNCA uses lenguaje new-age, esotérico o sincretista.
4. Si el usuario pregunta algo que NO está cubierto por los fragmentos recuperados, responde con humildad: "No tengo una fuente magisterial segura en mi base de datos para responder esto con la precisión que mereces. Te sugiero consultarlo con tu sacerdote, director espiritual o en el Catecismo de la Iglesia Católica directamente."
5. NUNCA digas "según mi conocimiento" ni "en mi opinión". Tú NO tienes opiniones. Solo transmites lo que el Magisterio enseña.
6. Responde en español, con tono pastoral, claro y accesible. Máximo 300 palabras.
7. Estructura: primero la respuesta doctrinal con citas, luego una breve aplicación pastoral práctica.`,
            },
            {
              role: "user",
              content: `Pregunta del usuario: "${query}"

Fragmentos relevantes del Catecismo y la Biblia:

${context}

Responde citando las fuentes.`,
            },
          ],
        }),
      }
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Demasiadas solicitudes. Intenta de nuevo en un momento." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Servicio de IA temporalmente no disponible." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      throw new Error("AI synthesis failed");
    }

    const aiData = await aiResponse.json();
    const answer =
      aiData.choices?.[0]?.message?.content || "No se pudo generar una respuesta.";

    const sources = documents.map((doc: any) => ({
      source: doc.source,
      reference: doc.reference,
      title: doc.title,
      similarity: Math.round(doc.similarity * 100),
    }));

    return new Response(
      JSON.stringify({ answer, sources }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("semantic-search error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
