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
    // Auth check
    const adminKey = req.headers.get('X-Admin-Api-Key');
    const ADMIN_KEY = Deno.env.get('ADMIN_API_KEY');
    const authHeader = req.headers.get('Authorization');
    const isInternalCall = req.headers.get('X-Internal-Call') === 'true';
    
    if (isInternalCall && adminKey && ADMIN_KEY && adminKey === ADMIN_KEY) { /* OK */ }
    else if (adminKey && ADMIN_KEY && adminKey === ADMIN_KEY) { /* Admin OK */ }
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
      limit = 5,
      autoChain = false  // When true, auto-triggers next batch
    } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
      .from('calendar_saints')
      .select('id, name, description, prayer_id, category, country_code, feast_day, feast_month, tags')
      .order('feast_month', { ascending: true })
      .order('feast_day', { ascending: true })
      .range(offset, offset + limit - 1);

    if (onlyPatrons) query = query.eq('category', 'patron_country');
    if (countryCode) query = query.eq('country_code', countryCode);

    const { data: saints, error: saintsError } = await query;

    if (saintsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch saints', details: saintsError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!saints || saints.length === 0) {
      console.log(`✅ ALL DONE! Processed all saints up to offset ${offset}`);
      return new Response(
        JSON.stringify({ success: true, message: 'All saints processed', processed: 0, offset, complete: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Batch offset=${offset}] Processing ${saints.length} saints, forceRegenerate=${forceRegenerate}`);

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
          console.error(`✗ ${saint.name}: ${response.status}`);
          if (response.status === 429) await delay(10000);
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
            results.errors.push(`${saint.name}: DB error`);
          } else {
            results.generated++;
            console.log(`✓ ${saint.name} (${content.length} chars)`);
          }
        }
      } catch (e) {
        results.errors.push(`${saint.name}: ${e instanceof Error ? e.message : 'Unknown'}`);
      }

      results.processed++;
      await delay(1500);
    }

    const nextOffset = offset + saints.length;
    const hasMore = saints.length === limit;

    console.log(`[Batch offset=${offset}] Done: ${results.generated} generated, ${results.errors.length} errors. Next: ${nextOffset}`);

    // Auto-chain: trigger next batch in background
    if (autoChain && hasMore) {
      const selfUrl = `${supabaseUrl}/functions/v1/batch-generate-saint-content`;
      fetch(selfUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': Deno.env.get('SUPABASE_ANON_KEY')!,
          'X-Admin-Api-Key': ADMIN_KEY || '',
          'X-Internal-Call': 'true',
        },
        body: JSON.stringify({
          contentType, forceRegenerate, onlyPatrons, countryCode,
          offset: nextOffset, limit, autoChain: true
        }),
      }).catch(err => console.error('Auto-chain failed:', err));
      
      console.log(`🔄 Auto-chained next batch at offset ${nextOffset}`);
    }

    return new Response(
      JSON.stringify({ success: true, ...results, offset, nextOffset, hasMore }),
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
