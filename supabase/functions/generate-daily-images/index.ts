import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyAdmin } from "../_shared/verifyAdmin.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ImageConfig {
  tipo: 'santo' | 'evangelio' | 'versiculo' | 'reflexion';
  formato: 'story' | 'post';
  prompt: string;
  metadata: Record<string, unknown>;
}

const BRAND_DESCRIPTION = `
BRANDING REQUIREMENTS (CRITICAL):
- Include a prominent lion logo silhouette in a corner (representing "ElRugido" - The Roar)
- Add text "ElRugido" in elegant serif font near the logo
- Website URL: "elrugido.com" in smaller text
- Use brand colors: deep gold (#D4AF37), rich burgundy, and pure white
- The lion should be majestic, powerful, symbolizing faith
`;

const formatDate = () => {
  const now = new Date();
  const day = now.getDate();
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const month = months[now.getMonth()];
  return `${day} de ${month}`;
};

// Helper to generate image with AI
async function generateImage(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image-preview",
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const message = result.choices?.[0]?.message;
  
  if (message?.images && Array.isArray(message.images)) {
    for (const img of message.images) {
      if (img.type === 'image_url' && img.image_url?.url) {
        return img.image_url.url;
      }
    }
  }
  
  throw new Error("No image generated from AI");
}

// Helper to convert image data to blob
async function imageToBlob(imageData: string): Promise<Blob> {
  if (imageData.startsWith('data:')) {
    const base64Data = imageData.split(',')[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let j = 0; j < binaryString.length; j++) {
      bytes[j] = binaryString.charCodeAt(j);
    }
    return new Blob([bytes], { type: 'image/png' });
  } else {
    const imgResponse = await fetch(imageData);
    return await imgResponse.blob();
  }
}

