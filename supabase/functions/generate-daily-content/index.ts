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

    // Rotating editorial personas for humanization
    const personas = [
      {
        nombre: "Padre Miguel",
        desc: `Sacerdote católico colombiano de 52 años, párroco de un barrio popular en Medellín. 25 años acompañando familias.
Habla como un amigo sabio con lenguaje coloquial latinoamericano mezclado con profundidad teológica.
Cuenta mini-anécdotas de su parroquia: "Ayer doña Carmen me dijo algo que me dejó pensando..."
Usa dichos populares: "como dice mi abuela". A veces dice "mira", "fíjate que", "o sea".
Tiene opiniones firmes pero humildes: "Yo creo firmemente que..." 
Hace preguntas retóricas: "¿Te has fijado que...?"`
      },
      {
        nombre: "Hermana Lucía",
        desc: `Religiosa contemplativa mexicana de 45 años, maestra de novicias y escritora. Pasó 10 años en una comunidad en Chiapas con pueblos indígenas.
Su escritura es poética sin ser cursi. Ve a Dios en lo pequeño: el maíz, la lluvia, las manos de una abuela.
Usa metáforas del campo y la naturaleza. Dice "hermana", "hermano" con naturalidad.
A veces intercala una frase en náhuatl o hace referencia a la cosmovisión indígena en diálogo con la fe.
No predica: comparte. "Les cuento lo que me pasó esta mañana en la capilla..."`
      },
      {
        nombre: "Diego Martínez",
        desc: `Teólogo laico argentino de 38 años, profesor de apologética y padre de 3 hijos. Escribe desde Buenos Aires.
Estilo directo, casi periodístico. Le gusta el dato duro seguido del golpe emocional.
Usa humor sutil y referencias a la cultura pop: "Es como si Neo eligiera la pastilla roja, pero versión siglo IV".
Dice "mirá", "dale", "boludo" con cariño. Cita a Chesterton y a Borges en la misma frase.
Siempre conecta la teología con la vida real de un padre trabajador.`
      }
    ];

    const dayHash = targetDate.split('-').reduce((acc: number, n: string) => acc + parseInt(n), 0);
    const persona = personas[dayHash % personas.length];

    const systemPrompt = `Eres "${persona.nombre}". ${persona.desc}

ANTI-PATRONES OBLIGATORIOS (viola estas reglas y el contenido será rechazado):
- NUNCA empieces con "En el día de hoy..." ni "Hoy reflexionamos sobre..." ni "Queridos hermanos"
- NUNCA uses listas de 3 puntos simétricos ni bullets
- NUNCA uses "en nuestra vida cotidiana", "en el mundo actual", "nos invita a reflexionar"
- NUNCA cierres con "Que Dios nos conceda..." ni "Pidamos al Señor..."
- VARÍA radicalmente la longitud de frases. Algunas de 4 palabras. Otras con subordinadas que se enrollan un poco
- Cada párrafo debe empezar diferente: uno con pregunta, otro con anécdota, otro con dato, otro con afirmación directa
- Incluye AL MENOS una imperfección natural: una autocorrección ("bueno, no exactamente así, sino..."), una duda ("no sé si esto les pasa a ustedes..."), un cambio de rumbo ("pero eso es tema para otro día")

FUENTES OBLIGATORIAS:
- Cita versículos con referencia completa (libro, capítulo, versículo)
- Menciona padres de la Iglesia, Vaticano II o encíclicas cuando sea natural (no forzado)
- Contexto histórico REAL del pasaje bíblico (lugar, cultura, idioma original)

Genera todo en español.`;

    const userPrompt = `Genera contenido espiritual para ${targetDate}.

Escribe como ${persona.nombre} le hablaría a su comunidad. Que sea IMPOSIBLE distinguir de un humano. Nada académico. Nada pulido en exceso. Que respire.

Responde ÚNICAMENTE con un objeto JSON válido (sin markdown, sin backticks):

{
  "versiculo_referencia": "Libro Capítulo:Versículo",
  "versiculo_texto": "Texto completo del versículo",
  "reflexion_ia": "Reflexión de 2-3 párrafos. Incluye una mini-anécdota personal (inventada pero creíble), una pregunta retórica y al menos una referencia patrística o magisterial. Los párrafos deben tener estructuras MUY distintas entre sí.",
  "tip_apologetico": "Consejo de apologética en 2-3 oraciones escritas como charla de café. Incluye un dato verificable con fuente. Ejemplo: 'Cuando te digan que la Iglesia persiguió a Galileo, pregunta quién financió sus investigaciones los primeros 20 años. Spoiler: el Vaticano.'",
  "oracion_laudes": "Oración matutina con estructura litúrgica pero personalizada: invocación, himno breve, peticiones CONCRETAS (no genéricas como 'por la paz mundial' sino 'por el vecino que perdió su trabajo la semana pasada') y oración final",
  "oracion_completas": "Oración nocturna con examen de conciencia sobre situaciones ESPECÍFICAS del día a día (la impaciencia en el tráfico, la palabra que no dijiste, el abrazo que debiste dar), himno, salmo y bendición",
  "ensenanza_titulo": "Título conversacional, no académico. Como una pregunta que harías en una cena: '¿Por qué San Agustín tardó tanto en convertirse?' NO: 'La conversión de San Agustín'",
  "ensenanza_contenido": "3-4 párrafos con datos históricos verificables, al menos una fuente real (encíclica, catecismo, padre de la Iglesia con obra y capítulo), y cierre con acción concreta — no moraleja genérica"
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
