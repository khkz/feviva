import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const MAX_CHARS = 3800;

interface ProcessingJob {
  id: string;
  job_type: string;
  target_table: string;
  target_id: string;
  target_title: string | null;
  status: string;
  attempts: number;
  max_attempts: number;
  result_data: Record<string, unknown> | null;
}

interface EnrichedLessonResponse {
  contenido_verificado: string;
  verificacion?: {
    datos_correctos?: boolean;
    correcciones_hechas?: string[];
    nivel_confianza?: string;
    fuentes_implicitas?: string[];
    notas_adicionales?: string;
  };
  resumen_audio?: string;
  puntos_clave?: string[];
}

// Instrucciones de estilo para TTS
const SLEEP_INSTRUCTIONS = `Habla con un tono muy cálido, suave y profundamente relajante. 
Tu voz debe ser como un abrazo auditivo que invite al descanso.
Ritmo lento y pausado, con respiraciones naturales entre frases.
Transmite paz, serenidad y calma absoluta.
Ideal para ayudar a alguien a quedarse dormido.`;

const LESSON_INSTRUCTIONS = `Habla con un tono educativo, claro y empático.
Tu voz debe transmitir sabiduría y cercanía, como un buen maestro.
Ritmo moderado, con énfasis en los conceptos importantes.
Transmite entusiasmo por el conocimiento sin ser abrumador.
Ideal para enseñar con paciencia y claridad.`;

const ORACION_INSTRUCTIONS = `Eres un narrador de oraciones católicas con voz profundamente espiritual.
Tu tono debe ser solemne, reverente y lleno de devoción, como en una iglesia antigua.
Habla pausadamente, con respiraciones naturales que inviten a la meditación.
Pronuncia con claridad especial las palabras en latín cuando aparezcan.
Transmite fe, paz interior y conexión con lo sagrado en cada palabra.
El ritmo debe ser meditativo, sin prisa, permitiendo que cada frase penetre en el corazón.`;

async function logJobAttempt(jobId: string, attemptNumber: number, status: string, message: string, metadata?: Record<string, unknown>): Promise<void> {
  await supabase.from('processing_logs').insert({ job_id: jobId, attempt_number: attemptNumber, status, message, metadata });
}

// Limpiar texto para TTS en español
function cleanTextForSpanishTTS(text: string): string {
  let cleaned = text
    // Expandir abreviaciones bíblicas
    .replace(/\bGn\s+(\d+)/gi, 'Génesis capítulo $1')
    .replace(/\bEx\s+(\d+)/gi, 'Éxodo capítulo $1')
    .replace(/\bSal\s+(\d+)/gi, 'Salmo $1')
    .replace(/\bMt\s+(\d+)/gi, 'Mateo capítulo $1')
    .replace(/\bMc\s+(\d+)/gi, 'Marcos capítulo $1')
    .replace(/\bLc\s+(\d+)/gi, 'Lucas capítulo $1')
    .replace(/\bJn\s+(\d+)/gi, 'Juan capítulo $1')
    .replace(/\bRom\s+(\d+)/gi, 'Romanos capítulo $1')
    .replace(/\b1\s*Cor\s+(\d+)/gi, 'Primera Corintios capítulo $1')
    .replace(/\b2\s*Cor\s+(\d+)/gi, 'Segunda Corintios capítulo $1')
    // Limpiar markdown
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    // Limpiar caracteres problemáticos
    .replace(/—/g, ', ')
    .replace(/–/g, ', ')
    .replace(/\.\.\./g, '...')
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleaned;
}

// Dividir texto en chunks respetando límites
function splitTextIntoChunks(text: string): string[] {
  if (text.length <= MAX_CHARS) return [text];
  
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + ' ' + sentence).length > MAX_CHARS) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk = currentChunk ? currentChunk + ' ' + sentence : sentence;
    }
  }
  
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

