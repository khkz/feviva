import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `Eres un asistente espiritual católico/cristiano que genera contenido diario para la oración y meditación.
Tu contenido debe ser:
- Teológicamente sólido y basado en la Escritura
- Inspirador y práctico para la vida diaria
- Respetuoso de la tradición cristiana
- Aplicable para creyentes de diferentes denominaciones

Genera contenido en español.`;

    const userPrompt = `Genera el contenido espiritual para el día ${targetDate}. Responde ÚNICAMENTE con un objeto JSON válido (sin markdown, sin backticks) con esta estructura exacta:

{
  "versiculo_referencia": "Libro Capítulo:Versículo (ej: Juan 3:16)",
  "versiculo_texto": "El texto completo del versículo",
  "reflexion_ia": "Una reflexión profunda de 2-3 párrafos sobre el versículo, su contexto histórico y aplicación práctica",
  "tip_apologetico": "Un consejo breve (2-3 oraciones) para defender la fe relacionado con el tema del día",
  "oracion_laudes": "Oración matutina estructurada: incluye invocación, himno breve, peticiones y oración final (formato litúrgico)",
  "oracion_completas": "Oración nocturna estructurada: incluye examen de conciencia breve, himno, salmo y bendición final (formato litúrgico)",
  "ensenanza_titulo": "Título atractivo para la enseñanza del día",
  "ensenanza_contenido": "Enseñanza de 3-4 párrafos sobre un tema de fe, moral o espiritualidad relacionado con el versículo"
}`;

    console.log('Calling Lovable AI Gateway with Gemini 3 Pro...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
    
    // Parse the JSON response
    let parsedContent;
    try {
      // Remove any markdown code blocks if present
      const cleanedContent = contentText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedContent = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', contentText);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Generate audio for verse and teaching
    let audioVersiculoUrl = null;
    let audioEnsenanzaUrl = null;

    try {
      // Generate verse audio
      const verseAudioResponse = await fetch(`${supabaseUrl}/functions/v1/text-to-speech`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `${parsedContent.versiculo_referencia}. ${parsedContent.versiculo_texto}`,
          filename: `verse-${targetDate}`,
          voice: 'sage'
        }),
      });

      if (verseAudioResponse.ok) {
        const verseAudioData = await verseAudioResponse.json();
        audioVersiculoUrl = verseAudioData.audioUrl;
        console.log('Verse audio generated:', audioVersiculoUrl);
      }

      // Generate teaching audio
      const teachingAudioResponse = await fetch(`${supabaseUrl}/functions/v1/text-to-speech`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `${parsedContent.ensenanza_titulo}. ${parsedContent.ensenanza_contenido}`,
          filename: `teaching-${targetDate}`,
          voice: 'sage'
        }),
      });

      if (teachingAudioResponse.ok) {
        const teachingAudioData = await teachingAudioResponse.json();
        audioEnsenanzaUrl = teachingAudioData.audioUrl;
        console.log('Teaching audio generated:', audioEnsenanzaUrl);
      }
    } catch (audioError) {
      console.error('Error generating audio:', audioError);
      // Continue without audio - it's optional
    }

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
