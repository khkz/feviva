import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

    const { 
      contentType = 'history',
      forceRegenerate = false,
      onlyPatrons = false,
      countryCode = null,
      offset = 0,
      limit = 10
    } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
      .from('calendar_saints')
      .select('id, name, description, prayer_id, category, country_code, feast_day, feast_month, tags')
      .order('feast_month', { ascending: true })
      .order('feast_day', { ascending: true });

    if (onlyPatrons) query = query.eq('category', 'patron_country');
    if (countryCode) query = query.eq('country_code', countryCode);

    // Use range for pagination
    query = query.range(offset, offset + limit - 1);

    const { data: saints, error: saintsError } = await query;

    if (saintsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch saints', details: saintsError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!saints || saints.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No more saints to process', processed: 0, offset }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${saints.length} saints (offset ${offset}) for ${contentType}, forceRegenerate=${forceRegenerate}`);

    const enfoques = [
      "Cuenta la historia como si estuvieras sentado con un amigo en un café, compartiendo algo que te fascina.",
      "Narra como si fuera el inicio de una novela histórica: arranca con una escena concreta, un momento decisivo.",
      "Escríbelo como una carta a alguien que nunca ha oído de este santo y necesita conocerlo.",
      "Cuenta la historia empezando por el final — por qué importa hoy — y luego retrocede al origen.",
      "Narra como un abuelo que le cuenta a su nieto la historia de alguien que admira profundamente.",
    ];

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

    const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

    const results = { processed: 0, generated: 0, skipped: 0, errors: [] as string[] };

    for (const saint of saints) {
      // Skip if already has content and not forcing
      if (!forceRegenerate && saint.description && saint.description.length > 100) {
        results.skipped++;
        results.processed++;
        continue;
      }

      const enfoque = enfoques[Math.floor(Math.random() * enfoques.length)];
      const countryInfo = saint.country_code 
        ? `Este santo es el patrono de ${saint.country_code}. Incluye información sobre por qué es el patrono de ese país.`
        : '';

      const userPrompt = `${enfoque}

Escribe sobre ${saint.name} para una app católica latinoamericana.

Datos conocidos:
- Festividad: ${saint.feast_day} de ${months[saint.feast_month - 1] || ''}
- Categoría: ${saint.category}
${saint.tags ? `- Etiquetas: ${saint.tags.join(', ')}` : ''}
${countryInfo}

Extensión: 300-500 palabras. Todo en prosa fluida, sin encabezados ni viñetas.`;

      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          results.errors.push(`${saint.name}: API ${response.status}`);
          console.error(`Error for ${saint.name}: ${response.status} ${errText}`);
          if (response.status === 429) {
            console.log("Rate limited, waiting 10s...");
            await delay(10000);
          }
          results.processed++;
          continue;
        }

        const aiData = await response.json();
        const content = aiData.choices?.[0]?.message?.content;

        if (content) {
          const { error: updateErr } = await supabase
            .from('calendar_saints')
            .update({ description: content.trim() })
            .eq('id', saint.id);

          if (updateErr) {
            results.errors.push(`${saint.name}: DB update failed`);
          } else {
            results.generated++;
            console.log(`✓ ${saint.name} (${content.length} chars)`);
          }
        } else {
          results.errors.push(`${saint.name}: No content generated`);
        }
      } catch (e) {
        results.errors.push(`${saint.name}: ${e instanceof Error ? e.message : 'Unknown'}`);
      }

      results.processed++;
      await delay(2000);
    }

    console.log(`Batch done. Generated: ${results.generated}, Skipped: ${results.skipped}, Errors: ${results.errors.length}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        ...results,
        offset,
        nextOffset: offset + saints.length,
        hasMore: saints.length === limit
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in batch-generate-saint-content:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
