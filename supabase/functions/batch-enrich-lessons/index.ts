import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnrichResult {
  success: boolean;
  lessonId: string;
  error?: string;
  contenido_enriquecido?: string;
  duracion_lectura?: number;
}

function sanitizeJsonString(str: string): string {
  // Remove control characters
  let cleaned = str.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  // Remove markdown code blocks
  cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  return cleaned.trim();
}

async function enrichLesson(lesson: any, LOVABLE_API_KEY: string): Promise<EnrichResult> {
  const { id, titulo, descripcion, contenido, categoria } = lesson;
  
  console.log(`Starting enrichment for: ${titulo}`);
  
  const systemPrompt = `Eres un teólogo católico experto y educador espiritual. Tu misión es crear contenido formativo profundo, inspirador y accesible para fieles católicos que desean crecer en su fe.

Tu estilo debe ser:
- Cálido y pastoral, como un buen sacerdote o catequista
- Profundo pero accesible, evitando jerga excesiva
- Rico en referencias bíblicas y del Magisterio
- Práctico, con aplicaciones para la vida diaria
- Inspirador, que mueva al corazón y a la acción

IMPORTANTE: Responde SOLO en formato JSON válido. No uses markdown, no uses comillas simples, asegúrate de escapar correctamente las comillas dobles dentro del texto.`;

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

IMPORTANTE: El contenido HTML no debe contener comillas dobles sin escapar. Usa comillas simples para atributos HTML o escapa las comillas dobles.

Responde EXACTAMENTE en este formato JSON:
{
  "contenido_enriquecido": "<contenido HTML completo con etiquetas h2, h3, p, blockquote, ul, li, strong, em>",
  "puntos_clave": ["punto 1", "punto 2", "punto 3", "punto 4", "punto 5"],
  "citas_biblicas": ["Mt 5,1-12", "Jn 3,16"],
  "duracion_lectura": 12,
  "resumen_audio": "<resumen de 400-500 palabras optimizado para ser narrado en audio, fluido y natural>"
}`;

  try {
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
      console.error(`AI Gateway error for ${titulo}:`, response.status, errorText);
      return { success: false, lessonId: id, error: `AI Gateway error: ${response.status}` };
    }

    const aiData = await response.json();
    const rawContent = aiData.choices?.[0]?.message?.content;

    if (!rawContent) {
      return { success: false, lessonId: id, error: 'No content received from AI' };
    }

    // Parse JSON from response with improved sanitization
    let parsedContent;
    try {
      const cleanJson = sanitizeJsonString(rawContent);
      parsedContent = JSON.parse(cleanJson);
    } catch (parseError) {
      // Try to extract JSON object
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const cleanMatch = sanitizeJsonString(jsonMatch[0]);
          parsedContent = JSON.parse(cleanMatch);
        } catch {
          console.error(`JSON parse error for ${titulo}:`, parseError);
          return { success: false, lessonId: id, error: 'Could not parse AI response as JSON' };
        }
      } else {
        return { success: false, lessonId: id, error: 'Could not find JSON in AI response' };
      }
    }

    return { 
      success: true, 
      lessonId: id, 
      ...parsedContent 
    };
  } catch (error) {
    console.error(`Error enriching ${titulo}:`, error);
    return { success: false, lessonId: id, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Get limit from request body (default: 2 to avoid timeout)
    let limit = 2;
    try {
      const body = await req.json();
      limit = body.limit || 2;
    } catch {
      // Use default limit
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get count of all pending lessons first
    const { count: totalPending } = await supabase
      .from('library_lessons')
      .select('*', { count: 'exact', head: true })
      .is('contenido_enriquecido', null);

    // Get limited batch of lessons without enriched content
    const { data: lessons, error: fetchError } = await supabase
      .from('library_lessons')
      .select('*')
      .is('contenido_enriquecido', null)
      .order('orden')
      .limit(limit);

    if (fetchError) {
      throw new Error(`Failed to fetch lessons: ${fetchError.message}`);
    }

    if (!lessons || lessons.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No lessons to enrich', 
          processed: 0,
          remaining: 0,
          hasMore: false 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing batch of ${lessons.length} lessons (${totalPending} total pending)`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Process lessons sequentially to avoid rate limits
    for (const lesson of lessons) {
      console.log(`Processing: ${lesson.titulo}`);
      
      const result = await enrichLesson(lesson, LOVABLE_API_KEY);
      
      if (result.success) {
        // Save to database
        const { error: updateError } = await supabase
          .from('library_lessons')
          .update({
            contenido_enriquecido: result.contenido_enriquecido,
            duracion_estimada: result.duracion_lectura || 10,
          })
          .eq('id', result.lessonId);

        if (updateError) {
          console.error(`Failed to save ${lesson.titulo}:`, updateError);
          results.push({ lessonId: result.lessonId, titulo: lesson.titulo, success: false, error: updateError.message });
          errorCount++;
        } else {
          console.log(`Successfully enriched: ${lesson.titulo}`);
          results.push({ lessonId: result.lessonId, titulo: lesson.titulo, success: true });
          successCount++;
        }
      } else {
        results.push({ lessonId: result.lessonId, titulo: lesson.titulo, success: false, error: result.error });
        errorCount++;
      }

      // Add delay between requests to avoid rate limits
      if (lessons.indexOf(lesson) < lessons.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    const remaining = (totalPending || 0) - successCount;
    console.log(`Batch complete. Success: ${successCount}, Errors: ${errorCount}, Remaining: ${remaining}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${lessons.length} lessons`,
        successCount,
        errorCount,
        processed: successCount,
        remaining: remaining,
        hasMore: remaining > 0,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in batch-enrich-lessons function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});