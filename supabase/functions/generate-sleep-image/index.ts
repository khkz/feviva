import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

async function generateImage(titulo: string, descripcion: string): Promise<string | null> {
  if (!LOVABLE_API_KEY) {
    console.error('LOVABLE_API_KEY not configured');
    return null;
  }

  const prompt = `A serene and peaceful artistic illustration for a biblical sleep story titled "${titulo}". 
${descripcion}

Style: Soft digital art with dreamy atmosphere, deep night sky colors (indigo, purple, dark blue), 
soft moonlight glow, gentle stars, peaceful and calming mood. 
The image should evoke tranquility and restfulness, perfect for bedtime.
Ultra high resolution, 16:9 aspect ratio.`;

  console.log('Generating image with prompt:', prompt.substring(0, 200) + '...');

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Image generation failed:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log('Image generation response received');

    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      console.error('No image URL in response');
      return null;
    }

    return imageUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
}

async function uploadToStorage(supabase: any, base64Image: string, storyId: string): Promise<string | null> {
  try {
    // Remove the data URL prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    
    // Convert base64 to Uint8Array
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const fileName = `${storyId}-${Date.now()}.png`;
    
    const { data, error } = await supabase.storage
      .from('sleep-images')
      .upload(fileName, bytes, {
        contentType: 'image/png',
        upsert: true
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('sleep-images')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading to storage:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { storyId } = await req.json();

    if (!storyId) {
      return new Response(
        JSON.stringify({ error: 'storyId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get the story
    const { data: story, error: storyError } = await supabase
      .from('sleep_stories')
      .select('id, titulo, descripcion, imagen_url')
      .eq('id', storyId)
      .single();

    if (storyError || !story) {
      console.error('Story not found:', storyError);
      return new Response(
        JSON.stringify({ error: 'Story not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (story.imagen_url) {
      console.log('Story already has an image');
      return new Response(
        JSON.stringify({ success: true, imageUrl: story.imagen_url, message: 'Image already exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating image for story: ${story.titulo}`);

    // Generate the image
    const base64Image = await generateImage(story.titulo, story.descripcion);

    if (!base64Image) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upload to storage
    const publicUrl = await uploadToStorage(supabase, base64Image, storyId);

    if (!publicUrl) {
      // If storage upload fails, use the base64 directly (not ideal but works)
      console.log('Storage upload failed, using base64 directly');
      
      const { error: updateError } = await supabase
        .from('sleep_stories')
        .update({ imagen_url: base64Image })
        .eq('id', storyId);

      if (updateError) {
        console.error('Failed to update story with base64:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to save image' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, imageUrl: base64Image }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the story with the public URL
    const { error: updateError } = await supabase
      .from('sleep_stories')
      .update({ imagen_url: publicUrl })
      .eq('id', storyId);

    if (updateError) {
      console.error('Failed to update story:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update story with image URL' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully generated image for: ${story.titulo}`);

    return new Response(
      JSON.stringify({ success: true, imageUrl: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-sleep-image:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
