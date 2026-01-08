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
    const { batchSize = 5 } = await req.json().catch(() => ({}));
    const effectiveBatchSize = Math.min(Math.max(1, batchSize), 10);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get sessions that haven't been regenerated yet
    const { data: sessions, error: fetchError } = await supabase
      .from("gratitude_sessions")
      .select("id, numero, titulo, descripcion")
      .is("regenerated_at", null)
      .order("numero", { ascending: true })
      .limit(effectiveBatchSize);

    if (fetchError) {
      throw new Error(`Error fetching sessions: ${fetchError.message}`);
    }

    if (!sessions || sessions.length === 0) {
      // Count total and regenerated
      const { count: total } = await supabase
        .from("gratitude_sessions")
        .select("*", { count: "exact", head: true });

      const { count: regenerated } = await supabase
        .from("gratitude_sessions")
        .select("*", { count: "exact", head: true })
        .not("regenerated_at", "is", null);

      return new Response(
        JSON.stringify({
          success: true,
          message: "No hay sesiones pendientes de regenerar",
          processed: 0,
          remaining: 0,
          total: total || 0,
          regenerated: regenerated || 0,
          hasMore: false,
          results: [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: Array<{
      numero: number;
      titulo: string;
      status: "success" | "error";
      error?: string;
    }> = [];

    const systemPrompt = `Eres un guía espiritual católico sabio, cercano y profundamente conocedor de las Sagradas Escrituras. 
Tu tarea es escribir reflexiones bíblicas para sesiones de gratitud diarias.

Características de tus reflexiones:
- 3-4 párrafos cortos y cálidos (entre 400-600 caracteres total, NO más)
- Incluir al menos 1 cita bíblica relevante con referencia completa (libro capítulo:versículo)
- Tono personal y cercano (tutea al lector)
- Variedad de libros bíblicos: Salmos, Proverbios, Evangelios, Cartas de Pablo, Profetas, etc.
- Conectar el tema con la gratitud y situaciones cotidianas
- Terminar con una breve invitación a la reflexión o acción concreta

NO uses listas con viñetas. Escribe en párrafos fluidos y naturales.
NO repitas frases como "Que Dios te bendiga" que se agregarán después.`;

    for (const session of sessions) {
      try {
        const userPrompt = `Escribe una reflexión de gratitud para la sesión número ${session.numero} titulada: "${session.titulo}"

La reflexión debe:
1. Explicar brevemente este aspecto de la gratitud desde la fe cristiana
2. Incluir una cita bíblica que lo respalde (NO solo de Efesios, usa variedad)
3. Aplicarlo a una situación cotidiana del lector
4. Invitar a agradecer activamente por esta bendición

Recuerda: máximo 600 caracteres, párrafos fluidos, sin listas.`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-pro-preview",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            max_tokens: 800,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`AI gateway error for session ${session.numero}:`, response.status, errorText);
          
          if (response.status === 429) {
            results.push({
              numero: session.numero,
              titulo: session.titulo,
              status: "error",
              error: "Rate limit alcanzado. Intenta de nuevo en unos segundos.",
            });
            break; // Stop processing on rate limit
          }
          
          results.push({
            numero: session.numero,
            titulo: session.titulo,
            status: "error",
            error: `Error del gateway: ${response.status}`,
          });
          continue;
        }

        const aiData = await response.json();
        const newDescription = aiData.choices?.[0]?.message?.content?.trim();

        if (!newDescription) {
          results.push({
            numero: session.numero,
            titulo: session.titulo,
            status: "error",
            error: "La IA no generó contenido",
          });
          continue;
        }

        // Update the session with new content, backup original
        const { error: updateError } = await supabase
          .from("gratitude_sessions")
          .update({
            descripcion_original: session.descripcion,
            descripcion: newDescription,
            regenerated_at: new Date().toISOString(),
          })
          .eq("id", session.id);

        if (updateError) {
          results.push({
            numero: session.numero,
            titulo: session.titulo,
            status: "error",
            error: `Error guardando: ${updateError.message}`,
          });
          continue;
        }

        results.push({
          numero: session.numero,
          titulo: session.titulo,
          status: "success",
        });

        console.log(`✅ Sesión ${session.numero} regenerada: ${session.titulo}`);

        // Small delay between requests to avoid rate limits
        if (sessions.indexOf(session) < sessions.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (sessionError) {
        console.error(`Error processing session ${session.numero}:`, sessionError);
        results.push({
          numero: session.numero,
          titulo: session.titulo,
          status: "error",
          error: sessionError instanceof Error ? sessionError.message : "Error desconocido",
        });
      }
    }

    // Get updated counts
    const { count: remaining } = await supabase
      .from("gratitude_sessions")
      .select("*", { count: "exact", head: true })
      .is("regenerated_at", null);

    const { count: total } = await supabase
      .from("gratitude_sessions")
      .select("*", { count: "exact", head: true });

    const successCount = results.filter((r) => r.status === "success").length;

    return new Response(
      JSON.stringify({
        success: true,
        processed: successCount,
        remaining: remaining || 0,
        total: total || 0,
        regenerated: (total || 0) - (remaining || 0),
        hasMore: (remaining || 0) > 0,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in regenerate-gratitude-content:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
