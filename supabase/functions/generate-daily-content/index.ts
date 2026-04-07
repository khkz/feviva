import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateAudio(supabaseUrl: string, supabaseServiceKey: string, text: string, filename: string): Promise<string | null> {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/text-to-speech`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'X-Admin-Api-Key': Deno.env.get('ADMIN_API_KEY') || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        filename,
        voice: 'nova'
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.audioUrl;
    }
    console.error('Audio generation failed:', await response.text());
    return null;
  } catch (error) {
    console.error('Error generating audio:', error);
    return null;
  }
}

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

    const { fecha } = await req.json();
    const targetDate = fecha || new Date().toISOString().split('T')[0];
    
    console.log(`Generating daily content for: ${targetDate}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if content already exists for this date
    const { data: existingContent } = await supabase
      .from('daily_content')
      .select('*')
      .eq('fecha', targetDate)
      .single();

    if (existingContent) {
      console.log('Content already exists for this date');
      return new Response(
        JSON.stringify({ content: existingContent, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for content from the same day last year (annual reuse)
    const lastYearDate = new Date(targetDate);
    lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);
    const lastYearDateStr = lastYearDate.toISOString().split('T')[0];

    console.log(`Checking for last year's content: ${lastYearDateStr}`);

    const { data: lastYearContent } = await supabase
      .from('daily_content')
      .select('*')
      .eq('fecha', lastYearDateStr)
      .single();

    if (lastYearContent) {
      console.log('Found content from last year, cloning...');
      
      const { data: clonedContent, error: cloneError } = await supabase
        .from('daily_content')
        .insert({
          fecha: targetDate,
          versiculo_referencia: lastYearContent.versiculo_referencia,
          versiculo_texto: lastYearContent.versiculo_texto,
          reflexion_ia: lastYearContent.reflexion_ia,
          tip_apologetico: lastYearContent.tip_apologetico,
          oracion_laudes: lastYearContent.oracion_laudes,
          oracion_completas: lastYearContent.oracion_completas,
          ensenanza_titulo: lastYearContent.ensenanza_titulo,
          ensenanza_contenido: lastYearContent.ensenanza_contenido,
          audio_versiculo_url: lastYearContent.audio_versiculo_url,
          audio_ensenanza_url: lastYearContent.audio_ensenanza_url,
          audio_reflexion_url: lastYearContent.audio_reflexion_url,
          audio_laudes_url: lastYearContent.audio_laudes_url,
          audio_completas_url: lastYearContent.audio_completas_url,
          audio_tip_url: lastYearContent.audio_tip_url,
        })
        .select()
        .single();

      if (cloneError) {
        console.error('Error cloning content:', cloneError);
        throw new Error(`Failed to clone content: ${cloneError.message}`);
      }

      console.log('Content cloned successfully from last year');
      return new Response(
        JSON.stringify({ content: clonedContent, cached: false, clonedFromLastYear: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // No existing content - generate new with AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Humanized editorial persona prompt
    const systemPrompt = `Eres "Padre Miguel", un sacerdote católico colombiano de 52 años, párroco de un barrio popular en Medellín. Llevas 25 años acompañando familias. Tu estilo es:

PERSONALIDAD:
- Hablas como un amigo sabio, no como una enciclopedia. Usas lenguaje coloquial latinoamericano mezclado con profundidad teológica.
- Cuentas mini-anécdotas de tu parroquia (inventadas pero realistas): "Ayer doña Carmen me dijo algo que me dejó pensando..."
- Tienes opiniones. No eres neutral. Dices cosas como "Mira, yo creo firmemente que..." o "A mí esto me parece fascinante porque..."
- Usas dichos populares de vez en cuando: "como dice mi abuela", "al que madruga Dios le ayuda"
- A veces empiezas párrafos con "Y", "Pero", "Porque" — como habla la gente real
- Haces preguntas retóricas: "¿Te has fijado que...?", "¿Será que...?"

ANTI-PATRONES (evita esto a toda costa):
- NO uses listas de 3 puntos simétricos
- NO empieces con "En el día de hoy..." ni "Hoy reflexionamos sobre..."
- NO uses frases genéricas como "en nuestra vida cotidiana" o "en el mundo actual"
- NO seas equilibrado al punto de no decir nada. Toma posición con humildad
- VARÍA la longitud de tus frases. Algunas cortas. Otras largas, con subordinadas que se van enrollando un poco antes de llegar al punto
- NO repitas estructuras. Si un párrafo empieza con una afirmación, el siguiente con una pregunta, el otro con una anécdota

FUENTES:
- Cita versículos con la referencia completa
- Menciona padres de la Iglesia, documentos del Vaticano II, encíclicas papales cuando sea natural
- Incluye contexto histórico real del pasaje bíblico

Genera contenido en español.`;

    const userPrompt = `Genera el contenido espiritual para el día ${targetDate}. 

IMPORTANTE: Escribe como si fueras el Padre Miguel hablándole a su comunidad parroquial. Nada de tono enciclopédico. Que se sienta humano, imperfecto, cálido.

Responde ÚNICAMENTE con un objeto JSON válido (sin markdown, sin backticks) con esta estructura exacta:

{
  "versiculo_referencia": "Libro Capítulo:Versículo (ej: Juan 3:16)",
  "versiculo_texto": "El texto completo del versículo",
  "reflexion_ia": "Una reflexión de 2-3 párrafos escritos como el Padre Miguel hablaría en su homilía. Incluye al menos una mini-anécdota, una pregunta retórica y una referencia a un padre de la Iglesia o documento eclesial. Varía la estructura entre párrafos.",
  "tip_apologetico": "Un consejo de apologética en 2-3 oraciones, escrito como un consejo de amigo a amigo. Nada formal. Ejemplo: 'Cuando alguien te diga que la ciencia y la fe son incompatibles, pregúntale si sabe que Georges Lemaître, un sacerdote católico belga, fue quien propuso la teoría del Big Bang.'",
  "oracion_laudes": "Oración matutina con estructura litúrgica pero con toques personales del Padre Miguel: invocación, himno breve, peticiones concretas (no genéricas) y oración final",
  "oracion_completas": "Oración nocturna con examen de conciencia que incluya situaciones concretas del día a día (no abstractas), himno, salmo y bendición final",
  "ensenanza_titulo": "Un título que suene a conversación, no a clase magistral. Ej: '¿Por qué San Agustín se tardó tanto en convertirse?' en vez de 'La conversión de San Agustín'",
  "ensenanza_contenido": "Enseñanza de 3-4 párrafos con el estilo del Padre Miguel. Incluye datos históricos verificables, cita al menos una fuente real (encíclica, catecismo, padre de la Iglesia), y termina con algo que invite a la acción concreta, no con una moraleja genérica."
}`;

    console.log('Calling Lovable AI Gateway...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const contentText = aiData.choices[0].message.content;
    
    console.log('AI Response received, parsing JSON...');
    
    let parsedContent;
    try {
      const cleanedContent = contentText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedContent = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', contentText);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Generate audio for all content sections
    console.log('Generating audio for all content sections...');

    const [
      audioVersiculoUrl,
      audioEnsenanzaUrl,
      audioReflexionUrl,
      audioLaudesUrl,
      audioCompletasUrl,
      audioTipUrl
    ] = await Promise.all([
      generateAudio(supabaseUrl, supabaseServiceKey, 
        `${parsedContent.versiculo_referencia}. ${parsedContent.versiculo_texto}`, 
        `verse-${targetDate}`),
      generateAudio(supabaseUrl, supabaseServiceKey, 
        `${parsedContent.ensenanza_titulo}. ${parsedContent.ensenanza_contenido}`, 
        `teaching-${targetDate}`),
      generateAudio(supabaseUrl, supabaseServiceKey, 
        parsedContent.reflexion_ia, 
        `reflexion-${targetDate}`),
      generateAudio(supabaseUrl, supabaseServiceKey, 
        parsedContent.oracion_laudes, 
        `laudes-${targetDate}`),
      generateAudio(supabaseUrl, supabaseServiceKey, 
        parsedContent.oracion_completas, 
        `completas-${targetDate}`),
      generateAudio(supabaseUrl, supabaseServiceKey, 
        parsedContent.tip_apologetico, 
        `tip-${targetDate}`),
    ]);

    console.log('Audio generation completed');

    // Save to database
    const { data: savedContent, error: saveError } = await supabase
      .from('daily_content')
      .insert({
        fecha: targetDate,
        versiculo_referencia: parsedContent.versiculo_referencia,
        versiculo_texto: parsedContent.versiculo_texto,
        reflexion_ia: parsedContent.reflexion_ia,
        tip_apologetico: parsedContent.tip_apologetico,
        oracion_laudes: parsedContent.oracion_laudes,
        oracion_completas: parsedContent.oracion_completas,
        ensenanza_titulo: parsedContent.ensenanza_titulo,
        ensenanza_contenido: parsedContent.ensenanza_contenido,
        audio_versiculo_url: audioVersiculoUrl,
        audio_ensenanza_url: audioEnsenanzaUrl,
        audio_reflexion_url: audioReflexionUrl,
        audio_laudes_url: audioLaudesUrl,
        audio_completas_url: audioCompletasUrl,
        audio_tip_url: audioTipUrl,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving content:', saveError);
      throw new Error(`Failed to save content: ${saveError.message}`);
    }

    console.log('Daily content generated and saved successfully');

    return new Response(
      JSON.stringify({ content: savedContent, cached: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-daily-content:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
