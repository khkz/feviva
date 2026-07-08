import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { verifyAdmin } from "../_shared/verifyAdmin.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_CHARS = 4000;

// Limpia el texto para mejor pronunciación en español
function cleanTextForSpanishTTS(text: string): string {
  let cleaned = text;
  
  const replacements: Record<string, string> = {
    'et al.': 'y otros',
    'vs.': 'versus',
    'etc.': 'etcétera',
    'e.g.': 'por ejemplo',
    'i.e.': 'es decir',
    'Jn.': 'Juan',
    'Mt.': 'Mateo',
    'Lc.': 'Lucas',
    'Mc.': 'Marcos',
    'Gn.': 'Génesis',
    'Ex.': 'Éxodo',
    'Dt.': 'Deuteronomio',
    'Is.': 'Isaías',
    'Jr.': 'Jeremías',
    'Sal.': 'Salmos',
    'Rm.': 'Romanos',
    'Co.': 'Corintios',
    'Hb.': 'Hebreos',
    'Ap.': 'Apocalipsis',
    ' II ': ' segundo ',
    ' III ': ' tercero ',
    ' IV ': ' cuarto ',
    ' VI ': ' sexto ',
    ' VII ': ' séptimo ',
    ' VIII ': ' octavo ',
  };
  
  for (const [key, value] of Object.entries(replacements)) {
    cleaned = cleaned.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), value);
  }
  
  cleaned = cleaned
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/##\s*/g, '')
    .replace(/#\s*/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim();
  
  return cleaned;
}

function splitTextIntoChunks(text: string): string[] {
  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= MAX_CHARS) {
      chunks.push(remaining);
      break;
    }

    let splitIndex = MAX_CHARS;
    const searchArea = remaining.substring(0, MAX_CHARS);
    
    const lastPeriod = searchArea.lastIndexOf('. ');
    const lastQuestion = searchArea.lastIndexOf('? ');
    const lastExclamation = searchArea.lastIndexOf('! ');
    const lastNewline = searchArea.lastIndexOf('\n');
    
    splitIndex = Math.max(lastPeriod, lastQuestion, lastExclamation, lastNewline);
    
    if (splitIndex <= 0) {
      splitIndex = searchArea.lastIndexOf(' ');
    }
    
    if (splitIndex <= 0) {
      splitIndex = MAX_CHARS;
    } else {
      splitIndex += 1;
    }

    chunks.push(remaining.substring(0, splitIndex).trim());
    remaining = remaining.substring(splitIndex).trim();
  }

  return chunks;
}

function concatenateAudioBuffers(buffers: ArrayBuffer[]): Uint8Array {
  const totalLength = buffers.reduce((acc, buf) => acc + buf.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const buffer of buffers) {
    result.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }
  
  return result;
}

interface Lesson {
  id: string;
  titulo: string;
  contenido_enriquecido: string | null;
  contenido: string;
}

interface ProcessResult {
  lessonId: string;
  titulo: string;
  success: boolean;
  error?: string;
}

// Style instructions for educational content - clear, empathetic, contemplative
const lessonInstructions = `Habla con un tono educativo, claro y empático. 
Tu voz debe transmitir sabiduría y calidez pastoral. 
Enfatiza las palabras importantes con sutiles cambios de entonación. 
Mantén un ritmo pausado pero dinámico, facilitando la comprensión y la reflexión. 
Haz pequeñas pausas antes de conceptos clave para que el oyente pueda asimilar la enseñanza.
Transmite la profundidad del mensaje con reverencia y cercanía.`;