// Create Story (9:16) from Post (1:1) by extending with gradient
async function createStoryFromPost(postImageBlob: Blob): Promise<Blob> {
  // For Deno edge functions, we'll generate Story separately but with EXPLICIT consistency instructions
  // Since we can't do canvas operations in Deno without additional libs
  // Instead, we return null to signal frontend should handle this
  return postImageBlob; // Fallback - frontend will compose
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body for force parameter
    let force = false;
    try {
      const body = await req.json();
      force = body?.force === true;
    } catch {
      // No body or invalid JSON, default to false
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const apiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date().toISOString().split('T')[0];
    const formattedDate = formatDate();
    console.log(`Generating daily images for ${today}, force=${force}`);

    // If force=true, delete all existing images for today
    if (force) {
      console.log("Force mode: Deleting existing images for today...");
      
      // Get existing images to delete from storage
      const { data: existingImages } = await supabase
        .from('daily_share_images')
        .select('tipo, formato')
        .eq('fecha', today);
      
      if (existingImages && existingImages.length > 0) {
        // Delete from storage
        const filesToDelete = existingImages.map(
          (img: { tipo: string; formato: string }) => `${today}/${img.tipo}-${img.formato}.png`
        );
        await supabase.storage.from('daily-share-images').remove(filesToDelete);
        
        // Delete from database
        await supabase.from('daily_share_images').delete().eq('fecha', today);
        console.log(`Deleted ${existingImages.length} existing images`);
      }
    }

    // Check if images already exist for today (after potential deletion)
    const { data: existingImages } = await supabase
      .from('daily_share_images')
      .select('tipo, formato, image_url')
      .eq('fecha', today);

    const existingKeys = new Set(
      (existingImages || []).map((img: { tipo: string; formato: string }) => `${img.tipo}-${img.formato}`)
    );

    // Fetch daily content
    const [saintResult, gospelResult, contentResult] = await Promise.all([
      supabase
        .from('calendar_saints')
        .select('*')
        .eq('feast_day', new Date().getDate())
        .eq('feast_month', new Date().getMonth() + 1)
        .limit(1)
        .maybeSingle(),
      supabase
        .from('daily_gospel')
        .select('*')
        .eq('fecha', today)
        .maybeSingle(),
      supabase
        .from('daily_content')
        .select('*')
        .eq('fecha', today)
        .maybeSingle()
    ]);

    const saint = saintResult.data;
    const gospel = gospelResult.data;
    const content = contentResult.data;

    console.log("Data fetched:", { saint: !!saint, gospel: !!gospel, content: !!content });

    const results: { tipo: string; formato: string; success: boolean; error?: string }[] = [];

    // Helper to upload and save
    async function uploadAndSave(
      imageData: string, 
      tipo: string, 
      formato: string, 
      metadata: Record<string, unknown>
    ): Promise<void> {
      const imageBlob = await imageToBlob(imageData);
      const fileName = `${today}/${tipo}-${formato}.png`;
      
      const { error: uploadError } = await supabase.storage
        .from('daily-share-images')
        .upload(fileName, imageBlob, { contentType: 'image/png', upsert: true });

      if (uploadError) throw new Error(`Upload error: ${uploadError.message}`);

      const { data: publicUrlData } = supabase.storage
        .from('daily-share-images')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('daily_share_images')
        .upsert({
          fecha: today,
          tipo,
          formato,
          image_url: publicUrlData.publicUrl,
          metadata
        }, { onConflict: 'fecha,tipo,formato' });

      if (dbError) throw new Error(`Database error: ${dbError.message}`);
    }

    // ============ SANTO DEL DÍA - ONLY GENERATE POST, STORY COMPOSED FROM POST ============
    if (saint) {
      const saintMetadata = { name: saint.name, category: saint.category, description: saint.description };
      const saintDescShort = saint.description ? saint.description.substring(0, 200) : '';
      
      // Only generate POST (1:1) - this is the SINGLE source of truth
      if (!existingKeys.has('santo-post')) {
        try {
          console.log("Generating santo-post (master image)...");
          const postPrompt = `Create a STUNNING Catholic social media image.

SUBJECT: ${saint.name} - Santo del día
${saintDescShort ? `Bio: ${saintDescShort}` : ''}

STYLE:
- Hyper-realistic Renaissance oil painting
- Dramatic chiaroscuro with divine golden rays
- Rich colors: royal blues, deep golds, sacred purples
- Saint CENTERED in frame with space around

TEXT (CRITICAL - NO TRUNCATION):
- "${saint.name}" - COMPLETE name in elegant gold serif
- "Santo del día" subtitle
- "${formattedDate}"
- All text 10% from edges

${BRAND_DESCRIPTION}

FORMAT: Square 1:1 (1080x1080px)`;

          const imageUrl = await generateImage(postPrompt, apiKey);
          await uploadAndSave(imageUrl, 'santo', 'post', saintMetadata);
          results.push({ tipo: 'santo', formato: 'post', success: true });
          console.log("✓ santo-post generated");
        } catch (error) {
          console.error("✗ Error santo-post:", error);
          results.push({ tipo: 'santo', formato: 'post', success: false, error: String(error) });
        }
      }

      // For Story: Copy the Post image and mark it - frontend will compose the 9:16 version
      // by centering the 1:1 image with gradient padding
      if (!existingKeys.has('santo-story')) {
        // Get the post image URL
        const { data: postData } = await supabase
          .from('daily_share_images')
          .select('image_url')
          .eq('fecha', today)
          .eq('tipo', 'santo')
          .eq('formato', 'post')
          .maybeSingle();

        if (postData?.image_url) {
          // Store the same URL for story - frontend will handle the composition
          const { error: dbError } = await supabase
            .from('daily_share_images')
            .upsert({
              fecha: today,
              tipo: 'santo',
              formato: 'story',
              image_url: postData.image_url, // Same image - frontend composes
              metadata: { ...saintMetadata, composed_from_post: true }
            }, { onConflict: 'fecha,tipo,formato' });

          if (!dbError) {
            results.push({ tipo: 'santo', formato: 'story', success: true });
            console.log("✓ santo-story linked to post (frontend will compose)");
          } else {
            results.push({ tipo: 'santo', formato: 'story', success: false, error: dbError.message });
          }
        }
      }
    }

    // ============ OTHER CONTENT - PARALLEL GENERATION ============
    const parallelConfigs: ImageConfig[] = [];

    // Evangelio del día
    if (gospel) {
      const gospelMetadata = { referencia: gospel.referencia, titulo: gospel.titulo, tiempo_liturgico: gospel.tiempo_liturgico };
      const gospelBasePrompt = `Create a beautiful Catholic Gospel image.

REFERENCE: ${gospel.referencia}
${gospel.titulo ? `TITLE: ${gospel.titulo}` : ''}
LITURGICAL SEASON: ${gospel.tiempo_liturgico || 'Tiempo Ordinario'}

STYLE:
- Open ancient Bible with golden light
- Ethereal atmosphere with divine rays
- Colors for ${gospel.tiempo_liturgico || 'Ordinary Time'}

TEXT:
- "EVANGELIO DEL DÍA" header
- "${gospel.referencia}" prominently
- "${formattedDate}"

${BRAND_DESCRIPTION}`;

      if (!existingKeys.has('evangelio-story')) {
        parallelConfigs.push({
          tipo: 'evangelio', formato: 'story',
          prompt: `${gospelBasePrompt}\n\nFORMAT: 9:16 vertical (1080x1920px)`,
          metadata: gospelMetadata
        });
      }
      if (!existingKeys.has('evangelio-post')) {
        parallelConfigs.push({
          tipo: 'evangelio', formato: 'post',
          prompt: `${gospelBasePrompt}\n\nFORMAT: 1:1 square (1080x1080px)`,
          metadata: gospelMetadata
        });
      }
    }

    // Versículo del día
    if (content) {
      const verseText = content.versiculo_texto.length > 120 
        ? content.versiculo_texto.substring(0, 117) + '...'
        : content.versiculo_texto;
      const verseMetadata = { texto: content.versiculo_texto, referencia: content.versiculo_referencia };

      const verseBasePrompt = `Create a stunning Bible verse image.

VERSE: "${verseText}"
REFERENCE: ${content.versiculo_referencia}

STYLE:
- Beautiful calligraphy for the verse
- Soft bokeh/nature background
- Warm colors: sunrise golds, peaceful blues
- Verse is the hero - large, centered

TEXT:
- The verse in beautiful typography
- "${content.versiculo_referencia}"
- "${formattedDate}"

${BRAND_DESCRIPTION}`;

      if (!existingKeys.has('versiculo-story')) {
        parallelConfigs.push({
          tipo: 'versiculo', formato: 'story',
          prompt: `${verseBasePrompt}\n\nFORMAT: 9:16 vertical (1080x1920px)`,
          metadata: verseMetadata
        });
      }
      if (!existingKeys.has('versiculo-post')) {
        parallelConfigs.push({
          tipo: 'versiculo', formato: 'post',
          prompt: `${verseBasePrompt}\n\nFORMAT: 1:1 square (1080x1080px)`,
          metadata: verseMetadata
        });
      }
    }

    // Reflexión del día
    if (content?.reflexion_ia) {
      const sentences = content.reflexion_ia.split(/[.!?]+/).filter((s: string) => s.trim().length > 20);
      const reflexionShort = sentences[0]?.trim().substring(0, 150) || content.reflexion_ia.substring(0, 150);
      const reflexionMetadata = { excerpt: reflexionShort };

      const reflexionBasePrompt = `Create a contemplative reflection image.

QUOTE: "${reflexionShort}"

STYLE:
- Serene, meditative atmosphere
- Peaceful sunrise/sunset or quiet chapel
- Warm lighting suggesting God's presence
- Subtle Catholic elements

TEXT:
- "REFLEXIÓN DEL DÍA" header
- The quote in elegant font
- "${formattedDate}"

${BRAND_DESCRIPTION}`;

      if (!existingKeys.has('reflexion-story')) {
        parallelConfigs.push({
          tipo: 'reflexion', formato: 'story',
          prompt: `${reflexionBasePrompt}\n\nFORMAT: 9:16 vertical (1080x1920px)`,
          metadata: reflexionMetadata
        });
      }
      if (!existingKeys.has('reflexion-post')) {
        parallelConfigs.push({
          tipo: 'reflexion', formato: 'post',
          prompt: `${reflexionBasePrompt}\n\nFORMAT: 1:1 square (1080x1080px)`,
          metadata: reflexionMetadata
        });
      }
    }

    console.log(`Generating ${parallelConfigs.length} additional images...`);

    // Process parallel configs in batches of 2
    for (let i = 0; i < parallelConfigs.length; i += 2) {
      const batch = parallelConfigs.slice(i, i + 2);
      
      const batchResults = await Promise.all(
        batch.map(async (config: ImageConfig) => {
          try {
            console.log(`Generating ${config.tipo}-${config.formato}...`);
            const imageUrl = await generateImage(config.prompt, apiKey);
            await uploadAndSave(imageUrl, config.tipo, config.formato, config.metadata);
            console.log(`✓ ${config.tipo}-${config.formato} generated`);
            return { tipo: config.tipo, formato: config.formato, success: true };
          } catch (error) {
            console.error(`✗ Error ${config.tipo}-${config.formato}:`, error);
            return { tipo: config.tipo, formato: config.formato, success: false, error: String(error) };
          }
        })
      );

      results.push(...batchResults);
      
      if (i + 2 < parallelConfigs.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success);

    console.log(`Generation complete: ${successful}/${results.length} successful`);

    return new Response(
      JSON.stringify({
        success: true,
        date: today,
        generated: successful,
        total: results.length,
        skipped: existingKeys.size,
        results,
        failed: failed.length > 0 ? failed : undefined
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-daily-images:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
