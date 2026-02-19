import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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

    const { lessonId, titulo, descripcion, contenido, categoria } = await req.json();

    if (!lessonId || !titulo) {
      throw new Error('lessonId and titulo are required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Enriching lesson: ${titulo}`);

    const systemPrompt = `Eres un teólogo católico experto y educador espiritual. Tu misión es crear contenido formativo profundo, inspirador y accesible para fieles católicos que desean crecer en su fe.

Tu estilo debe ser:
- Cálido y pastoral, como un buen sacerdote o catequista
- Profundo pero accesible, evitando jerga excesiva
- Rico en referencias bíblicas y del Magisterio
- Práctico, con aplicaciones para la vida diaria
- Inspirador, que mueva al corazón y a la acción

IMPORTANTE: Responde SOLO en formato JSON válido sin markdown.`;

    const userPrompt = `Enriquece esta lección de la Biblioteca de Fe católica:

TÍTULO: ${titulo}
CATEGORÍA: ${categoria}
DESCRIPCIÓN ACTUAL: ${descripcion}
CONTENIDO BASE: ${contenido}

Genera un contenido MUCHO más extenso y profundo (mínimo 1500 palabras) que incluya:

1. **Introducción contextual** (2-3 párrafos): Por qué este tema es importante para el católico de hoy
2. **Fundamento bíblico** (3-4 párrafos): Citas bíblicas relevantes con explicación
3. **Enseñanza del Magisterio** (2-3 párrafos): Catecismo, encíclicas, documentos conciliares
4. **Desarrollo teológico** (4-5 párrafos): Explicación profunda del tema
5. **Testimonios de santos** (2-3 párrafos): Ejemplos de santos relacionados con el tema
6. **Aplicación práctica** (3-4 párrafos): Cómo vivir esto en el día a día
7. **Oración final**: Una oración relacionada con el tema

Responde EXACTAMENTE en este formato JSON:
{
  "contenido_enriquecido": "<contenido HTML completo con etiquetas h2, h3, p, blockquote, ul, li, strong, em>",
  "puntos_clave": ["punto 1", "punto 2", "punto 3", "punto 4", "punto 5"],
  "citas_biblicas": ["Mt 5,1-12", "Jn 3,16"],
  "duracion_lectura": 12,
  "resumen_audio": "<resumen de 400-500 palabras optimizado para ser narrado en audio, fluido y natural>"
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const rawContent = aiData.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error('No content received from AI');
    }

    console.log('Raw AI response length:', rawContent.length);

    // Parse JSON from response
    let parsedContent;
    try {
      // Clean up potential markdown wrappers
      let cleanJson = rawContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      parsedContent = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Try to extract JSON from the response
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse AI response as JSON');
      }
    }

    // Save to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: updateError } = await supabase
      .from('library_lessons')
      .update({
        contenido_enriquecido: parsedContent.contenido_enriquecido,
        duracion_estimada: parsedContent.duracion_lectura || 10,
      })
      .eq('id', lessonId);

    if (updateError) {
      console.error('Database update error:', updateError);
    }

    console.log('Lesson enriched successfully');

    return new Response(
      JSON.stringify({
        success: true,
        contenido_enriquecido: parsedContent.contenido_enriquecido,
        puntos_clave: parsedContent.puntos_clave,
        citas_biblicas: parsedContent.citas_biblicas,
        duracion_lectura: parsedContent.duracion_lectura,
        resumen_audio: parsedContent.resumen_audio,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in enrich-lesson function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