async function generateAndUploadAudio(
  lesson: Lesson, 
  openaiApiKey: string, 
  supabase: any,
  voice: string = 'sage'
): Promise<ProcessResult> {
  const { id, titulo, contenido_enriquecido, contenido } = lesson;
  
  try {
    // Use enriched content or original
    const textSource = contenido_enriquecido || contenido;
    
    // Clean text for TTS with Spanish optimization
    const audioText = cleanTextForSpanishTTS(
      textSource.replace(/<[^>]*>/g, '') // Remove HTML tags first
    );
    
    // Split into chunks for long content
    const chunks = splitTextIntoChunks(audioText);
    console.log(`Generating premium TTS for: ${titulo} with voice ${voice} (${audioText.length} chars, ${chunks.length} chunks)`);

    const audioBuffers: ArrayBuffer[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`Processing chunk ${i + 1}/${chunks.length} for ${titulo} (${chunk.length} chars)`);

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini-tts',
          input: chunk,
          voice: voice,
          instructions: lessonInstructions,
          response_format: 'mp3',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to generate speech');
      }

      audioBuffers.push(await response.arrayBuffer());
      
      // Small delay between chunks to avoid rate limits
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    // Concatenate all audio buffers
    const finalAudio = concatenateAudioBuffers(audioBuffers);
    console.log(`Generated premium audio for ${titulo}: ${finalAudio.byteLength} bytes from ${chunks.length} chunks`);

    // Clean filename
    const cleanTitulo = titulo
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 50);
    
    const filePath = `lessons/${id}-${cleanTitulo}.mp3`;
    
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('teachings-audio')
      .upload(filePath, finalAudio, {
        contentType: 'audio/mpeg',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Failed to upload audio: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('teachings-audio')
      .getPublicUrl(filePath);

    // Update lesson with audio URL
    const { error: updateError } = await supabase
      .from('library_lessons')
      .update({ audio_url: urlData.publicUrl })
      .eq('id', id);

    if (updateError) {
      console.error(`Database update error for ${titulo}:`, updateError);
    }

    console.log(`Premium audio uploaded successfully for ${titulo}: ${urlData.publicUrl}`);

    return { lessonId: id, titulo, success: true };
  } catch (error) {
    console.error(`Error generating audio for ${titulo}:`, error);
    return { 
      lessonId: id, 
      titulo, 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body for limit, forceRegenerate, and voice parameters
    let limit = 1; // Default to 1 lesson per batch (TTS takes longer)
    let forceRegenerate = false;
    let voice = 'sage'; // Default voice for lessons
    try {
      const body = await req.json();
      limit = body.limit || 1;
      forceRegenerate = body.forceRegenerate || false;
      voice = body.voice || 'sage';
    } catch {
      // Use default if no body
    }

    console.log(`Starting batch-lesson-tts with limit: ${limit}, forceRegenerate: ${forceRegenerate}, voice: ${voice}`);

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Fetching lessons (limit: ${limit}, forceRegenerate: ${forceRegenerate})...`);

    // Build query based on forceRegenerate
    let query = supabase
      .from('library_lessons')
      .select('id, titulo, contenido_enriquecido, contenido')
      .order('orden')
      .limit(limit);
    
    if (!forceRegenerate) {
      query = query.is('audio_url', null).not('contenido_enriquecido', 'is', null);
    }

    const { data: lessons, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Failed to fetch lessons: ${fetchError.message}`);
    }

    if (!lessons || lessons.length === 0) {
      // Check if there are lessons without enrichment that also need audio
      const { data: unenrichedLessons } = await supabase
        .from('library_lessons')
        .select('id')
        .is('audio_url', null)
        .is('contenido_enriquecido', null);
      
      const needsEnrichmentFirst = unenrichedLessons?.length || 0;
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: needsEnrichmentFirst > 0 
            ? `${needsEnrichmentFirst} lecciones necesitan ser enriquecidas primero`
            : 'Todas las lecciones ya tienen audio premium',
          successCount: 0, 
          errorCount: 0, 
          remaining: 0,
          needsEnrichmentFirst,
          hasMore: false,
          model: 'gpt-4o-mini-tts',
          voice: 'sage',
          results: [] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${lessons.length} lessons for premium TTS...`);

    // Get total count of pending audio generation
    const { count: totalPending } = await supabase
      .from('library_lessons')
      .select('id', { count: 'exact', head: true })
      .is('audio_url', null)
      .not('contenido_enriquecido', 'is', null);

    const results: ProcessResult[] = [];
    
    // Process lessons sequentially (TTS API can be slow)
    for (const lesson of lessons) {
      const result = await generateAndUploadAudio(lesson, openaiApiKey, supabase, voice);
      results.push(result);
      
      // Delay between lessons to avoid rate limits
      if (lessons.indexOf(lesson) < lessons.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;
    const remaining = forceRegenerate ? 0 : (totalPending || 0) - successCount;

    console.log(`Batch premium TTS complete: ${successCount} success, ${errorCount} errors, ${remaining} remaining`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        successCount, 
        errorCount, 
        remaining,
        hasMore: remaining > 0,
        model: 'gpt-4o-mini-tts',
        voice,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in batch-lesson-tts function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
