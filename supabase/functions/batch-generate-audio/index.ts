import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AudioResult {
  success: boolean;
  lessonId: string;
  titulo: string;
  audioUrl?: string;
  error?: string;
}

async function extractAudioText(lesson: any): Promise<string> {
  // Try to extract resumen_audio from enriched content, or use description
  if (lesson.contenido_enriquecido) {
    // The enriched content should have a resumen_audio, but it's stored in the HTML
    // For now, use the description + a summary approach
    const baseText = `${lesson.titulo}. ${lesson.descripcion}`;
    
    // Extract text content from HTML (basic extraction)
    const htmlContent = lesson.contenido_enriquecido;
    const textOnly = htmlContent
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Take first ~500 words for audio (about 3-4 minutes)
    const words = textOnly.split(' ').slice(0, 500).join(' ');
    return `${lesson.titulo}. ${words}`;
  }
  
  return `${lesson.titulo}. ${lesson.descripcion}. ${lesson.contenido}`;
}

async function generateAudio(lesson: any, openaiApiKey: string, supabase: any): Promise<AudioResult> {
  const { id, titulo } = lesson;
  
  console.log(`Generating audio for: ${titulo}`);
  
  try {
    // Extract text for audio
    const text = await extractAudioText(lesson);
    
    // Limit text to ~4000 chars for TTS (about 5-6 minutes)
    const limitedText = text.slice(0, 4000);
    
    console.log(`Text length: ${limitedText.length} chars`);
    
    // Generate speech using OpenAI TTS
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1-hd',
        input: limitedText,
        voice: 'onyx', // Deep, warm voice good for Spanish
        response_format: 'mp3',
        speed: 0.95,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`OpenAI TTS error for ${titulo}:`, error);
      return { success: false, lessonId: id, titulo, error: error.error?.message || 'TTS failed' };
    }

    // Get audio buffer
    const audioBuffer = await response.arrayBuffer();
    console.log(`Audio generated: ${audioBuffer.byteLength} bytes`);

    // Clean filename
    const cleanTitulo = titulo
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 50);
    
    const filePath = `lessons/${id}-${cleanTitulo}.mp3`;
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('teachings-audio')
      .upload(filePath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true
      });

    if (uploadError) {
      console.error(`Storage error for ${titulo}:`, uploadError);
      return { success: false, lessonId: id, titulo, error: uploadError.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('teachings-audio')
      .getPublicUrl(filePath);

    // Update lesson
    const { error: updateError } = await supabase
      .from('library_lessons')
      .update({ audio_url: urlData.publicUrl })
      .eq('id', id);

    if (updateError) {
      console.error(`DB update error for ${titulo}:`, updateError);
      return { success: false, lessonId: id, titulo, error: updateError.message };
    }

    console.log(`Successfully generated audio for: ${titulo}`);
    return { success: true, lessonId: id, titulo, audioUrl: urlData.publicUrl };
    
  } catch (error) {
    console.error(`Error generating audio for ${titulo}:`, error);
    return { success: false, lessonId: id, titulo, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Get limit from request body (default: 2)
    let limit = 2;
    let onlyEnriched = true;
    try {
      const body = await req.json();
      limit = body.limit || 2;
      onlyEnriched = body.onlyEnriched !== false;
    } catch {
      // Use defaults
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build query - lessons without audio, optionally only enriched ones
    let query = supabase
      .from('library_lessons')
      .select('*', { count: 'exact' })
      .is('audio_url', null);
    
    if (onlyEnriched) {
      query = query.not('contenido_enriquecido', 'is', null);
    }

    const { count: totalPending } = await query;

    // Get limited batch
    let batchQuery = supabase
      .from('library_lessons')
      .select('*')
      .is('audio_url', null)
      .order('orden')
      .limit(limit);
    
    if (onlyEnriched) {
      batchQuery = batchQuery.not('contenido_enriquecido', 'is', null);
    }

    const { data: lessons, error: fetchError } = await batchQuery;

    if (fetchError) {
      throw new Error(`Failed to fetch lessons: ${fetchError.message}`);
    }

    if (!lessons || lessons.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No lessons need audio', 
          processed: 0,
          remaining: 0,
          hasMore: false 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${lessons.length} lessons for audio (${totalPending} total pending)`);

    const results: AudioResult[] = [];
    let successCount = 0;
    let errorCount = 0;

    // Process sequentially to avoid rate limits
    for (const lesson of lessons) {
      const result = await generateAudio(lesson, openaiApiKey, supabase);
      results.push(result);
      
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }

      // Delay between requests
      if (lessons.indexOf(lesson) < lessons.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const remaining = (totalPending || 0) - successCount;
    console.log(`Batch complete. Success: ${successCount}, Errors: ${errorCount}, Remaining: ${remaining}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Generated audio for ${successCount} lessons`,
        successCount,
        errorCount,
        processed: successCount,
        remaining,
        hasMore: remaining > 0,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in batch-generate-audio:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});