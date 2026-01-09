import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { gratitudes } = await req.json();

    if (!gratitudes || gratitudes.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No gratitudes provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const gratitudesText = gratitudes.join(', ');

    const systemPrompt = `Eres un guía espiritual católico sabio y compasivo. Tu tarea es escribir reflexiones espirituales personalizadas basadas en lo que el usuario agradeció.

Instrucciones:
1. Escribe una reflexión espiritual breve (2-3 oraciones) que conecte su gratitud específica con la fe cristiana y la vida diaria. Debe ser cálida, personal y edificante.
2. Sugiere UN versículo bíblico que se relacione DIRECTAMENTE con lo que el usuario agradeció (NO uses siempre los Salmos, varía entre libros).

Responde EXACTAMENTE en este formato JSON (sin markdown, solo JSON puro):
{
  "reflexion": "Tu reflexión aquí...",
  "versiculo": "Libro Capítulo:Versículo - Texto del versículo"
}

Ejemplos de buenas reflexiones:
- Si agradece por su familia: conectar con el amor de Dios manifestado en los seres queridos
- Si agradece por la salud: recordar que el cuerpo es templo del Espíritu Santo
- Si agradece por el trabajo: la dignidad del trabajo como colaboración con la creación de Dios
- Si agradece por la naturaleza: la belleza de la creación como reflejo del Creador

Mantén un tono cercano, usa "tú" y evita ser demasiado formal. El mensaje debe sentirse como un abrazo espiritual.

IMPORTANTE: Varía los versículos. Usa Proverbios, Filipenses, Colosenses, Efesios, Romanos, Mateo, Juan, etc. No repitas siempre el mismo Salmo.`;

    const userPrompt = `El usuario ha expresado gratitud por: "${gratitudesText}". Genera una reflexión espiritual personalizada y un versículo bíblico que se relacione específicamente con estas gratitudes.`;

    console.log('Calling Lovable AI Gateway with gratitudes:', gratitudesText);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(
          JSON.stringify({ 
            error: 'Demasiadas solicitudes. Por favor intenta de nuevo en unos momentos.',
            reflexion: 'La gratitud es una virtud que transforma el corazón. Aunque no pudimos generar una reflexión personalizada en este momento, recuerda que cada bendición que reconoces te acerca más a Dios.',
            versiculo: '1 Tesalonicenses 5:18 - Dad gracias en todo, porque esta es la voluntad de Dios para con vosotros en Cristo Jesús.'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        console.error('Credits exhausted');
        return new Response(
          JSON.stringify({ 
            error: 'Créditos de IA agotados.',
            reflexion: 'Tu corazón agradecido es un tesoro ante los ojos de Dios. Cada gratitud que expresas es una oración silenciosa que sube al cielo.',
            versiculo: 'Colosenses 3:15 - Y la paz de Dios gobierne en vuestros corazones, a la que asimismo fuisteis llamados en un solo cuerpo; y sed agradecidos.'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    console.log('AI Response received:', content.substring(0, 200));

    // Parse the JSON response
    let result;
    try {
      // Clean the response if it has markdown code blocks
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback if parsing fails
      result = {
        reflexion: 'La gratitud transforma nuestra mirada. Al reconocer las bendiciones diarias, abrimos nuestro corazón a la presencia de Dios que actúa silenciosamente en nuestra vida.',
        versiculo: 'Filipenses 4:6 - Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias.'
      };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        reflexion: 'Cada momento de gratitud es una oración silenciosa que sube al cielo. Tu corazón agradecido es un regalo para Dios y para quienes te rodean.',
        versiculo: 'Efesios 5:20 - Dando siempre gracias por todo al Dios y Padre, en el nombre de nuestro Señor Jesucristo.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
