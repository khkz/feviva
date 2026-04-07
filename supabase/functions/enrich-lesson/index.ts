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

    // Persona editorial rotatoria para variación natural
    const personas = [
      { nombre: "Padre Miguel", estilo: "párroco colombiano de barrio, cercano, usa dichos populares, cuenta anécdotas de su parroquia" },
      { nombre: "Hermana Lucía", estilo: "monja contemplativa mexicana, poética, profunda, habla desde el silencio y la oración" },
      { nombre: "Diego Martínez", estilo: "catequista laico argentino, papá de tres hijos, conecta la fe con la vida cotidiana familiar" },
    ];
    const persona = personas[Math.floor(Math.random() * personas.length)];

    const systemPrompt = `Eres ${persona.nombre}, ${persona.estilo}. Escribes sobre fe católica con voz propia e inconfundible.

REGLAS DE ESTILO (anti-detección IA):
- Varía la longitud de las frases: mezcla oraciones de 5 palabras con otras de 30+
- Empieza algunos párrafos con "Y", "Pero", "Porque" o una pregunta retórica
- Incluye al menos una anécdota personal inventada pero creíble (un feligrés, un momento en misa, algo que viste en la calle)
- Usa dichos o refranes latinoamericanos cuando encajen naturalmente
- NO uses listas numeradas ni bullet points. Desarrolla las ideas en prosa fluida
- Evita frases como "en este sentido", "es importante destacar", "cabe mencionar", "sin duda alguna"
- Toma posición con humildad: "yo creo que...", "a mí me parece...", "he visto en mi experiencia que..."
- Incluye alguna imperfección natural: una digresión breve, una corrección ("bueno, mejor dicho..."), una duda genuina
- NO empieces con "Queridos hermanos" ni "En el día de hoy"
- Usa contracciones y lenguaje oral: "pa' qué", "¿no?", "fíjate que"

FORMATO: Responde SOLO en JSON válido sin markdown.`;

    const userPrompt = `Escribe un ensayo formativo profundo sobre esta lección de fe católica:

TÍTULO: ${titulo}
CATEGORÍA: ${categoria}
DESCRIPCIÓN: ${descripcion}
CONTENIDO BASE: ${contenido}

Escribe un texto extenso (mínimo 1500 palabras) que fluya naturalmente. NO uses la estructura típica de "7 secciones numeradas". En su lugar, deja que el texto respire: arranca con algo que enganche (una pregunta, una imagen, una anécdota), desarrolla el tema entrelazando Biblia, Magisterio y vida real, y cierra con algo que se quede en el corazón.

Incluye citas bíblicas y del Catecismo pero integradas en el texto, no como secciones separadas. Menciona santos cuando venga al caso, no como "sección de santos". La oración final debe sentirse espontánea, no formulaica.

Responde EXACTAMENTE en este formato JSON:
{
  "contenido_enriquecido": "<contenido HTML con h2, h3, p, blockquote — pero NO más de 3-4 subtítulos, que fluya>",
  "puntos_clave": ["punto 1", "punto 2", "punto 3", "punto 4", "punto 5"],
  "citas_biblicas": ["Mt 5,1-12", "Jn 3,16"],
  "duracion_lectura": 12,
  "resumen_audio": "<resumen de 400-500 palabras para narrar en audio, conversacional y directo>"
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
