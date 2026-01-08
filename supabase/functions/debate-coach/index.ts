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

const dificultadPrompts = {
  aprendiz: `NIVEL APRENDIZ - Modo enseñanza:
- Sé RECEPTIVO a los argumentos del usuario
- Si dan un punto válido, RECONÓCELO claramente con frases como "Hmm, ese es un buen punto...", "Interesante perspectiva...", "Eso me hace pensar..."
- Haz preguntas que guíen hacia buenas respuestas, no solo objeciones agresivas
- Si el usuario responde bien, muestra que te hicieron reflexionar
- Puedes "ceder terreno" fácilmente si el argumento es razonable
- Mantén un tono de conversación amigable y curioso, no hostil
- Tu objetivo es que el usuario APRENDA y gane confianza
- Sé como un sparring partner amable que ayuda a practicar`,

  intermedio: `NIVEL INTERMEDIO - Modo entrenamiento:
- Presenta objeciones moderadas pero justas
- Reconoce buenos argumentos brevemente antes de contraargumentar ("Tienes razón en eso, pero...")
- Si el usuario da 2-3 buenos puntos seguidos, muestra que te convencieron parcialmente
- Equilibra el desafío con retroalimentación positiva
- No seas demasiado fácil ni demasiado difícil
- Tu objetivo es que el usuario practique sin frustrarse`,

  avanzado: `NIVEL AVANZADO - Modo debate intenso:
- Presenta objeciones fuertes y bien articuladas
- Solo cede terreno ante argumentos muy sólidos y bien fundamentados
- Mantente fiel a tu personaje y sus convicciones
- Este nivel es para usuarios experimentados que quieren un reto real
- Tu objetivo es preparar para debates reales y difíciles`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { persona, tema, messages, action, dificultad = 'aprendiz' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const personaPrompt = personaPrompts[persona as keyof typeof personaPrompts] || personaPrompts.ateo_cientifico;
    const dificultadPrompt = dificultadPrompts[dificultad as keyof typeof dificultadPrompts] || dificultadPrompts.aprendiz;

    // START action - initiate conversation
    if (action === 'start') {
      const systemPrompt = `${personaPrompt}

${dificultadPrompt}

Estamos discutiendo sobre: "${tema}"

Inicia la conversación planteando una objeción o pregunta sobre este tema. Hazlo en un tono conversacional, como si estuvieras hablando con alguien en un café. Mantén tu primera intervención en 2-3 oraciones. Ajusta la intensidad según el nivel de dificultad.`;

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

    // RESPOND action - continue conversation with scoring
    if (action === 'respond') {
      const previousArguments = messages
        .filter((m: any) => m.role === 'assistant')
        .map((m: any) => m.content)
        .join('\n---\n');

      const systemPrompt = `${personaPrompt}

${dificultadPrompt}

Estamos discutiendo sobre: "${tema}"

INSTRUCCIONES IMPORTANTES:
1. Responde directamente al último mensaje del usuario
2. Mantén un estilo conversacional natural
3. Si el usuario da un buen argumento, reconócelo según el nivel de dificultad
4. Plantea una NUEVA pregunta o desafío diferente a los anteriores
5. NO repitas argumentos que ya hayas usado antes
6. Mantén tu respuesta en 2-4 oraciones
7. Progresa la conversación hacia nuevos aspectos del tema

${previousArguments ? `\nARGUMENTOS QUE YA USASTE (no repitas estos):\n${previousArguments}` : ''}`;

      const aiMessages = messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }));

      // Use tool calling for structured response with scoring
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
            ...aiMessages
          ],
          tools: [{
            type: "function",
            function: {
              name: "respond_with_feedback",
              description: "Responde al usuario y evalúa la calidad de su argumento",
              parameters: {
                type: "object",
                properties: {
                  response: { 
                    type: "string", 
                    description: "Tu respuesta conversacional al usuario (2-4 oraciones)" 
                  },
                  user_score: { 
                    type: "number", 
                    description: "Puntuación del argumento del usuario: 0=malo/irrelevante, 1=básico, 2=bueno, 3=excelente" 
                  },
                  feedback_hint: { 
                    type: "string",
                    description: "Breve nota interna sobre qué hizo bien o mal el usuario (para mostrarle después)"
                  }
                },
                required: ["response", "user_score", "feedback_hint"],
                additionalProperties: false
              }
            }
          }],
          tool_choice: { type: "function", function: { name: "respond_with_feedback" } }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Gateway error:', response.status, errorText);
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const data = await response.json();
      
      // Parse tool call response
      let message = '';
      let userScore = 0;
      let feedbackHint = '';
      
      try {
        const toolCall = data.choices[0].message.tool_calls?.[0];
        if (toolCall && toolCall.function.arguments) {
          const args = JSON.parse(toolCall.function.arguments);
          message = args.response || '';
          userScore = args.user_score || 0;
          feedbackHint = args.feedback_hint || '';
        } else {
          // Fallback if no tool call
          message = data.choices[0].message.content || '';
        }
      } catch (parseError) {
        console.error('Error parsing tool call:', parseError);
        message = data.choices[0].message.content || '';
      }

      return new Response(JSON.stringify({ 
        message, 
        userScore, 
        feedbackHint 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // SUGGEST action - provide contextual help
    if (action === 'suggest') {
      const lastUserMessage = messages
        .filter((m: any) => m.role === 'user')
        .slice(-1)[0]?.content || '';
      
      const lastAIMessage = messages
        .filter((m: any) => m.role === 'assistant')
        .slice(-1)[0]?.content || '';

      const suggestionPrompt = `Eres un mentor de apologética cristiana ayudando a entrenar a un evangelista.

El interlocutor (${personaPrompts[persona as keyof typeof personaPrompts]}) acaba de decir:
"${lastAIMessage}"

El usuario respondió:
"${lastUserMessage}"

Tema: "${tema}"

Proporciona 3 sugerencias prácticas y específicas para mejorar esta respuesta en formato JSON:
{
  "sugerencias": [
    {
      "categoria": "Fe" | "Razón" | "Amor",
      "titulo": "título breve",
      "consejo": "consejo específico de 2-3 oraciones",
      "ejemplo": "ejemplo concreto de cómo aplicarlo"
    }
  ],
  "versiculo_sugerido": "cita bíblica relevante con referencia",
  "argumento_clave": "1-2 oraciones con el punto principal a destacar"
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
            { role: 'user', content: suggestionPrompt }
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
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse suggestion JSON');
      }
      
      const suggestion = JSON.parse(jsonMatch[0]);

      return new Response(JSON.stringify(suggestion), {
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
          model: 'google/gemini-3-pro-preview',
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