// Generar TTS con modelo premium
async function generatePremiumTTS(text: string, voice: string, instructions: string, speed: number = 1.0): Promise<Uint8Array> {
  const cleanedText = cleanTextForSpanishTTS(text);
  const chunks = splitTextIntoChunks(cleanedText);
  const audioBuffers: ArrayBuffer[] = [];
  
  console.log(`[TTS Premium] Generando ${chunks.length} chunks con voz ${voice}`);
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`[TTS Premium] Chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);
    
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${OPENAI_API_KEY}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        model: 'gpt-4o-mini-tts-2025-12-15', 
        input: chunk, 
        voice,
        instructions,
        response_format: 'mp3',
        speed
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI TTS error: ${errorText}`);
    }
    
    audioBuffers.push(await response.arrayBuffer());
  }
  
  // Concatenar buffers
  const totalLength = audioBuffers.reduce((acc, c) => acc + c.byteLength, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const buffer of audioBuffers) {
    combined.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }
  
  return combined;
}

// Generar TTS estándar (modelo básico)
async function generateStandardTTS(text: string, voice: string): Promise<Uint8Array> {
  const chunks: ArrayBuffer[] = [];
  const chunkSize = 4000;
  
  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize);
    console.log(`[TTS] Chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(text.length / chunkSize)}`);
    
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini-tts-2025-12-15', input: chunk, voice, response_format: 'mp3' }),
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

// Procesar TTS para historias de sueño (estándar)
async function processSleepTTS(targetId: string): Promise<Record<string, unknown>> {
  const { data: story, error } = await supabase.from('sleep_stories').select('contenido').eq('id', targetId).single();
  if (error || !story) throw new Error(`Historia no encontrada: ${error?.message}`);
  
  const audio = await generateStandardTTS(story.contenido, 'nova');
  const filename = `sleep-story-${targetId}.mp3`;
  
  await supabase.storage.from('teachings-audio').upload(filename, audio, { contentType: 'audio/mpeg', upsert: true });
  const { data: urlData } = supabase.storage.from('teachings-audio').getPublicUrl(filename);
  
  await supabase.from('sleep_stories').update({ audio_url: urlData.publicUrl }).eq('id', targetId);
  return { audioUrl: urlData.publicUrl };
}

// Procesar TTS para lecciones (estándar)
async function processLessonTTS(targetId: string): Promise<Record<string, unknown>> {
  const { data: lesson, error } = await supabase.from('library_lessons').select('contenido, contenido_enriquecido').eq('id', targetId).single();
  if (error || !lesson) throw new Error(`Lección no encontrada: ${error?.message}`);
  
  const audio = await generateStandardTTS(lesson.contenido_enriquecido || lesson.contenido, 'onyx');
  const filename = `lesson-${targetId}.mp3`;
  
  await supabase.storage.from('teachings-audio').upload(filename, audio, { contentType: 'audio/mpeg', upsert: true });
  const { data: urlData } = supabase.storage.from('teachings-audio').getPublicUrl(filename);
  
  await supabase.from('library_lessons').update({ audio_url: urlData.publicUrl }).eq('id', targetId);
  return { audioUrl: urlData.publicUrl };
}

// Procesar TTS PREMIUM para historias de sueño
async function processSleepTTSPremium(targetId: string, voice: string = 'shimmer'): Promise<Record<string, unknown>> {
  const { data: story, error } = await supabase.from('sleep_stories').select('contenido, titulo').eq('id', targetId).single();
  if (error || !story) throw new Error(`Historia no encontrada: ${error?.message}`);
  
  console.log(`[Premium Sleep TTS] Procesando: ${story.titulo} con voz ${voice}`);
  
  const audio = await generatePremiumTTS(story.contenido, voice, SLEEP_INSTRUCTIONS, 0.85);
  const filename = `sleep-story-${targetId}.mp3`;
  
  await supabase.storage.from('teachings-audio').upload(filename, audio, { contentType: 'audio/mpeg', upsert: true });
  const { data: urlData } = supabase.storage.from('teachings-audio').getPublicUrl(filename);
  
  await supabase.from('sleep_stories').update({ audio_url: urlData.publicUrl }).eq('id', targetId);
  
  return { audioUrl: urlData.publicUrl, voice, model: 'gpt-4o-mini-tts-2025-12-15', premium: true };
}

