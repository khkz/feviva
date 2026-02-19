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
    const authHeader = req.headers.get('Authorization');
    const adminKey = req.headers.get('X-Admin-Api-Key');
    const ADMIN_KEY = Deno.env.get('ADMIN_API_KEY');
    if (adminKey && ADMIN_KEY && adminKey === ADMIN_KEY) { /* Admin OK */ }
    else if (authHeader?.startsWith('Bearer ')) {
      const _ac = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
      const { error: authErr } = await _ac.auth.getUser(authHeader.replace('Bearer ', ''));
      if (authErr) return new Response(JSON.stringify({ error: 'Token inválido' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } else {
      return new Response(JSON.stringify({ error: 'Autenticación requerida' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { batchSize = 5, sessionId = null } = await req.json().catch(() => ({}));
    const effectiveBatchSize = Math.min(Math.max(1, batchSize), 25);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // Helper function to call AI with retries
    async function callAIWithRetry(
      userPrompt: string,
      sessionNumero: number,
      maxRetries = 3
    ): Promise<string | null> {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`Session ${sessionNumero}: Attempt ${attempt}/${maxRetries}`);
        
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
            max_tokens: 2500,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Session ${sessionNumero}: Attempt ${attempt} failed - Status ${response.status}: ${errorText}`);
          if (response.status === 429) {
            return null; // Rate limit - don't retry
          }
          if (attempt < maxRetries) {
            await new Promise((r) => setTimeout(r, 2000 * attempt));
            continue;
          }
          return null;
        }

        const aiData = await response.json();
        
        // DETAILED LOGGING
        console.log(`=== AI Response for session ${sessionNumero} (attempt ${attempt}) ===`);
        console.log(`Response keys:`, Object.keys(aiData));
        if (aiData.choices) {
          console.log(`Choices length:`, aiData.choices.length);
          console.log(`First choice:`, JSON.stringify(aiData.choices[0], null, 2));
        }

        // Try multiple response structures
        let content = aiData.choices?.[0]?.message?.content?.trim();
        
        if (!content && aiData.choices?.[0]?.message?.text) {
          content = aiData.choices[0].message.text.trim();
          console.log(`Session ${sessionNumero}: Used fallback: message.text`);
        }
        
        if (!content && aiData.choices?.[0]?.text) {
          content = aiData.choices[0].text.trim();
          console.log(`Session ${sessionNumero}: Used fallback: choices.text`);
        }
        
        if (!content && aiData.candidates?.[0]?.content?.parts?.[0]?.text) {
          content = aiData.candidates[0].content.parts[0].text.trim();
          console.log(`Session ${sessionNumero}: Used fallback: Gemini native format`);
        }

        if (content && content.length > 50) {
          console.log(`Session ${sessionNumero}: ✅ Got content (${content.length} chars)`);
          return content;
        }

        console.log(`Session ${sessionNumero}: Attempt ${attempt} returned empty/short content, retrying...`);
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 1500));
        }
      }

      console.error(`Session ${sessionNumero}: ❌ No valid content after ${maxRetries} attempts`);
      return null;
    }

    // Get sessions - either specific one or batch of unregenerated
    let sessionsQuery;
    if (sessionId) {
      // Regenerate specific session
      sessionsQuery = supabase
        .from("gratitude_sessions")
        .select("id, numero, titulo, descripcion")
        .eq("id", sessionId);
    } else {
      // Get sessions that haven't been regenerated yet
      sessionsQuery = supabase
        .from("gratitude_sessions")
        .select("id, numero, titulo, descripcion")
        .is("regenerated_at", null)
        .order("numero", { ascending: true })
        .limit(effectiveBatchSize);
    }

    const { data: sessions, error: fetchError } = await sessionsQuery;

    if (fetchError) {
      throw new Error(`Error fetching sessions: ${fetchError.message}`);
    }

    if (!sessions || sessions.length === 0) {
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

    for (const session of sessions) {
      try {
        const userPrompt = `Escribe una reflexión de gratitud para la sesión número ${session.numero} titulada: "${session.titulo}"

La reflexión debe:
1. Explicar brevemente este aspecto de la gratitud desde la fe cristiana
2. Incluir una cita bíblica que lo respalde (NO solo de Efesios, usa variedad)
3. Aplicarlo a una situación cotidiana del lector
4. Invitar a agradecer activamente por esta bendición

Recuerda: máximo 600 caracteres, párrafos fluidos, sin listas.`;

        const newDescription = await callAIWithRetry(userPrompt, session.numero);

        if (!newDescription) {
          results.push({
            numero: session.numero,
            titulo: session.titulo,
            status: "error",
            error: "La IA no generó contenido después de varios intentos",
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
