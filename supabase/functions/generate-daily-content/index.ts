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
      
      // Clone the content with new date
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

    console.log('Audio generation completed:', {
      audioVersiculoUrl: !!audioVersiculoUrl,
      audioEnsenanzaUrl: !!audioEnsenanzaUrl,
      audioReflexionUrl: !!audioReflexionUrl,
      audioLaudesUrl: !!audioLaudesUrl,
      audioCompletasUrl: !!audioCompletasUrl,
      audioTipUrl: !!audioTipUrl,
    });

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