// Procesar TTS PREMIUM para lecciones
async function processLessonTTSPremium(targetId: string, voice: string = 'sage'): Promise<Record<string, unknown>> {
  const { data: lesson, error } = await supabase.from('library_lessons').select('contenido, contenido_enriquecido, titulo').eq('id', targetId).single();
  if (error || !lesson) throw new Error(`Lección no encontrada: ${error?.message}`);
  
  console.log(`[Premium Lesson TTS] Procesando: ${lesson.titulo} con voz ${voice}`);
  
  const content = lesson.contenido_enriquecido || lesson.contenido;
  const audio = await generatePremiumTTS(content, voice, LESSON_INSTRUCTIONS, 0.95);
  const filename = `lesson-${targetId}.mp3`;
  
  await supabase.storage.from('teachings-audio').upload(filename, audio, { contentType: 'audio/mpeg', upsert: true });
  const { data: urlData } = supabase.storage.from('teachings-audio').getPublicUrl(filename);
  
  await supabase.from('library_lessons').update({ audio_url: urlData.publicUrl }).eq('id', targetId);
  
  return { audioUrl: urlData.publicUrl, voice, model: 'gpt-4o-mini-tts-2025-12-15', premium: true };
}

// Procesar TTS PREMIUM para oraciones
async function processOracionTTSPremium(targetId: string, voice: string = 'echo'): Promise<Record<string, unknown>> {
  const { data: oracion, error } = await supabase.from('oraciones').select('texto, nombre').eq('id', targetId).single();
  if (error || !oracion) throw new Error(`Oración no encontrada: ${error?.message}`);
  
  console.log(`[Premium Oracion TTS] Procesando: ${oracion.nombre} con voz ${voice}`);
  
  const audio = await generatePremiumTTS(oracion.texto, voice, ORACION_INSTRUCTIONS, 0.85);
  const filename = `oracion-${targetId}.mp3`;
  
  await supabase.storage.from('teachings-audio').upload(filename, audio, { contentType: 'audio/mpeg', upsert: true });
  const { data: urlData } = supabase.storage.from('teachings-audio').getPublicUrl(filename);
  
  await supabase.from('oraciones').update({ audio_url: urlData.publicUrl }).eq('id', targetId);
  
  return { audioUrl: urlData.publicUrl, voice, model: 'gpt-4o-mini-tts-2025-12-15', premium: true };
}

// ============= SANITIZACIÓN ROBUSTA DE JSON =============

function sanitizeAndParseJsonResponse(rawContent: string): Record<string, unknown> {
  // Paso 1: Limpiar markdown wrappers
  let cleaned = rawContent
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();
  
  // Paso 2: Intentar parsear directamente
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.log('[JSON Parse] Primer intento fallido, aplicando sanitización...');
  }
  
  // Paso 3: Extraer solo el objeto JSON
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No se encontró objeto JSON en la respuesta');
  }
  cleaned = jsonMatch[0];
  
  // Paso 4: Sanitizar caracteres de control problemáticos
  cleaned = cleaned.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');
  
  // Paso 5: Intentar parsear sanitizado
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.log('[JSON Parse] Segundo intento fallido, intentando reparación de comillas en HTML...');
  }
  
  // Paso 6: Reparar comillas dentro de atributos HTML
  // Reemplazar comillas dobles dentro de tags HTML con comillas simples
  cleaned = cleaned.replace(/<([^>]*)>/g, (match) => {
    // Dentro de tags HTML, cambiar " a ' para atributos
    return match.replace(/(?<=\s\w+=)"([^"]*)"/g, "'$1'");
  });
  
  // Paso 7: Intentar parsear después de reparar HTML
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.log('[JSON Parse] Tercer intento fallido, aplicando escape de comillas manual...');
  }
  
  // Paso 8: Intento más agresivo - escapar comillas dentro de valores string
  // Buscar patrones problemáticos como "class="algo"" y escaparlos
  cleaned = cleaned
    .replace(/="([^"\\]*)"([^"\\]*)"([^"\\]*)"/g, '=\\"$1\\"$2\\"$3\\"')
    .replace(/"([^"]*)<([^>]*)class="([^"]*)"([^>]*)>([^"]*)"/g, '"$1<$2class=\'$3\'$4>$5"');
  
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('[JSON Parse] Todos los intentos fallaron. Últimos 200 chars:', cleaned.substring(cleaned.length - 200));
  }
  
  throw new Error('No se pudo parsear la respuesta de Gemini después de múltiples intentos de sanitización');
}

