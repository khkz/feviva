import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// NASA Space Sounds - Public Domain
// These are sonifications and actual recordings from NASA missions
const NASA_SOUNDS = [
  {
    id: 'marte',
    name: 'Viento de Marte',
    // NASA InSight Mars Lander - Wind on Mars
    sourceUrl: 'https://mars.nasa.gov/system/downloadable_items/45599_Mars_raw_wind.wav',
    filename: 'viento-marte.mp3',
    description: 'Captado por InSight 2018',
  },
  {
    id: 'jupiter',
    name: 'Plasma de Júpiter',
    // NASA Voyager - Jupiter Radio Emissions (Chorus)
    sourceUrl: 'https://www.nasa.gov/wp-content/uploads/2015/01/590318main_emfisis_chorus_1.wav',
    filename: 'plasma-jupiter.mp3',
    description: 'Voyager - Magnetosfera',
  },
  {
    id: 'saturno',
    name: 'Radio de Saturno',
    // Cassini Saturn Radio Emissions
    sourceUrl: 'https://www.nasa.gov/wp-content/uploads/2015/01/590325main_saturn-radio-emmissions.wav',
    filename: 'radio-saturno.mp3',
    description: 'Cassini - Emisiones de radio',
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

    for (const sound of NASA_SOUNDS) {
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
        // Fetch the audio file from NASA
        console.log(`Fetching from NASA: ${sound.sourceUrl}`);
        const response = await fetch(sound.sourceUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; ElRugido/1.0)',
          },
        });

        if (!response.ok) {
          console.error(`Failed to fetch ${sound.name}: ${response.status}`);
          results.push({
            id: sound.id,
            name: sound.name,
            filename: sound.filename,
            status: 'fetch_failed',
            error: `HTTP ${response.status}`,
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
        message: `Processed ${successCount}/${NASA_SOUNDS.length} NASA sounds`,
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
