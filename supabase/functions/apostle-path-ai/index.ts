import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STAGE_NAMES = ['', 'Cimientos', 'Defensor', 'Debatidor', 'Misionero', 'Apóstol'];

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

    const { etapa, tipo, progress, activitiesCompleted } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const stageName = STAGE_NAMES[etapa] || 'Cimientos';
    
    let systemPrompt = '';
    let userPrompt = '';

    switch (tipo) {
      case 'reflexion':
        systemPrompt = `Eres un director espiritual católico sabio, cálido y compasivo. Tu rol es guiar a los fieles en su camino de fe con profundidad teológica pero accesible. Hablas en español y usas un tono paternal pero respetuoso.`;
        userPrompt = `El usuario está en la etapa "${stageName}" de la Ruta del Apóstol (formación apologética).
Ha completado ${activitiesCompleted} actividades hasta ahora.

Genera una reflexión espiritual personalizada que:
1. Reconozca su progreso en esta etapa
2. Ofrezca 2-3 preguntas de reflexión profundas pero accesibles relacionadas con la apologética y esta etapa
3. Incluya una breve meditación o cita bíblica relevante
4. Termine con palabras de ánimo para continuar

Mantén la reflexión en 150-200 palabras.`;
        break;

      case 'quiz':
        systemPrompt = `Eres un maestro de apologética católica que evalúa el aprendizaje de manera constructiva y educativa. Formulas preguntas que ayudan a consolidar el conocimiento.`;
        userPrompt = `El usuario está en la etapa "${stageName}" de su formación apologética.

Genera un quiz de 3 preguntas de comprensión sobre los temas de esta etapa:
${etapa === 1 ? '- Existencia de Dios\n- Confiabilidad de la Biblia' : ''}
${etapa === 2 ? '- Jesús histórico\n- La Resurrección\n- Fe y Ciencia\n- Salvación por Gracia' : ''}
${etapa === 3 ? '- El problema del mal\n- La Trinidad' : ''}
${etapa === 4 ? '- Evangelización práctica\n- Testimonio personal' : ''}
${etapa === 5 ? '- Argumentos avanzados\n- Objeciones complejas' : ''}

Formato:
1. [Pregunta de opción múltiple con 4 opciones, marca la correcta con ✓]
2. [Pregunta de opción múltiple]
3. [Pregunta de opción múltiple]

Después de cada pregunta, incluye una breve explicación de la respuesta correcta.`;
        break;

      case 'analisis':
        systemPrompt = `Eres un coach de debate apologético que analiza el desempeño de manera constructiva, identificando fortalezas y áreas de mejora.`;
        userPrompt = `El usuario ha participado en debates apologéticos en la Ruta del Apóstol.
Está en la etapa "${stageName}".
Actividades completadas: ${activitiesCompleted}

Proporciona un análisis breve de su progreso en habilidades de debate que incluya:
1. Posibles fortalezas basadas en su nivel (etapa ${etapa})
2. Áreas específicas para mejorar
3. Consejos prácticos para el siguiente debate
4. Palabras de motivación

Mantén el análisis en 120-150 palabras y sé específico con los consejos.`;
        break;

      case 'consejo':
      default:
        systemPrompt = `Eres un guía espiritual y mentor en apologética católica. Das consejos prácticos y motivadores para el crecimiento en la fe.`;
        userPrompt = `El usuario está en la etapa "${stageName}" (etapa ${etapa} de 5) de la Ruta del Apóstol.
Puntos acumulados: ${progress?.puntos_ruta || 0}
Actividades completadas: ${activitiesCompleted}
Última actividad: ${progress?.fecha_ultima_actividad || 'Nunca'}

Dale un consejo personalizado breve (2-3 oraciones) sobre:
- Qué debería hacer a continuación
- Por qué es importante esta etapa
- Una palabra de ánimo

Sé conciso y motivador.`;
        break;
    }

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
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Demasiadas solicitudes. Intenta de nuevo en unos segundos.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos de IA agotados.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const reflection = data.choices?.[0]?.message?.content || '';

    return new Response(JSON.stringify({ reflection, tipo }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in apostle-path-ai:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
