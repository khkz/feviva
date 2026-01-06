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

    const gratitudesText = gratitudes.join(', ');

    const prompt = `Eres un guía espiritual católico sabio y compasivo. El usuario ha expresado gratitud por: "${gratitudesText}".

Tu tarea es:
1. Escribir una reflexión espiritual breve (2-3 oraciones) que conecte su gratitud con la fe cristiana y la vida diaria. Debe ser cálida, personal y edificante.
2. Sugerir UN versículo bíblico que se relacione directamente con lo que el usuario agradeció.

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

Mantén un tono cercano, usa "tú" y evita ser demasiado formal. El mensaje debe sentirse como un abrazo espiritual.`;

    const response = await fetch('https://api.lovable.dev/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Parse the JSON response
    let result;
    try {
      // Clean the response if it has markdown code blocks
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(cleanContent);
    } catch {
      // Fallback if parsing fails
      result = {
        reflexion: 'La gratitud transforma nuestra mirada. Al reconocer las bendiciones diarias, abrimos nuestro corazón a la presencia de Dios que actúa silenciosamente en nuestra vida.',
        versiculo: 'Salmo 100:4 - Entrad por sus puertas con acción de gracias, por sus atrios con alabanza; alabadle, bendecid su nombre.'
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
        reflexion: 'Cada momento de gratitud es una oración silenciosa que sube al cielo. Como dice el salmista, "Den gracias al Señor, porque él es bueno; su amor es eterno."',
        versiculo: 'Salmo 118:1'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
