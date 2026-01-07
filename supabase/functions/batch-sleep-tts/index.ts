import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// Convierte números del 0-150 a palabras en español
function numberToSpanishWord(num: number): string {
  const units = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const teens = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
  const tens = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const hundreds = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

  if (num < 0 || num > 150) return String(num);
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

// Limpia el texto para mejor pronunciación en español
function cleanTextForSpanishTTS(text: string): string {
  let cleaned = text;
  
  // Abreviaciones de libros bíblicos - Antiguo Testamento
  const biblicalBooks: [RegExp, string][] = [
    [/\bGn\.?\s/gi, 'Génesis '],
    [/\bGén\.?\s/gi, 'Génesis '],
    [/\bEx\.?\s/gi, 'Éxodo '],
    [/\bÉx\.?\s/gi, 'Éxodo '],
    [/\bLv\.?\s/gi, 'Levítico '],
    [/\bLev\.?\s/gi, 'Levítico '],
    [/\bNm\.?\s/gi, 'Números '],
    [/\bNúm\.?\s/gi, 'Números '],
    [/\bDt\.?\s/gi, 'Deuteronomio '],
    [/\bDeut\.?\s/gi, 'Deuteronomio '],
    [/\bJos\.?\s/gi, 'Josué '],
    [/\bJue\.?\s/gi, 'Jueces '],
    [/\bRt\.?\s/gi, 'Rut '],
    [/\b1\s?Sam\.?\s/gi, 'primer libro de Samuel '],
    [/\b2\s?Sam\.?\s/gi, 'segundo libro de Samuel '],
    [/\b1\s?Re\.?\s/gi, 'primer libro de Reyes '],
    [/\b2\s?Re\.?\s/gi, 'segundo libro de Reyes '],
    [/\b1\s?Cr\.?\s/gi, 'primer libro de Crónicas '],
    [/\b2\s?Cr\.?\s/gi, 'segundo libro de Crónicas '],
    [/\bEsd\.?\s/gi, 'Esdras '],
    [/\bNeh\.?\s/gi, 'Nehemías '],
    [/\bEst\.?\s/gi, 'Ester '],
    [/\bJob\.?\s/gi, 'Job '],
    [/\bSal\.?\s/gi, 'Salmo '],
    [/\bPr\.?\s/gi, 'Proverbios '],
    [/\bProv\.?\s/gi, 'Proverbios '],
    [/\bEc\.?\s/gi, 'Eclesiastés '],
    [/\bEcl\.?\s/gi, 'Eclesiastés '],
    [/\bCant\.?\s/gi, 'Cantar de los Cantares '],
    [/\bIs\.?\s/gi, 'Isaías '],
    [/\bJer\.?\s/gi, 'Jeremías '],
    [/\bLm\.?\s/gi, 'Lamentaciones '],
    [/\bLam\.?\s/gi, 'Lamentaciones '],
    [/\bEz\.?\s/gi, 'Ezequiel '],
    [/\bDn\.?\s/gi, 'Daniel '],
    [/\bDan\.?\s/gi, 'Daniel '],
    [/\bOs\.?\s/gi, 'Oseas '],
    [/\bJl\.?\s/gi, 'Joel '],
    [/\bAm\.?\s/gi, 'Amós '],
    [/\bAbd\.?\s/gi, 'Abdías '],
    [/\bJon\.?\s/gi, 'Jonás '],
    [/\bMi\.?\s/gi, 'Miqueas '],
    [/\bMiq\.?\s/gi, 'Miqueas '],
    [/\bNah\.?\s/gi, 'Nahúm '],
    [/\bHab\.?\s/gi, 'Habacuc '],
    [/\bSof\.?\s/gi, 'Sofonías '],
    [/\bAg\.?\s/gi, 'Ageo '],
    [/\bZac\.?\s/gi, 'Zacarías '],
    [/\bMal\.?\s/gi, 'Malaquías '],
    // Nuevo Testamento
    [/\bMt\.?\s/gi, 'Mateo '],
    [/\bMat\.?\s/gi, 'Mateo '],
    [/\bMc\.?\s/gi, 'Marcos '],
    [/\bMar\.?\s/gi, 'Marcos '],
    [/\bLc\.?\s/gi, 'Lucas '],
    [/\bLuc\.?\s/gi, 'Lucas '],
    [/\bJn\.?\s/gi, 'Juan '],
    [/\bHch\.?\s/gi, 'Hechos de los Apóstoles '],
    [/\bHe\.?\s/gi, 'Hechos '],
    [/\bRom\.?\s/gi, 'Romanos '],
    [/\bRm\.?\s/gi, 'Romanos '],
    [/\b1\s?Cor\.?\s/gi, 'primera carta a los Corintios '],
    [/\b2\s?Cor\.?\s/gi, 'segunda carta a los Corintios '],
    [/\b1\s?Co\.?\s/gi, 'primera carta a los Corintios '],
    [/\b2\s?Co\.?\s/gi, 'segunda carta a los Corintios '],
    [/\bGál\.?\s/gi, 'Gálatas '],
    [/\bGal\.?\s/gi, 'Gálatas '],
    [/\bEf\.?\s/gi, 'Efesios '],
    [/\bFlp\.?\s/gi, 'Filipenses '],
    [/\bFil\.?\s/gi, 'Filipenses '],
    [/\bCol\.?\s/gi, 'Colosenses '],
    [/\b1\s?Tes\.?\s/gi, 'primera carta a los Tesalonicenses '],
    [/\b2\s?Tes\.?\s/gi, 'segunda carta a los Tesalonicenses '],
    [/\b1\s?Ts\.?\s/gi, 'primera carta a los Tesalonicenses '],
    [/\b2\s?Ts\.?\s/gi, 'segunda carta a los Tesalonicenses '],
    [/\b1\s?Tim\.?\s/gi, 'primera carta a Timoteo '],
    [/\b2\s?Tim\.?\s/gi, 'segunda carta a Timoteo '],
    [/\b1\s?Tm\.?\s/gi, 'primera carta a Timoteo '],
    [/\b2\s?Tm\.?\s/gi, 'segunda carta a Timoteo '],
    [/\bTit\.?\s/gi, 'Tito '],
    [/\bFlm\.?\s/gi, 'Filemón '],
    [/\bHeb\.?\s/gi, 'Hebreos '],
    [/\bStg\.?\s/gi, 'Santiago '],
    [/\bSant\.?\s/gi, 'Santiago '],
    [/\b1\s?Pe\.?\s/gi, 'primera carta de Pedro '],
    [/\b2\s?Pe\.?\s/gi, 'segunda carta de Pedro '],
    [/\b1\s?Jn\.?\s/gi, 'primera carta de Juan '],
    [/\b2\s?Jn\.?\s/gi, 'segunda carta de Juan '],
    [/\b3\s?Jn\.?\s/gi, 'tercera carta de Juan '],
    [/\bJud\.?\s/gi, 'Judas '],
    [/\bAp\.?\s/gi, 'Apocalipsis '],
    [/\bApoc\.?\s/gi, 'Apocalipsis '],
  ];

  // Aplicar reemplazos de libros bíblicos
  for (const [pattern, replacement] of biblicalBooks) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  // Convertir referencias numéricas como "3:16" a "capítulo tres, versículo dieciséis"
  cleaned = cleaned.replace(/(\d{1,3}):(\d{1,3})/g, (match, cap, vers) => {
    const capNum = parseInt(cap, 10);
    const versNum = parseInt(vers, 10);
    return `capítulo ${numberToSpanishWord(capNum)}, versículo ${numberToSpanishWord(versNum)}`;
  });

  // Reemplazos generales
  const replacements: Record<string, string> = {
    'et al.': 'y otros',
    'vs.': 'versus',
    'etc.': 'etcétera',
    'e.g.': 'por ejemplo',
    'i.e.': 'es decir',
    ' II ': ' segundo ',
    ' III ': ' tercero ',
    ' IV ': ' cuarto ',
    ' V ': ' quinto ',
    ' VI ': ' sexto ',
    ' VII ': ' séptimo ',
    ' VIII ': ' octavo ',
    ' IX ': ' noveno ',
    ' X ': ' décimo ',
  };
  
  for (const [key, value] of Object.entries(replacements)) {
    cleaned = cleaned.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), value);
  }
  
  // Limpiar markdown y espacios extra
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

async function generateSpeech(text: string, voice: string = 'nova'): Promise<ArrayBuffer> {
  // Clean text for Spanish pronunciation
  const cleanedText = cleanTextForSpanishTTS(text);
  
  // For very long texts, we need to chunk them (OpenAI TTS has 4096 char limit)
  const maxChunkSize = 4000;
  const chunks: string[] = [];
  
  // Split by paragraphs first, then by sentences if needed
  const paragraphs = cleanedText.split(/\n\n+/);
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
