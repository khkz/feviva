import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { saintId, format = 'story' } = await req.json();
    
    // format: 'story' (9:16) o 'post' (1:1)
    const dimensions = format === 'story' 
      ? { width: 1080, height: 1920 }
      : { width: 1080, height: 1080 };

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obtener datos del santo
    let saint;
    if (saintId) {
      const { data, error } = await supabase
        .from('calendar_saints')
        .select('*')
        .eq('id', saintId)
        .single();
      
      if (error) throw error;
      saint = data;
    } else {
      // Santo del día
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      
      const { data, error } = await supabase
        .from('calendar_saints')
        .select('*')
        .eq('feast_month', month)
        .eq('feast_day', day)
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      saint = data;
    }

    if (!saint) {
      return new Response(
        JSON.stringify({ error: "No se encontró el santo" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Obtener una cita inspiradora relacionada con el santo o usar descripción
    const inspirationalQuote = saint.description 
      ? saint.description.substring(0, 150) + (saint.description.length > 150 ? '...' : '')
      : `Hoy celebramos a ${saint.name}`;

    // Generar imagen con AI
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const aspectRatio = format === 'story' ? '9:16' : '1:1';
    
    const prompt = `Create a beautiful, shareable Catholic saint image for Instagram ${format === 'story' ? 'Stories (9:16 vertical)' : 'feed (square)'}:

SAINT: ${saint.name}
FEAST DAY: ${saint.feast_month}/${saint.feast_day}

Design requirements:
- Elegant, reverent Catholic aesthetic
- Soft golden and navy blue color palette (brand colors)
- Include subtle religious imagery (cross, light rays, dove)
- Text overlay area at bottom for the saint's name
- Vintage religious art style mixed with modern minimalism
- Include "El Rugido" watermark/logo in corner (small, tasteful)
- Include the feast date: ${saint.feast_day} de ${getMonthName(saint.feast_month)}
- Inspiring, spiritual atmosphere with soft light
- Professional quality suitable for social media sharing
- ${saint.image_url ? 'Reference style: traditional Catholic saint iconography' : 'Create an artistic representation of the saint'}

The image should inspire devotion and be worthy of sharing on Catholic social media.
Ultra high resolution, cinematic lighting.`;

    console.log(`Generating share image for saint: ${saint.name}`);

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
            content: prompt
          }
        ],
        modalities: ["image", "text"]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const result = await response.json();
    console.log("AI response structure:", JSON.stringify(Object.keys(result)));
    
    // Extraer imagen del resultado - viene en message.images
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
      console.error("No image found in response. Message keys:", message ? Object.keys(message) : 'no message');
      throw new Error("No image generated");
    }

    // Subir imagen a Storage
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    const fileName = `${saint.id}-${format}-${Date.now()}.png`;
    const filePath = `share-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('saint-images')
      .upload(filePath, imageBytes, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('saint-images')
      .getPublicUrl(filePath);

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: urlData.publicUrl,
        saint: {
          name: saint.name,
          feastDate: `${saint.feast_day} de ${getMonthName(saint.feast_month)}`,
          description: inspirationalQuote
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error generating share image:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getMonthName(month: number): string {
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  return months[month - 1] || '';
}
