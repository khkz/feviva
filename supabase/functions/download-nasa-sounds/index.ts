import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Space Ambient Music - Archive.org Public Domain / Creative Commons
// Using Legowelt's "Ambient Trip Commander" soundtrack (freely available)
const SPACE_SOUNDS = [
  {
    id: 'marte',
    name: 'Atmósfera Marciana',
    // Archive.org - Ambient Trip Commander OST Track 1
    sourceUrl: 'https://archive.org/download/ambient-trip-commander-original-soundtrack-pl6dbk/Legowelt%20-%20Ambient%20Trip%20Commander%20Original%20Soundtrack%20-%2001%20Earth%20that%20Useless%20Place.mp3',
    filename: 'atmosfera-marte.mp3',
    description: 'Ambiente espacial profundo',
  },
  {
    id: 'jupiter',
    name: 'Púlsar Cósmico',
    // Archive.org - Ambient Trip Commander OST Track 2
    sourceUrl: 'https://archive.org/download/ambient-trip-commander-original-soundtrack-pl6dbk/Legowelt%20-%20Ambient%20Trip%20Commander%20Original%20Soundtrack%20-%2002%20My%20Life%20Empty%20and%20Barren.mp3',
    filename: 'pulsar-cosmico.mp3',
    description: 'Ondas de estrella de neutrones',
  },
  {
    id: 'saturno',
    name: 'Cosmos Profundo',
    // Archive.org - Ambient Trip Commander OST Track 3
    sourceUrl: 'https://archive.org/download/ambient-trip-commander-original-soundtrack-pl6dbk/Legowelt%20-%20Ambient%20Trip%20Commander%20Original%20Soundtrack%20-%2003%20Botanical%20Garden%20Follow%20a%20Strange%20Illusion.mp3',
    filename: 'cosmos-profundo.mp3',
    description: 'Ambiente interestelar',
  },
];

const BUCKET_NAME = 'ambient-audio';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting NASA sounds download...");

    // Check if bucket exists, create if not
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);
    
    if (!bucketExists) {
      console.log(`Creating bucket: ${BUCKET_NAME}`);
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        allowedMimeTypes: ['audio/*'],
      });
      if (createError) {
        console.error("Error creating bucket:", createError);
        throw createError;
      }
    }

    const results = [];

    for (const sound of SPACE_SOUNDS) {
      console.log(`Processing: ${sound.name} from ${sound.sourceUrl}`);

      // Check if file already exists
      const { data: existingFile } = await supabase.storage
        .from(BUCKET_NAME)
        .list('', { search: sound.filename });

      if (existingFile && existingFile.length > 0) {
        console.log(`File already exists: ${sound.filename}`);
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${sound.filename}`;
        results.push({
          id: sound.id,
          name: sound.name,
          filename: sound.filename,
          url: publicUrl,
          status: 'already_exists',
        });
        continue;
      }

      try {
        // Fetch the audio file with timeout
        console.log(`Fetching from: ${sound.sourceUrl}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for large files
        
        const response = await fetch(sound.sourceUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; ElRugido/1.0)',
            'Accept': 'audio/*,*/*',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          console.error(`Failed to fetch ${sound.name}: ${response.status} ${response.statusText}`);
          results.push({
            id: sound.id,
            name: sound.name,
            filename: sound.filename,
            status: 'fetch_failed',
            error: `HTTP ${response.status}: ${response.statusText}`,
          });
          continue;
        }

        const audioBlob = await response.blob();
        console.log(`Downloaded ${sound.name}: ${audioBlob.size} bytes`);

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(sound.filename, audioBlob, {
            contentType: 'audio/mpeg',
            upsert: true,
          });

        if (uploadError) {
          console.error(`Upload error for ${sound.name}:`, uploadError);
          results.push({
            id: sound.id,
            name: sound.name,
            filename: sound.filename,
            status: 'upload_failed',
            error: uploadError.message,
          });
          continue;
        }

        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${sound.filename}`;
        console.log(`Uploaded ${sound.name}: ${publicUrl}`);

        results.push({
          id: sound.id,
          name: sound.name,
          description: sound.description,
          filename: sound.filename,
          url: publicUrl,
          status: 'success',
          size: audioBlob.size,
        });
      } catch (fetchError) {
        console.error(`Error processing ${sound.name}:`, fetchError);
        results.push({
          id: sound.id,
          name: sound.name,
          filename: sound.filename,
          status: 'error',
          error: String(fetchError),
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success' || r.status === 'already_exists').length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${successCount}/${SPACE_SOUNDS.length} space ambient sounds`,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in download-nasa-sounds:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: String(error),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
