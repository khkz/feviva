import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

async function generateSpeech(text: string, voice: string = 'nova'): Promise<ArrayBuffer> {
  // For very long texts, we need to chunk them (OpenAI TTS has 4096 char limit)
  const maxChunkSize = 4000;
  const chunks: string[] = [];
  
  // Split by paragraphs first, then by sentences if needed
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = '';
  
  for (const para of paragraphs) {
    if ((currentChunk + '\n\n' + para).length <= maxChunkSize) {
      currentChunk = currentChunk ? currentChunk + '\n\n' + para : para;
    } else {
      if (currentChunk) chunks.push(currentChunk);
      
      // If single paragraph is too long, split by sentences
      if (para.length > maxChunkSize) {
        const sentences = para.split(/(?<=[.!?])\s+/);
        currentChunk = '';
        for (const sentence of sentences) {
          if ((currentChunk + ' ' + sentence).length <= maxChunkSize) {
            currentChunk = currentChunk ? currentChunk + ' ' + sentence : sentence;
          } else {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = sentence;
          }
        }
      } else {
        currentChunk = para;
      }
    }
  }
  if (currentChunk) chunks.push(currentChunk);
  
  console.log(`Text split into ${chunks.length} chunks`);
  
  // Generate audio for each chunk
  const audioBuffers: ArrayBuffer[] = [];
  
  for (let i = 0; i < chunks.length; i++) {
    console.log(`Generating audio for chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)`);
    
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1-hd',
        input: chunks[i],
        voice: voice,
        speed: 0.9, // Slower for sleep stories
        response_format: 'mp3',
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI TTS error: ${error}`);
    }
    
    const buffer = await response.arrayBuffer();
    audioBuffers.push(buffer);
  }
  
  // Concatenate all audio buffers
  const totalLength = audioBuffers.reduce((acc, buf) => acc + buf.byteLength, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const buffer of audioBuffers) {
    combined.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }
  
  return combined.buffer;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { limit = 1 } = await req.json();
    
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get stories without audio
    const { data: stories, error: fetchError } = await supabase
      .from('sleep_stories')
      .select('id, titulo, contenido, duracion_estimada')
      .is('audio_url', null)
      .order('orden')
      .limit(limit);

    if (fetchError) throw fetchError;

    console.log(`Found ${stories?.length || 0} stories without audio`);

    const results: any[] = [];

    for (const story of stories || []) {
      try {
        console.log(`Generating audio for: ${story.titulo}`);
        
        // Generate speech
        const audioBuffer = await generateSpeech(story.contenido, 'nova');
        
        // Upload to storage
        const fileName = `sleep-story-${story.id}.mp3`;
        const { error: uploadError } = await supabase.storage
          .from('teachings-audio')
          .upload(fileName, audioBuffer, {
            contentType: 'audio/mpeg',
            upsert: true,
          });

        if (uploadError) {
          console.error(`Upload error for ${story.titulo}:`, uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('teachings-audio')
          .getPublicUrl(fileName);

        const audioUrl = urlData.publicUrl;

        // Update story with audio URL
        const { error: updateError } = await supabase
          .from('sleep_stories')
          .update({ audio_url: audioUrl })
          .eq('id', story.id);

        if (updateError) throw updateError;

        console.log(`✅ Generated audio for: ${story.titulo}`);
        results.push({
          titulo: story.titulo,
          status: 'success',
          audioUrl,
          duration: story.duracion_estimada
        });

      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        console.error(`Error generating audio for ${story.titulo}:`, e);
        results.push({
          titulo: story.titulo,
          status: 'error',
          error: errorMsg
        });
      }
    }

    // Get remaining count
    const { count: remainingCount } = await supabase
      .from('sleep_stories')
      .select('id', { count: 'exact', head: true })
      .is('audio_url', null);

    return new Response(JSON.stringify({
      processed: results.length,
      remaining: remainingCount || 0,
      hasMore: (remainingCount || 0) > 0,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error in batch-sleep-tts:', error);
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
