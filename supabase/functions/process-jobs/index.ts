import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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

async function logJobAttempt(jobId: string, attemptNumber: number, status: string, message: string, metadata?: Record<string, unknown>): Promise<void> {
  await supabase.from('processing_logs').insert({ job_id: jobId, attempt_number: attemptNumber, status, message, metadata });
}

async function generateTTS(text: string, voice: string): Promise<Uint8Array> {
  const chunks: ArrayBuffer[] = [];
  const chunkSize = 4000;
  
  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize);
    console.log(`[TTS] Chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(text.length / chunkSize)}`);
    
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'tts-1', input: chunk, voice, response_format: 'mp3' }),
    });
    
    if (!response.ok) throw new Error(`OpenAI TTS error: ${await response.text()}`);
    chunks.push(await response.arrayBuffer());
  }
  
  const totalLength = chunks.reduce((acc, c) => acc + c.byteLength, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(new Uint8Array(chunk), offset);
    offset += chunk.byteLength;
  }
  return combined;
}

async function processSleepTTS(targetId: string): Promise<Record<string, unknown>> {
  const { data: story, error } = await supabase.from('sleep_stories').select('contenido').eq('id', targetId).single();
  if (error || !story) throw new Error(`Historia no encontrada: ${error?.message}`);
  
  const audio = await generateTTS(story.contenido, 'nova');
  const filename = `sleep-story-${targetId}.mp3`;
  
  await supabase.storage.from('teachings-audio').upload(filename, audio, { contentType: 'audio/mpeg', upsert: true });
  const { data: urlData } = supabase.storage.from('teachings-audio').getPublicUrl(filename);
  
  await supabase.from('sleep_stories').update({ audio_url: urlData.publicUrl }).eq('id', targetId);
  return { audioUrl: urlData.publicUrl };
}

async function processLessonTTS(targetId: string): Promise<Record<string, unknown>> {
  const { data: lesson, error } = await supabase.from('library_lessons').select('contenido, contenido_enriquecido').eq('id', targetId).single();
  if (error || !lesson) throw new Error(`Lección no encontrada: ${error?.message}`);
  
  const audio = await generateTTS(lesson.contenido_enriquecido || lesson.contenido, 'onyx');
  const filename = `lesson-${targetId}.mp3`;
  
  await supabase.storage.from('teachings-audio').upload(filename, audio, { contentType: 'audio/mpeg', upsert: true });
  const { data: urlData } = supabase.storage.from('teachings-audio').getPublicUrl(filename);
  
  await supabase.from('library_lessons').update({ audio_url: urlData.publicUrl }).eq('id', targetId);
  return { audioUrl: urlData.publicUrl };
}

async function processJob(job: ProcessingJob): Promise<void> {
  console.log(`[process-jobs] Procesando: ${job.job_type} - ${job.target_title || job.target_id}`);
  const startTime = Date.now();
  
  await supabase.from('processing_jobs').update({ attempts: job.attempts + 1 }).eq('id', job.id);
  await logJobAttempt(job.id, job.attempts + 1, 'started', `Iniciando ${job.job_type}`);
  
  try {
    let result: Record<string, unknown>;
    
    switch (job.job_type) {
      case 'sleep_tts':
        result = await processSleepTTS(job.target_id);
        break;
      case 'lesson_tts':
        result = await processLessonTTS(job.target_id);
        break;
      default:
        throw new Error(`Tipo de job no soportado: ${job.job_type}`);
    }
    
    const processingTime = Date.now() - startTime;
    await supabase.from('processing_jobs').update({ 
      status: 'completed', completed_at: new Date().toISOString(), 
      result_data: result, processing_time_ms: processingTime, error_message: null 
    }).eq('id', job.id);
    await logJobAttempt(job.id, job.attempts + 1, 'success', `Completado en ${processingTime}ms`, result);
    console.log(`[process-jobs] Completado en ${processingTime}ms`);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`[process-jobs] Error: ${errorMessage}`);
    const newStatus = job.attempts + 1 >= job.max_attempts ? 'error' : 'pending';
    await supabase.from('processing_jobs').update({ status: newStatus, error_message: errorMessage }).eq('id', job.id);
    await logJobAttempt(job.id, job.attempts + 1, 'error', errorMessage);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { job_type, action } = await req.json().catch(() => ({}));
    
    if (action === 'reset-stalled') {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { data } = await supabase.from('processing_jobs')
        .update({ status: 'pending', started_at: null, attempts: 0 })
        .eq('status', 'processing').lt('started_at', tenMinutesAgo).select();
      return new Response(JSON.stringify({ message: `Reseteados ${data?.length || 0} jobs`, reset: data?.length || 0 }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    let query = supabase.from('processing_jobs').select('*').eq('status', 'pending').order('created_at', { ascending: true }).limit(1);
    if (job_type) query = query.eq('job_type', job_type);
    
    const { data: jobs, error: fetchError } = await query;
    if (fetchError) return new Response(JSON.stringify({ error: fetchError.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    
    if (!jobs?.length) {
      return new Response(JSON.stringify({ message: 'No hay jobs pendientes', processed: 0, remaining: 0 }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const job = jobs[0] as ProcessingJob;
    await supabase.from('processing_jobs').update({ status: 'processing', started_at: new Date().toISOString() }).eq('id', job.id);
    await processJob(job);

    let countQuery = supabase.from('processing_jobs').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    if (job_type) countQuery = countQuery.eq('job_type', job_type);
    const { count } = await countQuery;

    return new Response(JSON.stringify({ message: `Completado: ${job.target_title || job.job_type}`, processed: 1, remaining: count || 0 }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[process-jobs] Error:', error);
    return new Response(JSON.stringify({ error: String(error) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
