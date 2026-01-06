import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Crear cliente Supabase con service role para bypass RLS
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface ProcessingJob {
  id: string;
  job_type: string;
  target_table: string;
  target_id: string;
  target_title: string | null;
  status: string;
  attempts: number;
  max_attempts: number;
}

// ============ UTILIDADES DE JOB ============

async function markJobProcessing(jobId: string): Promise<void> {
  await supabase
    .from('processing_jobs')
    .update({ 
      status: 'processing', 
      started_at: new Date().toISOString(),
      attempts: supabase.rpc('increment_attempts', { job_id: jobId })
    })
    .eq('id', jobId);
  
  // Incrementar attempts manualmente
  const { data: job } = await supabase
    .from('processing_jobs')
    .select('attempts')
    .eq('id', jobId)
    .single();
  
  await supabase
    .from('processing_jobs')
    .update({ attempts: (job?.attempts || 0) + 1 })
    .eq('id', jobId);
}

async function markJobCompleted(jobId: string, resultData: Record<string, unknown>, processingTimeMs: number): Promise<void> {
  await supabase
    .from('processing_jobs')
    .update({ 
      status: 'completed',
      completed_at: new Date().toISOString(),
      result_data: resultData,
      processing_time_ms: processingTimeMs,
      error_message: null
    })
    .eq('id', jobId);
}

async function markJobError(jobId: string, errorMessage: string, attempts: number, maxAttempts: number): Promise<void> {
  const newStatus = attempts >= maxAttempts ? 'error' : 'pending';
  
  await supabase
    .from('processing_jobs')
    .update({ 
      status: newStatus,
      error_message: errorMessage,
      completed_at: newStatus === 'error' ? new Date().toISOString() : null
    })
    .eq('id', jobId);
}

async function logJobAttempt(jobId: string, attemptNumber: number, status: 'started' | 'success' | 'error', message: string, metadata?: Record<string, unknown>): Promise<void> {
  await supabase
    .from('processing_logs')
    .insert({
      job_id: jobId,
      attempt_number: attemptNumber,
      status,
      message,
      metadata
    });
}

// ============ PROCESADORES POR TIPO ============

async function generateSleepTTS(targetId: string): Promise<{ audioUrl: string }> {
  console.log(`[sleep_tts] Generando audio para historia: ${targetId}`);
  
  // Obtener la historia
  const { data: story, error: storyError } = await supabase
    .from('sleep_stories')
    .select('*')
    .eq('id', targetId)
    .single();
  
  if (storyError || !story) {
    throw new Error(`Historia no encontrada: ${storyError?.message}`);
  }
  
  // Generar audio con OpenAI TTS
  const text = story.contenido;
  const chunks: ArrayBuffer[] = [];
  const chunkSize = 4000; // Caracteres por chunk
  
  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize);
    console.log(`[sleep_tts] Procesando chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(text.length / chunkSize)}`);
    
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1', // Modelo más rápido
        input: chunk,
        voice: 'nova', // Voz suave para dormir
        response_format: 'mp3',
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI TTS error: ${errorText}`);
    }
    
    chunks.push(await response.arrayBuffer());
  }
  
  // Concatenar chunks
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(new Uint8Array(chunk), offset);
    offset += chunk.byteLength;
  }
  
  // Subir a Supabase Storage
  const filename = `sleep-story-${targetId}.mp3`;
  const { error: uploadError } = await supabase.storage
    .from('teachings-audio')
    .upload(filename, combined, {
      contentType: 'audio/mpeg',
      upsert: true,
    });
  
  if (uploadError) {
    throw new Error(`Error subiendo audio: ${uploadError.message}`);
  }
  
  // Obtener URL pública
  const { data: urlData } = supabase.storage
    .from('teachings-audio')
    .getPublicUrl(filename);
  
  const audioUrl = urlData.publicUrl;
  
  // Actualizar la historia con el audio
  await supabase
    .from('sleep_stories')
    .update({ audio_url: audioUrl })
    .eq('id', targetId);
  
  console.log(`[sleep_tts] Audio generado exitosamente: ${audioUrl}`);
  
  return { audioUrl };
}

async function generateNovenaImage(targetId: string): Promise<{ imageUrl: string }> {
  console.log(`[novena_image] Generando imagen para novena: ${targetId}`);
  
  // Obtener la novena
  const { data: novena, error: novenaError } = await supabase
    .from('novenas')
    .select('*')
    .eq('id', targetId)
    .single();
  
  if (novenaError || !novena) {
    throw new Error(`Novena no encontrada: ${novenaError?.message}`);
  }
  
  // Generar imagen con Lovable AI
  const prompt = `Sacred religious image for a novena prayer titled "${novena.titulo}". ${novena.descripcion}. Style: serene, spiritual, Catholic iconography with warm golden light, suitable for prayer and meditation. High quality, devotional art.`;
  
  const response = await fetch('https://api.lovable.dev/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      model: 'flux.schnell',
      width: 512,
      height: 512,
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Lovable AI error: ${errorText}`);
  }
  
  const data = await response.json();
  const imageBase64 = data.data[0].b64_json;
  const imageBuffer = Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0));
  
  // Subir a Supabase Storage
  const filename = `novena-${targetId}.png`;
  const { error: uploadError } = await supabase.storage
    .from('novena-images')
    .upload(filename, imageBuffer, {
      contentType: 'image/png',
      upsert: true,
    });
  
  if (uploadError) {
    throw new Error(`Error subiendo imagen: ${uploadError.message}`);
  }
  
  // Obtener URL pública
  const { data: urlData } = supabase.storage
    .from('novena-images')
    .getPublicUrl(filename);
  
  const imageUrl = urlData.publicUrl;
  
  // Actualizar la novena con la imagen
  await supabase
    .from('novenas')
    .update({ imagen_url: imageUrl })
    .eq('id', targetId);
  
  console.log(`[novena_image] Imagen generada exitosamente: ${imageUrl}`);
  
  return { imageUrl };
}

