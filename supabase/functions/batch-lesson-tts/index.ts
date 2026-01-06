import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_CHARS = 4000;

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

async function generateAndUploadAudio(
  lesson: Lesson, 
  openaiApiKey: string, 
  supabase: any
): Promise<ProcessResult> {
  const { id, titulo, contenido_enriquecido, contenido } = lesson;
  
  try {
    // Use enriched content or original
    const textSource = contenido_enriquecido || contenido;
    
    // Clean text for TTS (no truncation - we'll chunk it)
    const audioText = textSource
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\*\*/g, '')    // Remove markdown bold
      .replace(/\n{3,}/g, '\n\n'); // Normalize newlines
    
    // Split into chunks for long content
    const chunks = splitTextIntoChunks(audioText);
    console.log(`Generating TTS for: ${titulo} (${audioText.length} chars, ${chunks.length} chunks)`);

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
          model: 'tts-1-hd',
          input: chunk,
          voice: 'sage',
          response_format: 'mp3',
          speed: 0.95,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to generate speech');
      }

      audioBuffers.push(await response.arrayBuffer());
      
      // Small delay between chunks to avoid rate limits
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Concatenate all audio buffers
    const finalAudio = concatenateAudioBuffers(audioBuffers);
    console.log(`Generated audio for ${titulo}: ${finalAudio.byteLength} bytes from ${chunks.length} chunks`);

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

    console.log(`Audio uploaded successfully for ${titulo}: ${urlData.publicUrl}`);

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
    // Parse request body for limit parameter
    let limit = 1; // Default to 1 lesson per batch (TTS takes longer)
    try {
      const body = await req.json();
      limit = body.limit || 1;
    } catch {
      // Use default if no body
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Fetching lessons without audio (limit: ${limit})...`);

    // Get lessons that have enriched content but no audio
    const { data: lessons, error: fetchError } = await supabase
      .from('library_lessons')
      .select('id, titulo, contenido_enriquecido, contenido')
      .is('audio_url', null)
      .not('contenido_enriquecido', 'is', null)
      .order('orden')
      .limit(limit);

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
            : 'Todas las lecciones enriquecidas ya tienen audio',
          successCount: 0, 
          errorCount: 0, 
          remaining: 0,
          needsEnrichmentFirst,
          hasMore: false,
          results: [] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${lessons.length} lessons for TTS...`);

    // Get total count of pending audio generation
    const { count: totalPending } = await supabase
      .from('library_lessons')
      .select('id', { count: 'exact', head: true })
      .is('audio_url', null)
      .not('contenido_enriquecido', 'is', null);

    const results: ProcessResult[] = [];
    
    // Process lessons sequentially (TTS API can be slow)
    for (const lesson of lessons) {
      const result = await generateAndUploadAudio(lesson, openaiApiKey, supabase);
      results.push(result);
      
      // Delay between lessons to avoid rate limits
      if (lessons.indexOf(lesson) < lessons.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;
    const remaining = (totalPending || 0) - successCount;

    console.log(`Batch TTS complete: ${successCount} success, ${errorCount} errors, ${remaining} remaining`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        successCount, 
        errorCount, 
        remaining,
        hasMore: remaining > 0,
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