// ============= ENRIQUECIMIENTO DE CONTENIDO CON GEMINI 3 PRO =============

async function processLessonContentEnrich(targetId: string): Promise<Record<string, unknown>> {
  console.log(`[Content Enrich] Iniciando enriquecimiento de lección: ${targetId}`);
  
  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY no configurada');
  }
  
  // Obtener lección actual
  const { data: lesson, error } = await supabase
    .from('library_lessons')
    .select('titulo, descripcion, contenido, contenido_enriquecido, categoria')
    .eq('id', targetId)
    .single();
  
  if (error || !lesson) {
    throw new Error(`Lección no encontrada: ${error?.message}`);
  }
  
  console.log(`[Content Enrich] Procesando: ${lesson.titulo}`);
  
const systemPrompt = `Eres un teólogo católico experto con doctorado en historia de la Iglesia, patrología y sagradas escrituras.
Tu misión es VERIFICAR y ENRIQUECER contenido teológico asegurando:

REGLAS CRÍTICAS DE FORMATO JSON:
- Responde ÚNICAMENTE con JSON válido parseble
- En el HTML, usa COMILLAS SIMPLES (') para atributos como class='algo', NUNCA comillas dobles
- Escapa correctamente cualquier comilla doble necesaria dentro de strings con \\
- NO uses caracteres de control ni saltos de línea sin escapar dentro de valores string

REGLAS CRÍTICAS DE VERIFICACIÓN:
1. Verificar CADA cita bíblica - debe ser exacta (libro, capítulo, versículo)
2. Verificar CADA referencia al Catecismo (CIC) - usar numeración correcta
3. Verificar fechas históricas y atribuciones a santos/Padres de la Iglesia
4. Distinguir CLARAMENTE entre:
   - Dogma de fe (definido infaliblemente)
   - Doctrina católica (enseñanza oficial)
   - Tradición piadosa (no vinculante)
   - Opinión teológica (discutible)
5. Corregir CUALQUIER error teológico, histórico o de citas
6. Incluir referencias al Magisterio cuando sea apropiado
7. Citar Padres de la Iglesia relevantes

ESTILO DE ESCRITURA:
- Académico pero accesible
- Profundo sin ser árido
- Pastoral y formativo
- En español latinoamericano claro

Responde ÚNICAMENTE con JSON válido, sin markdown ni texto adicional.`;

  const currentContent = lesson.contenido_enriquecido || lesson.contenido;
  
  const userPrompt = `LECCIÓN A VERIFICAR Y ENRIQUECER:

TÍTULO: ${lesson.titulo}
CATEGORÍA: ${lesson.categoria}
DESCRIPCIÓN: ${lesson.descripcion}

CONTENIDO ACTUAL:
${currentContent}

TAREAS OBLIGATORIAS:
1. Verificar que TODOS los datos históricos sean correctos
2. Corregir cualquier error en citas bíblicas o del Catecismo
3. Expandir significativamente con información verificable (mínimo 2500 palabras)
4. Añadir referencias al Catecismo de la Iglesia Católica (CIC) donde corresponda
5. Incluir testimonios de Padres de la Iglesia cuando sea relevante
6. Añadir contexto histórico importante
7. Crear un resumen de 400-500 palabras optimizado para narración de audio
8. Extraer 5-7 puntos clave para estudio

FORMATO DE RESPUESTA JSON:
{
  "contenido_verificado": "<HTML completo con estructura: h2, h3, p, blockquote para citas, ul/li para listas. SIN etiquetas html, head, body. Solo el contenido.>",
  "verificacion": {
    "datos_correctos": true o false,
    "correcciones_hechas": ["lista de correcciones específicas realizadas"],
    "nivel_confianza": "alto" o "medio" o "bajo",
    "fuentes_implicitas": ["CIC 1234", "Mt 5,1-12", "San Agustín, Confesiones", etc.],
    "notas_adicionales": "observaciones sobre el contenido original"
  },
  "resumen_audio": "<Texto de 400-500 palabras, natural para narrar, sin marcadores de formato>",
  "puntos_clave": ["punto clave 1", "punto clave 2", "...hasta 7 puntos"]
}`;

  console.log(`[Content Enrich] Llamando a Gemini 3 Pro...`);
  
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
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.4, // Más bajo para mayor precisión histórica
      max_tokens: 16000,
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }
  
  const aiResult = await response.json();
  const rawContent = aiResult.choices?.[0]?.message?.content;
  
  if (!rawContent) {
    throw new Error('Respuesta vacía de Gemini');
  }
  
  console.log(`[Content Enrich] Respuesta recibida (${rawContent.length} chars), parseando JSON...`);
  
  let enrichedData: EnrichedLessonResponse;
  try {
    enrichedData = sanitizeAndParseJsonResponse(rawContent) as unknown as EnrichedLessonResponse;
    console.log('[Content Enrich] JSON parseado exitosamente');
  } catch (parseError) {
    console.error('[Content Enrich] Error parseando JSON. Primeros 500 chars:', rawContent.substring(0, 500));
    console.error('[Content Enrich] Últimos 500 chars:', rawContent.substring(rawContent.length - 500));
    throw new Error(`Error parseando respuesta de Gemini: ${parseError}`);
  }
  
  // Validar estructura mínima
  if (!enrichedData.contenido_verificado) {
    throw new Error('Respuesta de Gemini no contiene contenido_verificado');
  }
  
  console.log(`[Content Enrich] Actualizando base de datos...`);
  
  // Actualizar lección en base de datos
  const { error: updateError } = await supabase
    .from('library_lessons')
    .update({
      contenido_enriquecido: enrichedData.contenido_verificado,
      verificado_at: new Date().toISOString(),
      verificacion_data: enrichedData.verificacion,
      resumen_audio: enrichedData.resumen_audio,
    })
    .eq('id', targetId);
  
  if (updateError) {
    throw new Error(`Error actualizando lección: ${updateError.message}`);
  }
  
  console.log(`[Content Enrich] ✅ Lección enriquecida exitosamente: ${lesson.titulo}`);
  
  return {
    verified: true,
    model: 'google/gemini-3-pro-preview',
    titulo: lesson.titulo,
    nivel_confianza: enrichedData.verificacion?.nivel_confianza || 'unknown',
    correcciones: enrichedData.verificacion?.correcciones_hechas?.length || 0,
    puntos_clave: enrichedData.puntos_clave?.length || 0,
    contenido_length: enrichedData.contenido_verificado?.length || 0
  };
}