async function generateLessonTTS(targetId: string): Promise<{ audioUrl: string }> {
  console.log(`[lesson_tts] Generando audio para lección: ${targetId}`);
  
  // Obtener la lección
  const { data: lesson, error: lessonError } = await supabase
    .from('library_lessons')
    .select('*')
    .eq('id', targetId)
    .single();
  
  if (lessonError || !lesson) {
    throw new Error(`Lección no encontrada: ${lessonError?.message}`);
  }
  
  // Usar contenido enriquecido si existe, sino el contenido normal
  const text = lesson.contenido_enriquecido || lesson.contenido;
  const chunks: ArrayBuffer[] = [];
  const chunkSize = 4000;
  
  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize);
    console.log(`[lesson_tts] Procesando chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(text.length / chunkSize)}`);
    
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: chunk,
        voice: 'onyx', // Voz profesional para lecciones
        response_format: 'mp3',
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI TTS error: ${errorText}`);
    }
    
    chunks.push(await response.arrayBuffer());
  }
  
  // Concatenar chunks
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(new Uint8Array(chunk), offset);
    offset += chunk.byteLength;
  }
  
  // Subir a Supabase Storage
  const filename = `lesson-${targetId}.mp3`;
  const { error: uploadError } = await supabase.storage
    .from('teachings-audio')
    .upload(filename, combined, {
      contentType: 'audio/mpeg',
      upsert: true,
    });
  
  if (uploadError) {
    throw new Error(`Error subiendo audio: ${uploadError.message}`);
  }
  
  // Obtener URL pública
  const { data: urlData } = supabase.storage
    .from('teachings-audio')
    .getPublicUrl(filename);
  
  const audioUrl = urlData.publicUrl;
  
  // Actualizar la lección con el audio
  await supabase
    .from('library_lessons')
    .update({ audio_url: audioUrl })
    .eq('id', targetId);
  
  console.log(`[lesson_tts] Audio generado exitosamente: ${audioUrl}`);
  
  return { audioUrl };
}

async function generateBibleDay(targetId: string): Promise<{ dia: number }> {
  console.log(`[bible_day] Generando día bíblico: ${targetId}`);
  
  // targetId es el número del día (1-365)
  const dia = parseInt(targetId, 10);
  
  if (isNaN(dia) || dia < 1 || dia > 365) {
    throw new Error(`Día inválido: ${targetId}`);
  }
  
  // Verificar si el día ya existe
  const { data: existing } = await supabase
    .from('bible_reading_plan')
    .select('id')
    .eq('dia', dia)
    .maybeSingle();
  
  if (existing) {
    console.log(`[bible_day] Día ${dia} ya existe, saltando...`);
    return { dia };
  }
  
  // Plan de lectura basado en el día del año (distribuir la Biblia en 365 días)
  const bibleStructure = [
    { libro: 'Génesis', capitulos: 50 },
    { libro: 'Éxodo', capitulos: 40 },
    { libro: 'Levítico', capitulos: 27 },
    { libro: 'Números', capitulos: 36 },
    { libro: 'Deuteronomio', capitulos: 34 },
    { libro: 'Josué', capitulos: 24 },
    { libro: 'Jueces', capitulos: 21 },
    { libro: 'Rut', capitulos: 4 },
    { libro: '1 Samuel', capitulos: 31 },
    { libro: '2 Samuel', capitulos: 24 },
    { libro: '1 Reyes', capitulos: 22 },
    { libro: '2 Reyes', capitulos: 25 },
    { libro: '1 Crónicas', capitulos: 29 },
    { libro: '2 Crónicas', capitulos: 36 },
    { libro: 'Esdras', capitulos: 10 },
    { libro: 'Nehemías', capitulos: 13 },
    { libro: 'Ester', capitulos: 10 },
    { libro: 'Job', capitulos: 42 },
    { libro: 'Salmos', capitulos: 150 },
    { libro: 'Proverbios', capitulos: 31 },
    { libro: 'Eclesiastés', capitulos: 12 },
    { libro: 'Cantar de los Cantares', capitulos: 8 },
    { libro: 'Isaías', capitulos: 66 },
    { libro: 'Jeremías', capitulos: 52 },
    { libro: 'Lamentaciones', capitulos: 5 },
    { libro: 'Ezequiel', capitulos: 48 },
    { libro: 'Daniel', capitulos: 12 },
    { libro: 'Oseas', capitulos: 14 },
    { libro: 'Joel', capitulos: 3 },
    { libro: 'Amós', capitulos: 9 },
    { libro: 'Abdías', capitulos: 1 },
    { libro: 'Jonás', capitulos: 4 },
    { libro: 'Miqueas', capitulos: 7 },
    { libro: 'Nahúm', capitulos: 3 },
    { libro: 'Habacuc', capitulos: 3 },
    { libro: 'Sofonías', capitulos: 3 },
    { libro: 'Ageo', capitulos: 2 },
    { libro: 'Zacarías', capitulos: 14 },
    { libro: 'Malaquías', capitulos: 4 },
    { libro: 'Mateo', capitulos: 28 },
    { libro: 'Marcos', capitulos: 16 },
    { libro: 'Lucas', capitulos: 24 },
    { libro: 'Juan', capitulos: 21 },
    { libro: 'Hechos', capitulos: 28 },
    { libro: 'Romanos', capitulos: 16 },
    { libro: '1 Corintios', capitulos: 16 },
    { libro: '2 Corintios', capitulos: 13 },
    { libro: 'Gálatas', capitulos: 6 },
    { libro: 'Efesios', capitulos: 6 },
    { libro: 'Filipenses', capitulos: 4 },
    { libro: 'Colosenses', capitulos: 4 },
    { libro: '1 Tesalonicenses', capitulos: 5 },
    { libro: '2 Tesalonicenses', capitulos: 3 },
    { libro: '1 Timoteo', capitulos: 6 },
    { libro: '2 Timoteo', capitulos: 4 },
    { libro: 'Tito', capitulos: 3 },
    { libro: 'Filemón', capitulos: 1 },
    { libro: 'Hebreos', capitulos: 13 },
    { libro: 'Santiago', capitulos: 5 },
    { libro: '1 Pedro', capitulos: 5 },
    { libro: '2 Pedro', capitulos: 3 },
    { libro: '1 Juan', capitulos: 5 },
    { libro: '2 Juan', capitulos: 1 },
    { libro: '3 Juan', capitulos: 1 },
    { libro: 'Judas', capitulos: 1 },
    { libro: 'Apocalipsis', capitulos: 22 },
  ];
  
  // Total de capítulos: 1189, distribuir en 365 días (~3.26 capítulos por día)
  const totalCapitulos = bibleStructure.reduce((acc, b) => acc + b.capitulos, 0);
  const capitulosPorDia = totalCapitulos / 365;
  
  // Calcular qué capítulos leer en este día
  const capituloInicio = Math.floor((dia - 1) * capitulosPorDia) + 1;
  const capituloFin = Math.floor(dia * capitulosPorDia);
  
  // Encontrar libro y capítulo
  let capituloAcumulado = 0;
  let libroActual = '';
  let capituloEnLibro = 0;
  let libroFinal = '';
  let capituloEnLibroFinal = 0;
  
  for (const libro of bibleStructure) {
    if (capituloAcumulado + libro.capitulos >= capituloInicio && !libroActual) {
      libroActual = libro.libro;
      capituloEnLibro = capituloInicio - capituloAcumulado;
    }
    if (capituloAcumulado + libro.capitulos >= capituloFin) {
      libroFinal = libro.libro;
      capituloEnLibroFinal = capituloFin - capituloAcumulado;
      break;
    }
    capituloAcumulado += libro.capitulos;
  }
  
  const pasajeReferencia = libroActual === libroFinal 
    ? `${libroActual} ${capituloEnLibro}${capituloEnLibro !== capituloEnLibroFinal ? `-${capituloEnLibroFinal}` : ''}`
    : `${libroActual} ${capituloEnLibro} - ${libroFinal} ${capituloEnLibroFinal}`;
  
  // Usar Lovable AI para generar contenido
  const response = await fetch('https://api.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: `Eres un experto bíblico católico. Genera contenido para un plan de lectura de la Biblia en 365 días. 
