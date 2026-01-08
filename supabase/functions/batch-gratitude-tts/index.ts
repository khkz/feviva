import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

function numberToSpanishWord(num: number): string {
  const units = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const teens = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
  const tens = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const hundreds = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

  if (num < 0 || num > 300) return String(num);
  if (num < 10) return units[num];
  if (num < 20) return teens[num - 10];
  if (num < 30) {
    if (num === 20) return 'veinte';
    return 'veinti' + units[num - 20];
  }
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    if (unit === 0) return tens[ten];
    return tens[ten] + ' y ' + units[unit];
  }
  if (num === 100) return 'cien';
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  if (remainder === 0) return hundreds[hundred];
  return hundreds[hundred] + ' ' + numberToSpanishWord(remainder);
}

function cleanTextForSpanishTTS(text: string): string {
  let cleaned = text;
  
  // Biblical book abbreviations
  const biblicalBooks: [RegExp, string][] = [
    [/\bGn\.?\s/gi, 'Génesis '],
    [/\bEx\.?\s/gi, 'Éxodo '],
    [/\bLv\.?\s/gi, 'Levítico '],
    [/\bNm\.?\s/gi, 'Números '],
    [/\bDt\.?\s/gi, 'Deuteronomio '],
    [/\bSal\.?\s/gi, 'Salmo '],
    [/\bPr\.?\s/gi, 'Proverbios '],
    [/\bEc\.?\s/gi, 'Eclesiastés '],
    [/\bIs\.?\s/gi, 'Isaías '],
    [/\bJer\.?\s/gi, 'Jeremías '],
    [/\bEz\.?\s/gi, 'Ezequiel '],
    [/\bDn\.?\s/gi, 'Daniel '],
    [/\bMt\.?\s/gi, 'Mateo '],
    [/\bMc\.?\s/gi, 'Marcos '],
    [/\bLc\.?\s/gi, 'Lucas '],
    [/\bJn\.?\s/gi, 'Juan '],
    [/\bHch\.?\s/gi, 'Hechos '],
    [/\bRom\.?\s/gi, 'Romanos '],
    [/\bEf\.?\s/gi, 'Efesios '],
    [/\bFlp\.?\s/gi, 'Filipenses '],
    [/\bCol\.?\s/gi, 'Colosenses '],
    [/\bHeb\.?\s/gi, 'Hebreos '],
    [/\bStg\.?\s/gi, 'Santiago '],
    [/\bAp\.?\s/gi, 'Apocalipsis '],
    [/\b1\s?Cor\.?\s/gi, 'primera Corintios '],
    [/\b2\s?Cor\.?\s/gi, 'segunda Corintios '],
    [/\b1\s?Tes\.?\s/gi, 'primera Tesalonicenses '],
    [/\b2\s?Tes\.?\s/gi, 'segunda Tesalonicenses '],
    [/\b1\s?Tim\.?\s/gi, 'primera Timoteo '],
    [/\b2\s?Tim\.?\s/gi, 'segunda Timoteo '],
    [/\b1\s?Pe\.?\s/gi, 'primera Pedro '],
    [/\b2\s?Pe\.?\s/gi, 'segunda Pedro '],
    [/\b1\s?Jn\.?\s/gi, 'primera Juan '],
    [/\b2\s?Jn\.?\s/gi, 'segunda Juan '],
    [/\b3\s?Jn\.?\s/gi, 'tercera Juan '],
  ];

  for (const [pattern, replacement] of biblicalBooks) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  // Convert chapter:verse to words
  cleaned = cleaned.replace(/(\d{1,3}):(\d{1,3})/g, (_, cap, vers) => {
    const capNum = parseInt(cap, 10);
    const versNum = parseInt(vers, 10);
    return `capítulo ${numberToSpanishWord(capNum)}, versículo ${numberToSpanishWord(versNum)}`;
  });

  // General replacements
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

async function generateSpeech(text: string, voice: string = 'onyx'): Promise<ArrayBuffer> {
  const cleanedText = cleanTextForSpanishTTS(text);
  
  const maxChunkSize = 4000;
  const chunks: string[] = [];
  const paragraphs = cleanedText.split(/\n\n+/);
  let currentChunk = '';
  
  for (const para of paragraphs) {
    if ((currentChunk + '\n\n' + para).length <= maxChunkSize) {
      currentChunk = currentChunk ? currentChunk + '\n\n' + para : para;
    } else {
      if (currentChunk) chunks.push(currentChunk);
      
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
        speed: 0.95,
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

    // Get sessions without audio
    const { data: sessions, error: fetchError } = await supabase
      .from('gratitude_sessions')
      .select('id, numero, titulo, descripcion, duracion_min')
      .is('audio_url', null)
      .order('numero')
      .limit(limit);

    if (fetchError) throw fetchError;

    console.log(`Found ${sessions?.length || 0} sessions without audio`);

    const results: any[] = [];

    for (const session of sessions || []) {
      try {
        console.log(`Generating audio for session ${session.numero}: ${session.titulo}`);
        
        // Build the full text for audio
        const fullText = `Sesión ${numberToSpanishWord(session.numero)}: ${session.titulo}.

${session.descripcion}

Hoy tienes motivos para estar agradecido. Que Dios te bendiga.`;
        
        // Generate speech
        const audioBuffer = await generateSpeech(fullText, 'onyx');
        
        // Upload to storage
        const fileName = `gratitude-session-${session.numero}.mp3`;
        const { error: uploadError } = await supabase.storage
          .from('teachings-audio')
          .upload(fileName, audioBuffer, {
            contentType: 'audio/mpeg',
            upsert: true,
          });

        if (uploadError) {
          console.error(`Upload error for session ${session.numero}:`, uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('teachings-audio')
          .getPublicUrl(fileName);

        const audioUrl = urlData.publicUrl;

        // Update session with audio URL
        const { error: updateError } = await supabase
          .from('gratitude_sessions')
          .update({ audio_url: audioUrl })
          .eq('id', session.id);

        if (updateError) throw updateError;

        console.log(`✅ Generated audio for session ${session.numero}`);
        results.push({
          numero: session.numero,
          titulo: session.titulo,
          status: 'success',
          audioUrl
        });

      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        console.error(`Error generating audio for session ${session.numero}:`, e);
        results.push({
          numero: session.numero,
          titulo: session.titulo,
          status: 'error',
          error: errorMsg
        });
      }
    }

    // Get remaining count
    const { count: remainingCount } = await supabase
      .from('gratitude_sessions')
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
    console.error('Error in batch-gratitude-tts:', error);
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
