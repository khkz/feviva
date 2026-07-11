import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_CHARS = 4000;

// Limpia el texto para mejor pronunciación en español con pausas naturales
function cleanTextForSpanishTTS(text: string): string {
  let cleaned = text;
  
  // 1. Reemplazos para términos que causan problemas de pronunciación
  const replacements: Record<string, string> = {
    // Términos latinos
    'et al.': 'y otros',
    'vs.': 'versus',
    'etc.': 'etcétera',
    'e.g.': 'por ejemplo',
    'i.e.': 'es decir',
    // Abreviaturas bíblicas
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
    // Números romanos comunes (con contexto)
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
  
  // 2. Manejar títulos/encabezados con pausas dramáticas
  cleaned = cleaned.replace(/^#{1,3}\s*(.+)$/gm, '\n\n$1.\n\n');
  
  // 3. Manejar citas blockquote con entonación apropiada
  cleaned = cleaned.replace(/^>\s*"(.+)"$/gm, 'Y cito: "$1"');
  cleaned = cleaned.replace(/^>\s*(.+)$/gm, 'Cito: $1');
  
  // 4. Manejar listas con pausas entre elementos
  cleaned = cleaned.replace(/^[-*]\s+(.+)$/gm, '$1.');
  
  // 5. Manejar texto en negrita con pequeñas pausas para énfasis
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, ', $1,');
  
  // 6. Limpiar asteriscos sueltos
  cleaned = cleaned.replace(/\*/g, '');
  
  // 7. Preservar pausas de párrafo
  cleaned = cleaned.replace(/\n\n+/g, '.\n\n');
  
  // 8. Convertir saltos simples en espacios
  cleaned = cleaned.replace(/\n/g, ' ');
  
  // 9. Limpiar puntuación duplicada
  cleaned = cleaned.replace(/\.{2,}/g, '.');
  cleaned = cleaned.replace(/,{2,}/g, ',');
  cleaned = cleaned.replace(/\.\s*,/g, '.');
  cleaned = cleaned.replace(/,\s*\./g, '.');
  
  // 10. Limpiar espacios múltiples
  cleaned = cleaned.replace(/\s{2,}/g, ' ');
  
  // 11. Limpiar puntos al inicio de oraciones
  cleaned = cleaned.replace(/^\.\s*/g, '');
  cleaned = cleaned.replace(/\s+\.\s*\./g, '.');
  
  return cleaned.trim();
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

    const { lessonId, text, titulo, voice = 'nova' } = await req.json();

    if (!text || !lessonId) {
      throw new Error('text and lessonId are required');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Clean and split text into chunks for long content
    const cleanedText = cleanTextForSpanishTTS(text);
    const chunks = splitTextIntoChunks(cleanedText);
    console.log(`Generating TTS for lesson: ${titulo} (${cleanedText.length} chars, ${chunks.length} chunks) with voice: ${voice}`);

    const audioBuffers: ArrayBuffer[] = [];

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
          response_format: 'mp3',
          speed: 0.95,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('OpenAI TTS error:', error);
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
    console.log(`Generated audio: ${finalAudio.byteLength} bytes from ${chunks.length} chunks`);

    // Upload to Supabase Storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Clean filename
    const cleanTitulo = titulo
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 50);
    
    const filePath = `lessons/${lessonId}-${cleanTitulo}.mp3`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('teachings-audio')
      .upload(filePath, finalAudio, {
        contentType: 'audio/mpeg',
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

    // Update lesson with audio URL
    const { error: updateError } = await supabase
      .from('library_lessons')
      .update({ audio_url: urlData.publicUrl })
      .eq('id', lessonId);

    if (updateError) {
      console.error('Database update error:', updateError);
    }

    console.log(`Audio uploaded successfully: ${urlData.publicUrl}`);

    return new Response(
      JSON.stringify({ audioUrl: urlData.publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in lesson-tts function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});