// ============= FIN ENRIQUECIMIENTO =============

async function processJob(job: ProcessingJob): Promise<void> {
  console.log(`[process-jobs] Procesando: ${job.job_type} - ${job.target_title || job.target_id}`);
  const startTime = Date.now();
  
  await supabase.from('processing_jobs').update({ attempts: job.attempts + 1 }).eq('id', job.id);
  await logJobAttempt(job.id, job.attempts + 1, 'started', `Iniciando ${job.job_type}`);
  
  try {
    let result: Record<string, unknown>;
    
    // Extraer metadata del job (voice, etc.)
    const metadata = job.result_data || {};
    const voice = (metadata.voice as string) || undefined;
    
    switch (job.job_type) {
      case 'sleep_tts':
        result = await processSleepTTS(job.target_id);
        break;
      case 'lesson_tts':
        result = await processLessonTTS(job.target_id);
        break;
      case 'sleep_tts_premium':
        result = await processSleepTTSPremium(job.target_id, voice || 'shimmer');
        break;
      case 'lesson_tts_premium':
        result = await processLessonTTSPremium(job.target_id, voice || 'sage');
        break;
      case 'lesson_content_enrich':
        result = await processLessonContentEnrich(job.target_id);
        break;
      case 'oracion_tts_premium':
        result = await processOracionTTSPremium(job.target_id, voice || 'echo');
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