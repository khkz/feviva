import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { verifyAdmin } from "../_shared/verifyAdmin.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_CHARS = 4000;

// Clean text for better Spanish pronunciation
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
    'Sal.': 'Salmos',
    ' II ': ' segundo ',
    ' III ': ' tercero ',
    ' IV ': ' cuarto ',
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

// Split text into chunks at sentence boundaries
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

// Concatenate audio buffers
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

const VALID_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

async function generateAudioForOracion(
  supabase: any,
  openaiApiKey: string,
  oracion: { id: string; nombre: string; texto: string },
  voice: string = 'echo'
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Generating audio for: ${oracion.nombre} with voice: ${voice}`);
    
    // Clean text for Spanish pronunciation
    const cleanedText = cleanTextForSpanishTTS(oracion.texto);
    
    // Split text into chunks if too long
    const chunks = splitTextIntoChunks(cleanedText);
    console.log(`Split into ${chunks.length} chunks`);

    const audioBuffers: ArrayBuffer[] = [];

    // Generate audio for each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`Processing chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini-tts-2025-12-15',
          input: chunk,
          voice: voice,
          response_format: 'opus',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('OpenAI TTS error:', error);
        throw new Error(error.error?.message || 'Failed to generate speech');
      }

      const buffer = await response.arrayBuffer();
      audioBuffers.push(buffer);

      // Small delay between API calls
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Concatenate all audio buffers
    const finalAudio = concatenateAudioBuffers(audioBuffers);
    console.log(`Total audio size: ${finalAudio.byteLength} bytes`);

    // Create filename from prayer name (slug)
    const filename = `oracion-${oracion.id}`;
    const filePath = `${filename}.opus`;
    
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('teachings-audio')
      .upload(filePath, finalAudio, {
        contentType: 'audio/opus',
        upsert: true
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Failed to upload audio: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('teachings-audio')
      .getPublicUrl(filePath);

    console.log(`Audio uploaded: ${urlData.publicUrl}`);

    // Update the oracion with the audio URL (add cache-busting timestamp)
    const audioUrlWithCacheBuster = `${urlData.publicUrl}?v=${Date.now()}`;
    
    const { error: updateError } = await supabase
      .from('oraciones')
      .update({ audio_url: audioUrlWithCacheBuster })
      .eq('id', oracion.id);
    
    if (updateError) {
      console.error('Error updating oracion:', updateError);
      throw new Error(`Failed to update oracion: ${updateError.message}`);
    }

    console.log(`Successfully updated oracion ${oracion.nombre}`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error generating audio for ${oracion.nombre}:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const auth = await verifyAdmin(req, corsHeaders);
    if (!auth.ok) return auth.response;



    const body = await req.json().catch(() => ({}));
    const { oracionId, voice = 'echo' } = body;
    
    // Validate voice parameter
    const selectedVoice = VALID_VOICES.includes(voice) ? voice : 'echo';
    console.log('Request received:', { oracionId, voice: selectedVoice });

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let results: { id: string; nombre: string; success: boolean; error?: string }[] = [];

    if (oracionId) {
      // Regenerate single oracion
      console.log(`Regenerating audio for single oracion: ${oracionId}`);
      
      const { data: oracion, error: fetchError } = await supabase
        .from('oraciones')
        .select('id, nombre, texto')
        .eq('id', oracionId)
        .single();

      if (fetchError || !oracion) {
        throw new Error(`Oracion not found: ${oracionId}`);
      }

      const result = await generateAudioForOracion(supabase, openaiApiKey, oracion, selectedVoice);
      results.push({ id: oracion.id, nombre: oracion.nombre, ...result });
    } else {
      // Regenerate all oraciones
      console.log('Regenerating audio for ALL oraciones');
      
      const { data: oraciones, error: fetchError } = await supabase
        .from('oraciones')
        .select('id, nombre, texto')
        .order('orden', { ascending: true });

      if (fetchError) {
        throw new Error(`Failed to fetch oraciones: ${fetchError.message}`);
      }

      console.log(`Found ${oraciones?.length || 0} oraciones to process`);

      for (const oracion of oraciones || []) {
        const result = await generateAudioForOracion(supabase, openaiApiKey, oracion, selectedVoice);
        results.push({ id: oracion.id, nombre: oracion.nombre, ...result });
        
        // Delay between oraciones to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    console.log(`Completed: ${successCount} success, ${errorCount} errors`);

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: results.length,
        successCount,
        errorCount,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in regenerate-oracion-audio:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
