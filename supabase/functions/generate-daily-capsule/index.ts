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
    // Auth check
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

    // Check if capsule already exists
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

    // Generate capsule with AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const categories = ["tech_vs_fe", "dato_historico", "pregunta_provocadora"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    const prompt = `Genera una "cápsula del día" para una app católica llamada ElRugido. La cápsula es un micro-dato viral que conecta tecnología/IA con fe y humanidad.

Categoría: ${randomCategory}

Reglas:
- El dato debe ser REAL y verificable (incluye la fuente)
- Máximo 2 frases para el dato
- La reflexión debe ser de 2-3 frases máximo, tono conversacional y esperanzador
- No seas preachy ni moralista. Sé inteligente, sorprendente, humano
- Usa datos concretos (números, porcentajes, fechas)
- El emoji debe representar visualmente el tema
- El color debe ser un hex que combine con el tema

Responde SOLO en JSON con este formato exacto:
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
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Eres un experto en datos sobre tecnología y fe. Generas micro-contenido viral, verificable y con fuentes reales." },
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

    // Insert into database
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
