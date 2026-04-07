import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
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

    const { saintId, forceRegenerate = false } = await req.json();

    if (!saintId) {
      return new Response(
        JSON.stringify({ error: 'saintId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch saint data
    const { data: saint, error: saintError } = await supabase
      .from('calendar_saints')
      .select('*')
      .eq('id', saintId)
      .single();

    if (saintError || !saint) {
      return new Response(
        JSON.stringify({ error: 'Saint not found', details: saintError }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Skip if already has description and not forcing regeneration
    if (saint.description && saint.description.length > 100 && !forceRegenerate) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Saint already has description',
          saintId: saint.id,
          skipped: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const countryInfo = saint.country_code 
      ? `Este santo es el patrono de ${saint.country_code}. Incluye información sobre por qué es el patrono de ese país y cómo se celebra su festividad allí.`
      : '';

    // Variación de enfoque narrativo para evitar patrones repetitivos
    const enfoques = [
      "Cuenta la historia como si estuvieras sentado con un amigo en un café, compartiendo algo que te fascina.",
      "Narra como si fuera el inicio de una novela histórica: arranca con una escena concreta, un momento decisivo.",
      "Escríbelo como una carta a alguien que nunca ha oído de este santo y necesita conocerlo.",
      "Cuenta la historia empezando por el final — por qué importa hoy — y luego retrocede al origen.",
      "Narra como un abuelo que le cuenta a su nieto la historia de alguien que admira profundamente.",
    ];
    const enfoque = enfoques[Math.floor(Math.random() * enfoques.length)];

    const systemPrompt = `Eres un narrador de historias de santos. NO escribes fichas enciclopédicas. Cuentas vidas humanas con sus luces, sombras, dudas y grandezas.

REGLAS ANTI-IA:
- NUNCA empieces con "[Nombre] fue un/una..." — eso es Wikipedia, no narración
- Varía la longitud de las oraciones. Algunas muy cortas. Otras que se extiendan con detalles sensoriales
- Incluye al menos un detalle humano concreto: qué comía, cómo era su risa, una manía, un defecto
- Usa preguntas retóricas: "¿Te imaginas...?", "¿Qué harías tú en su lugar?"
- Permite alguna digresión breve que haga el texto sentirse vivo
- Evita: "cabe destacar", "es importante señalar", "sin duda alguna", "en definitiva"
- NO uses listas, viñetas ni estructura numerada
- Español latinoamericano natural, no académico`;

    const userPrompt = `${enfoque}

Escribe sobre ${saint.name} para una app católica latinoamericana.

Datos conocidos:
- Festividad: ${saint.feast_day} de ${getMonthName(saint.feast_month)}
- Categoría: ${saint.category}
${saint.tags ? `- Etiquetas: ${saint.tags.join(', ')}` : ''}
${countryInfo}

Extensión: 300-500 palabras. Todo en prosa fluida, sin encabezados ni viñetas. Que al terminar de leer, el lector sienta que conoció a una persona real, no que leyó un artículo.`;

    console.log(`Generating history for saint: ${saint.name}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded, please try again later' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required for AI service' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI API error', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const generatedHistory = aiResponse.choices?.[0]?.message?.content;

    if (!generatedHistory) {
      return new Response(
        JSON.stringify({ error: 'No content generated by AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update saint with generated history
    const { error: updateError } = await supabase
      .from('calendar_saints')
      .update({ description: generatedHistory.trim() })
      .eq('id', saintId);

    if (updateError) {
      console.error("Error updating saint:", updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update saint', details: updateError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully generated history for: ${saint.name}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        saintId: saint.id,
        saintName: saint.name,
        descriptionLength: generatedHistory.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in generate-saint-history:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getMonthName(month: number): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[month - 1] || '';
}
