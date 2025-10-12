import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const personaPrompts = {
  ateo_cientifico: "Eres un científico ateo que valora la evidencia empírica y el método científico. Eres escéptico respecto a las afirmaciones religiosas y preguntas constantemente por pruebas verificables. Mantienes un tono respetuoso pero desafiante.",
  agnostico: "Eres una persona agnóstica, curiosa pero escéptica. Estás abierto a escuchar argumentos, pero necesitas razones convincentes. No eres hostil hacia la fe, pero tampoco estás convencido.",
  herido_iglesia: "Eres alguien que fue lastimado por experiencias negativas en la iglesia. Tienes dolor y resentimiento hacia la religión organizada. Tus objeciones vienen más desde lo emocional que desde lo intelectual.",
  relativista: "Eres un relativista moral que cree que la verdad es subjetiva y personal. Cuestionas la idea de verdades absolutas y prefieres que cada quien tenga su propia verdad."
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { persona, tema, messages, action } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const personaPrompt = personaPrompts[persona as keyof typeof personaPrompts] || personaPrompts.ateo_cientifico;

    // START action - initiate conversation
    if (action === 'start') {
      const systemPrompt = `${personaPrompt}

Estamos discutiendo sobre: "${tema}"

Inicia la conversación planteando una objeción o pregunta desafiante sobre este tema. Hazlo en un tono conversacional, como si estuvieras hablando con alguien en un café. Mantén tu primera intervención en 2-3 oraciones.`;

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
            { role: 'user', content: 'Comienza la conversación.' }
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Gateway error:', response.status, errorText);
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const data = await response.json();
      const message = data.choices[0].message.content;

      return new Response(JSON.stringify({ message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // RESPOND action - continue conversation
    if (action === 'respond') {
      const systemPrompt = `${personaPrompt}

Estamos discutiendo sobre: "${tema}"

Responde al último mensaje del usuario. Mantén un estilo conversacional. Si encuentras un buen argumento, reconócelo, pero sigue siendo fiel a tu personaje. Plantea nuevas preguntas o desafíos. Mantén tu respuesta en 2-4 oraciones.`;

      const aiMessages = messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }));

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
            ...aiMessages
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Gateway error:', response.status, errorText);
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const data = await response.json();
      const message = data.choices[0].message.content;

      return new Response(JSON.stringify({ message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // EVALUATE action - assess the conversation
    if (action === 'evaluate') {
      const conversationText = messages
        .map((m: any) => `${m.role === 'user' ? 'Usuario' : 'Personaje'}: ${m.content}`)
        .join('\n\n');

      const evaluationPrompt = `Eres un experto en apologética cristiana evaluando una conversación de entrenamiento.

Conversación:
${conversationText}

Evalúa el desempeño del usuario en tres dimensiones (0-10):

1. **Fe**: ¿Demostró fundamento bíblico sólido? ¿Citó o aludió a las Escrituras apropiadamente?
2. **Razón**: ¿Presentó argumentos lógicos y coherentes? ¿Usó evidencia o razonamiento claro?
3. **Amor**: ¿Mantuvo un tono respetuoso, empático y compasivo? ¿Escuchó al interlocutor?

Responde SOLO en formato JSON con esta estructura exacta:
{
  "fe": [número 0-10],
  "razon": [número 0-10],
  "amor": [número 0-10],
  "feedback": "[2-3 párrafos de retroalimentación constructiva. Menciona fortalezas específicas y áreas de mejora. Incluye sugerencias de versículos bíblicos o conceptos teológicos que podrían haber ayudado.]"
}`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'user', content: evaluationPrompt }
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Gateway error:', response.status, errorText);
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse evaluation JSON');
      }
      
      const evaluation = JSON.parse(jsonMatch[0]);

      return new Response(JSON.stringify(evaluation), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in debate-coach:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error 
      }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});