import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const apiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    console.log(`Generating daily images for ${today}`);

    // Check if images already exist for today
    const { data: existingImages } = await supabase
      .from('daily_share_images')
      .select('tipo, formato')
      .eq('fecha', today);

    const existingKeys = new Set(
      (existingImages || []).map(img => `${img.tipo}-${img.formato}`)
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

    // Build image configurations
    const imageConfigs: ImageConfig[] = [];

    // Santo del día
    if (saint) {
      const saintBasePrompt = `Create a beautiful, inspiring Catholic religious image for sharing on social media.

Subject: ${saint.name}
Category: ${saint.category}
${saint.description ? `Description: ${saint.description}` : ''}

Design requirements:
- Professional, reverent Catholic art style
- Warm, golden lighting evoking divine presence
- Include the saint's name prominently: "${saint.name}"
- Add today's date: "${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}"
- Include subtle branding text at bottom: "ElRugido.com"
- Use rich colors: deep blues, golds, warm whites
- Photorealistic or classical religious art style
- NO text errors - make sure all text is perfectly readable`;

      if (!existingKeys.has('santo-story')) {
        imageConfigs.push({
          tipo: 'santo',
          formato: 'story',
          prompt: `${saintBasePrompt}\n\nFormat: Instagram Story (9:16 vertical, 1080x1920px)
- Full height vertical composition
- Saint image takes center focus
- Name at top, date and branding at bottom`,
          metadata: { name: saint.name, category: saint.category, description: saint.description }
        });
      }

      if (!existingKeys.has('santo-post')) {
        imageConfigs.push({
          tipo: 'santo',
          formato: 'post',
          prompt: `${saintBasePrompt}\n\nFormat: Instagram Post (1:1 square, 1080x1080px)
- Square composition with balanced layout
- Saint image centered
- Text overlay at bottom third`,
          metadata: { name: saint.name, category: saint.category, description: saint.description }
        });
      }
    }

    // Evangelio del día
    if (gospel) {
      const gospelBasePrompt = `Create a beautiful, inspiring Catholic image for daily Gospel sharing.

Reference: ${gospel.referencia}
${gospel.titulo ? `Title: ${gospel.titulo}` : ''}
Liturgical time: ${gospel.tiempo_liturgico || 'Tiempo Ordinario'}

Design requirements:
- Elegant, contemplative Catholic design
- Open Bible or Gospel book as visual element
- Include text: "Evangelio del día"
- Include reference: "${gospel.referencia}"
- Add date: "${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}"
- Branding: "ElRugido.com" at bottom
- Colors: liturgical appropriate (greens, whites, purples, or reds based on season)
- Peaceful, meditative atmosphere`;

      if (!existingKeys.has('evangelio-story')) {
        imageConfigs.push({
          tipo: 'evangelio',
          formato: 'story',
          prompt: `${gospelBasePrompt}\n\nFormat: Instagram Story (9:16 vertical, 1080x1920px)`,
          metadata: { referencia: gospel.referencia, titulo: gospel.titulo, tiempo_liturgico: gospel.tiempo_liturgico }
        });
      }

      if (!existingKeys.has('evangelio-post')) {
        imageConfigs.push({
          tipo: 'evangelio',
          formato: 'post',
          prompt: `${gospelBasePrompt}\n\nFormat: Instagram Post (1:1 square, 1080x1080px)`,
          metadata: { referencia: gospel.referencia, titulo: gospel.titulo, tiempo_liturgico: gospel.tiempo_liturgico }
        });
      }
    }

    // Versículo del día
    if (content) {
      const verseText = content.versiculo_texto.length > 150 
        ? content.versiculo_texto.substring(0, 147) + '...'
        : content.versiculo_texto;

      const verseBasePrompt = `Create a beautiful typographic image for a daily Bible verse.

Verse: "${verseText}"
Reference: ${content.versiculo_referencia}

Design requirements:
- Elegant, readable typography as the main focus
- The verse text must be clearly visible and spelled correctly
- Soft, peaceful background (light rays, nature, clouds)
- Include reference: "${content.versiculo_referencia}"
- Branding: "ElRugido.com" subtly at bottom
- Colors: calming blues, soft golds, pure whites
- Inspirational, shareable aesthetic`;

      if (!existingKeys.has('versiculo-story')) {
        imageConfigs.push({
          tipo: 'versiculo',
          formato: 'story',
          prompt: `${verseBasePrompt}\n\nFormat: Instagram Story (9:16 vertical, 1080x1920px)
- Verse centered vertically
- Large, readable text`,
          metadata: { texto: content.versiculo_texto, referencia: content.versiculo_referencia }
        });
      }

      if (!existingKeys.has('versiculo-post')) {
        imageConfigs.push({
          tipo: 'versiculo',
          formato: 'post',
          prompt: `${verseBasePrompt}\n\nFormat: Instagram Post (1:1 square, 1080x1080px)`,
          metadata: { texto: content.versiculo_texto, referencia: content.versiculo_referencia }
        });
      }
    }

    // Reflexión del día
    if (content?.reflexion_ia) {
      // Extract a short quote from the reflection
      const reflexionShort = content.reflexion_ia.length > 200
        ? content.reflexion_ia.substring(0, 197) + '...'
        : content.reflexion_ia;

      const reflexionBasePrompt = `Create a contemplative, inspiring image for daily Catholic reflection.

Reflection excerpt: "${reflexionShort}"

Design requirements:
- Meditative, peaceful atmosphere
- Catholic imagery (cross, light rays, nature)
- Include text: "Reflexión del día"
- Date: "${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}"
- Branding: "ElRugido.com" at bottom
- Warm, inviting colors
- Professional, shareable design`;

      if (!existingKeys.has('reflexion-story')) {
        imageConfigs.push({
          tipo: 'reflexion',
          formato: 'story',
          prompt: `${reflexionBasePrompt}\n\nFormat: Instagram Story (9:16 vertical, 1080x1920px)`,
          metadata: { excerpt: reflexionShort }
        });
      }

      if (!existingKeys.has('reflexion-post')) {
        imageConfigs.push({
          tipo: 'reflexion',
          formato: 'post',
          prompt: `${reflexionBasePrompt}\n\nFormat: Instagram Post (1:1 square, 1080x1080px)`,
          metadata: { excerpt: reflexionShort }
        });
      }
    }

    console.log(`Generating ${imageConfigs.length} images...`);

    // Generate images (process in batches of 2 to avoid rate limits)
    const results: { tipo: string; formato: string; success: boolean; error?: string }[] = [];

    for (let i = 0; i < imageConfigs.length; i += 2) {
      const batch = imageConfigs.slice(i, i + 2);
      
      const batchResults = await Promise.all(
        batch.map(async (config) => {
          try {
            console.log(`Generating ${config.tipo}-${config.formato}...`);
            
            // Generate image with AI
            const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash-image-preview",
                messages: [
                  {
                    role: "user",
                    content: config.prompt
                  }
                ],
                modalities: ["image", "text"]
              })
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`AI API error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            
            // Extract image from response
            let imageData: string | null = null;
            const message = result.choices?.[0]?.message;
            
            if (message?.images && Array.isArray(message.images)) {
              for (const img of message.images) {
                if (img.type === 'image_url' && img.image_url?.url) {
                  imageData = img.image_url.url;
                  break;
                }
              }
            }

            if (!imageData) {
              throw new Error("No image generated from AI");
            }

            // Convert base64 to blob if needed
            let imageBlob: Blob;
            if (imageData.startsWith('data:')) {
              const base64Data = imageData.split(',')[1];
              const binaryString = atob(base64Data);
              const bytes = new Uint8Array(binaryString.length);
              for (let j = 0; j < binaryString.length; j++) {
                bytes[j] = binaryString.charCodeAt(j);
              }
              imageBlob = new Blob([bytes], { type: 'image/png' });
            } else {
              // Fetch the image URL
              const imgResponse = await fetch(imageData);
              imageBlob = await imgResponse.blob();
            }

            // Upload to storage
            const fileName = `${today}/${config.tipo}-${config.formato}.png`;
            const { error: uploadError } = await supabase.storage
              .from('daily-share-images')
              .upload(fileName, imageBlob, {
                contentType: 'image/png',
                upsert: true
              });

            if (uploadError) {
              throw new Error(`Upload error: ${uploadError.message}`);
            }

            // Get public URL
            const { data: publicUrlData } = supabase.storage
              .from('daily-share-images')
              .getPublicUrl(fileName);

            // Save to database
            const { error: dbError } = await supabase
              .from('daily_share_images')
              .upsert({
                fecha: today,
                tipo: config.tipo,
                formato: config.formato,
                image_url: publicUrlData.publicUrl,
                metadata: config.metadata
              }, {
                onConflict: 'fecha,tipo,formato'
              });

            if (dbError) {
              throw new Error(`Database error: ${dbError.message}`);
            }

            console.log(`✓ ${config.tipo}-${config.formato} generated successfully`);
            return { tipo: config.tipo, formato: config.formato, success: true };

          } catch (error) {
            console.error(`✗ Error generating ${config.tipo}-${config.formato}:`, error);
            return { 
              tipo: config.tipo, 
              formato: config.formato, 
              success: false, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            };
          }
        })
      );

      results.push(...batchResults);
      
      // Small delay between batches
      if (i + 2 < imageConfigs.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
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
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});