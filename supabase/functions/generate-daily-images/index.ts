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

// Logo ElRugido en formato base64 simplificado o descripción para el prompt
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
    const formattedDate = formatDate();
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

    // Santo del día - PROMPTS MEJORADOS
    if (saint) {
      const saintBasePrompt = `Create a STUNNING, viral-worthy Catholic social media image that will inspire people to share their faith.

SUBJECT: ${saint.name} - Santo del día
${saint.description ? `Biography: ${saint.description}` : ''}

VISUAL STYLE:
- Hyper-realistic digital art or Renaissance-inspired oil painting style
- Dramatic chiaroscuro lighting with divine golden rays breaking through clouds
- Rich, saturated colors: royal blues, deep golds, sacred purples
- Emotional and spiritually moving composition
- The saint should look noble, holy, and inspiring

TEXT OVERLAY (MUST BE PERFECTLY LEGIBLE):
- Large title: "${saint.name}" in elegant gold serif font
- Date: "${formattedDate}" in white
- Small accent text: "Santo del día"

${BRAND_DESCRIPTION}

MOOD: Inspiring, sacred, powerful, shareable - makes people want to share it immediately
NO spelling errors - all text must be perfect`;

      if (!existingKeys.has('santo-story')) {
        imageConfigs.push({
          tipo: 'santo',
          formato: 'story',
          prompt: `${saintBasePrompt}

FORMAT: Instagram/WhatsApp Story (9:16 vertical aspect ratio, 1080x1920px)
- Saint image dominates center
- Name at top with decorative elements
- Date and branding at bottom
- Leave some space for UI elements`,
          metadata: { name: saint.name, category: saint.category, description: saint.description }
        });
      }

      if (!existingKeys.has('santo-post')) {
        imageConfigs.push({
          tipo: 'santo',
          formato: 'post',
          prompt: `${saintBasePrompt}

FORMAT: Instagram/Facebook Post (1:1 square, 1080x1080px)
- Balanced square composition
- Saint centered with elegant border
- Text overlays clear and prominent`,
          metadata: { name: saint.name, category: saint.category, description: saint.description }
        });
      }
    }

    // Evangelio del día - PROMPTS MEJORADOS
    if (gospel) {
      const gospelBasePrompt = `Create a BEAUTIFUL, shareable Catholic image for today's Gospel reading.

REFERENCE: ${gospel.referencia}
${gospel.titulo ? `TITLE: ${gospel.titulo}` : ''}
LITURGICAL SEASON: ${gospel.tiempo_liturgico || 'Tiempo Ordinario'}

VISUAL STYLE:
- Open ancient Bible or illuminated manuscript with golden light emanating from pages
- Soft, ethereal atmosphere with divine rays of light
- Background: ancient church interior or sacred garden
- Colors based on liturgical season: 
  * Ordinary Time: deep green
  * Lent: purple
  * Easter: white/gold
  * Advent: purple/blue
  * Christmas: white/gold

TEXT OVERLAY (MUST BE PERFECTLY LEGIBLE):
- Header: "EVANGELIO DEL DÍA" in elegant serif
- Reference: "${gospel.referencia}" prominently displayed
- Date: "${formattedDate}"

${BRAND_DESCRIPTION}

MOOD: Contemplative, sacred, inviting people to read the Word`;

      if (!existingKeys.has('evangelio-story')) {
        imageConfigs.push({
          tipo: 'evangelio',
          formato: 'story',
          prompt: `${gospelBasePrompt}

FORMAT: Instagram/WhatsApp Story (9:16 vertical, 1080x1920px)`,
          metadata: { referencia: gospel.referencia, titulo: gospel.titulo, tiempo_liturgico: gospel.tiempo_liturgico }
        });
      }

      if (!existingKeys.has('evangelio-post')) {
        imageConfigs.push({
          tipo: 'evangelio',
          formato: 'post',
          prompt: `${gospelBasePrompt}

FORMAT: Instagram/Facebook Post (1:1 square, 1080x1080px)`,
          metadata: { referencia: gospel.referencia, titulo: gospel.titulo, tiempo_liturgico: gospel.tiempo_liturgico }
        });
      }
    }

    // Versículo del día - PROMPTS MEJORADOS
    if (content) {
      const verseText = content.versiculo_texto.length > 120 
        ? content.versiculo_texto.substring(0, 117) + '...'
        : content.versiculo_texto;

      const verseBasePrompt = `Create a STUNNING typographic Bible verse image that people will want to save and share.

VERSE: "${verseText}"
REFERENCE: ${content.versiculo_referencia}

VISUAL STYLE:
- Beautiful calligraphy or elegant modern typography for the verse
- Background: soft bokeh light effects, gentle nature (mountains, sky, ocean) or sacred space
- Warm, hopeful color palette: sunrise golds, peaceful blues, pure whites
- The verse text MUST be the hero - large, centered, perfectly readable
- Subtle decorative elements (olive branches, dove, cross outline)

TEXT REQUIREMENTS:
- The verse in large, beautiful typography (NO SPELLING ERRORS)
- Reference "${content.versiculo_referencia}" below the verse
- Date: "${formattedDate}"

${BRAND_DESCRIPTION}

MOOD: Hopeful, inspiring, comforting - the kind of image people screenshot and share`;

      if (!existingKeys.has('versiculo-story')) {
        imageConfigs.push({
          tipo: 'versiculo',
          formato: 'story',
          prompt: `${verseBasePrompt}

FORMAT: Instagram/WhatsApp Story (9:16 vertical, 1080x1920px)
- Verse centered vertically with generous padding
- Large, dramatic typography`,
          metadata: { texto: content.versiculo_texto, referencia: content.versiculo_referencia }
        });
      }

      if (!existingKeys.has('versiculo-post')) {
        imageConfigs.push({
          tipo: 'versiculo',
          formato: 'post',
          prompt: `${verseBasePrompt}

FORMAT: Instagram/Facebook Post (1:1 square, 1080x1080px)`,
          metadata: { texto: content.versiculo_texto, referencia: content.versiculo_referencia }
        });
      }
    }

    // Reflexión del día - PROMPTS MEJORADOS
    if (content?.reflexion_ia) {
      // Extract first meaningful sentence
      const sentences = content.reflexion_ia.split(/[.!?]+/).filter((s: string) => s.trim().length > 20);
      const reflexionShort = sentences[0]?.trim().substring(0, 150) || content.reflexion_ia.substring(0, 150);

      const reflexionBasePrompt = `Create a CONTEMPLATIVE, shareable image for daily Catholic reflection.

REFLECTION QUOTE: "${reflexionShort}"

VISUAL STYLE:
- Serene, meditative atmosphere
- Background: peaceful sunrise/sunset, quiet chapel, or contemplative nature scene
- Soft, warm lighting suggesting God's presence
- Subtle Catholic elements: cross silhouette, praying hands outline, rosary
- Colors: warm earth tones, soft golds, peaceful blues

TEXT OVERLAY:
- Header: "REFLEXIÓN DEL DÍA" 
- The quote in elegant, readable font
- Date: "${formattedDate}"

${BRAND_DESCRIPTION}

MOOD: Peaceful, thought-provoking, spiritually nourishing`;

      if (!existingKeys.has('reflexion-story')) {
        imageConfigs.push({
          tipo: 'reflexion',
          formato: 'story',
          prompt: `${reflexionBasePrompt}

FORMAT: Instagram/WhatsApp Story (9:16 vertical, 1080x1920px)`,
          metadata: { excerpt: reflexionShort }
        });
      }

      if (!existingKeys.has('reflexion-post')) {
        imageConfigs.push({
          tipo: 'reflexion',
          formato: 'post',
          prompt: `${reflexionBasePrompt}

FORMAT: Instagram/Facebook Post (1:1 square, 1080x1080px)`,
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
            
            // Generate image with AI - CORRECTED URL
            const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            console.log(`AI response for ${config.tipo}-${config.formato}:`, JSON.stringify(result).substring(0, 500));
            
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
              console.error(`No image in response:`, JSON.stringify(result).substring(0, 1000));
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
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