Responde SOLO con JSON válido sin markdown, con esta estructura exacta:
{
  "titulo": "Título breve y atractivo para el día",
  "pasaje_texto": "Resumen del pasaje de 2-3 párrafos, destacando los puntos principales y el contexto histórico",
  "reflexion": "Reflexión espiritual de 1-2 párrafos sobre cómo aplicar este pasaje en la vida diaria"
}`
        },
        {
          role: 'user',
          content: `Genera el contenido para el Día ${dia} de 365. Pasaje: ${pasajeReferencia}. Recuerda responder SOLO con JSON válido.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Lovable AI error: ${errorText}`);
  }
  
  const aiData = await response.json();
  let content;
  
  try {
    const rawContent = aiData.choices[0].message.content;
    // Limpiar posible markdown
    const cleanContent = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    content = JSON.parse(cleanContent);
  } catch (e) {
    console.error('[bible_day] Error parseando respuesta AI:', aiData.choices[0].message.content);
    throw new Error('Error parseando respuesta de IA');
  }
  
  // Insertar en la base de datos
  const { error: insertError } = await supabase
    .from('bible_reading_plan')
    .insert({
      dia,
      titulo: content.titulo,
      pasaje_referencia: pasajeReferencia,
      pasaje_texto: content.pasaje_texto,
      reflexion: content.reflexion,
    });
  
  if (insertError) {
    throw new Error(`Error insertando día: ${insertError.message}`);
  }
  
  console.log(`[bible_day] Día ${dia} generado exitosamente: ${content.titulo}`);
  
  return { dia };
}

// ============ PROCESADOR PRINCIPAL ============

async function processJob(job: ProcessingJob): Promise<void> {
  console.log(`[process-jobs] Iniciando job: ${job.job_type} - ${job.target_title || job.target_id}`);
  
  const startTime = Date.now();
  
  // Marcar como procesando
  await markJobProcessing(job.id);
  await logJobAttempt(job.id, job.attempts + 1, 'started', `Iniciando procesamiento de ${job.job_type}`);
  
  try {
    let result: Record<string, unknown>;
    
    switch (job.job_type) {
      case 'sleep_tts':
        result = await generateSleepTTS(job.target_id);
        break;
      case 'novena_image':
        result = await generateNovenaImage(job.target_id);
        break;
      case 'lesson_tts':
        result = await generateLessonTTS(job.target_id);
        break;
      case 'bible_day':
        result = await generateBibleDay(job.target_id);
        break;
      default:
        throw new Error(`Tipo de job desconocido: ${job.job_type}`);
    }
    
    const processingTime = Date.now() - startTime;
    
    // Marcar como completado
    await markJobCompleted(job.id, result, processingTime);
    await logJobAttempt(job.id, job.attempts + 1, 'success', `Completado en ${processingTime}ms`, result);
    
    console.log(`[process-jobs] Job completado exitosamente en ${processingTime}ms`);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`[process-jobs] Error en job: ${errorMessage}`);
    
    // Marcar como error o pending para reintento
    await markJobError(job.id, errorMessage, job.attempts + 1, job.max_attempts);
    await logJobAttempt(job.id, job.attempts + 1, 'error', errorMessage, { 
      stack: error instanceof Error ? error.stack : undefined 
    });
  }
}

// ============ HANDLER PRINCIPAL ============

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { job_type, limit = 1 } = await req.json().catch(() => ({}));
    
    console.log(`[process-jobs] Buscando jobs pendientes (tipo: ${job_type || 'todos'}, límite: ${limit})`);
    
    // Buscar el siguiente job pendiente
    let query = supabase
      .from('processing_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(limit);
    
    if (job_type) {
      query = query.eq('job_type', job_type);
    }
    
    const { data: jobs, error: queryError } = await query;
    
    if (queryError) {
      throw new Error(`Error buscando jobs: ${queryError.message}`);
    }
    
    if (!jobs || jobs.length === 0) {
      console.log('[process-jobs] No hay jobs pendientes');
      return new Response(
        JSON.stringify({ 
          message: 'No hay jobs pendientes',
          processed: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`[process-jobs] Encontrados ${jobs.length} jobs pendientes`);
    
    // Procesar cada job
    const results = [];
    for (const job of jobs) {
      await processJob(job as ProcessingJob);
      results.push({
        id: job.id,
        job_type: job.job_type,
        target_title: job.target_title
      });
    }
    
    // Obtener estadísticas actualizadas
    const { data: stats } = await supabase.rpc('get_processing_stats');
    
    return new Response(
      JSON.stringify({ 
        message: `Procesados ${results.length} jobs`,
        processed: results.length,
        jobs: results,
        stats
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('[process-jobs] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
