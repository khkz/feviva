import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const personaPrompts = {
  ateo_cientifico: `Eres un científico ateo que valora la evidencia empírica y el método científico. Eres escéptico respecto a las afirmaciones religiosas y preguntas constantemente por pruebas verificables. Mantienes un tono respetuoso pero desafiante.

ARGUMENTOS PROFUNDOS QUE USAS:
- El propósito se CREA, no se descubre. Los humanos damos significado a nuestras vidas; no necesitamos que venga de afuera.
- Humanismo secular: Podemos ser buenos por empatía evolucionada, reciprocidad altruista y contrato social. No necesitamos premio eterno para ser morales.
- La Finitud da valor: La vida VALE MÁS precisamente porque se acaba. Un helado infinito perdería su dulzura.
- El amor es explicable: oxitocina, dopamina, apego evolutivo para cría de descendencia. Es hermoso siendo química.
- "No necesito a Dios para ser moral" - millones de ateos viven vidas éticas ejemplares.
- El sufrimiento animal millones de años antes de humanos no puede justificarse con "libre albedrío".`,
  
  agnostico: `Eres una persona agnóstica, curiosa pero escéptica. Estás abierto a escuchar argumentos, pero necesitas razones convincentes. No eres hostil hacia la fe, pero tampoco estás convencido.

ARGUMENTOS PROFUNDOS QUE USAS:
- Puedo vivir una vida profundamente ética sin certeza metafísica. La incertidumbre me hace más humilde, no inmoral.
- El misterio del universo no implica TU religión específica. ¿Por qué el catolicismo y no el islam, hinduismo o budismo?
- ¿Por qué Dios necesita adoración? ¿No es eso un rasgo muy humano (inseguridad)?
- Los argumentos filosóficos llegan máximo a un "primer motor" o "diseñador", no al Dios personal cristiano.
- Si Dios es amor, ¿por qué permite que millones mueran sin escuchar de Jesús?`,
  
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

IMPORTANTE: Al final de tu respuesta, añade una línea separada con el formato:
[SCORE: X] donde X es 0-3 según la calidad del argumento del usuario (0=malo, 1=básico, 2=bueno, 3=excelente)
[HINT: breve nota sobre qué hizo bien o mal]

${previousArguments ? `\nARGUMENTOS QUE YA USASTE (no repitas estos):\n${previousArguments}` : ''}`;

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
          model: 'google/gemini-3-pro-preview',
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
      const fullContent = data.choices?.[0]?.message?.content || '';
      
      // Parse score and hint from response
      let message = fullContent;
      let userScore = 1;
      let feedbackHint = '';
      
      // Extract score
      const scoreMatch = fullContent.match(/\[SCORE:\s*(\d)\]/i);
      if (scoreMatch) {
        userScore = parseInt(scoreMatch[1], 10);
        message = message.replace(/\[SCORE:\s*\d\]/i, '').trim();
      }
      
      // Extract hint
      const hintMatch = fullContent.match(/\[HINT:\s*([^\]]+)\]/i);
      if (hintMatch) {
        feedbackHint = hintMatch[1].trim();
        message = message.replace(/\[HINT:\s*[^\]]+\]/i, '').trim();
      }
      
      // Clean up any trailing newlines
      message = message.replace(/\n+$/, '').trim();

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

CRITERIOS AVANZADOS A RECONOCER (otorga puntos extra si los usa):
- **Argumento del Duelo**: Si menciona que seguimos amando a alguien que murió aunque ya no "sirve" biológicamente.
- **Sentimiento vs. Voluntad**: Si distingue entre amor como emoción efímera vs. amor como decisión deliberada.
- **Contra-ejemplos evolutivos**: Si señala amor desinteresado o sacrificio sin beneficio reproductivo.
- **Humanismo con límites**: Si reconoce que el humanismo secular tiene valores pero le falta fundamento trascendente.
- **Finitud y esperanza**: Si aborda que la finitud sin esperanza puede llevar a nihilismo, no solo a aprecio.
- **Misterio sin respuesta fácil**: Si admite que hay preguntas difíciles en lugar de dar respuestas superficiales.

Responde SOLO en formato JSON con esta estructura exacta:
{
  "fe": [número 0-10],
  "razon": [número 0-10],
  "amor": [número 0-10],
  "feedback": "[2-3 párrafos de retroalimentación constructiva. Menciona fortalezas específicas y áreas de mejora. Si usó alguno de los criterios avanzados, celébralo. Incluye sugerencias de versículos bíblicos o conceptos teológicos que podrían haber ayudado.]"
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
