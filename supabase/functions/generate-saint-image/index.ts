import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { saintId } = await req.json();

    if (!saintId) {
      return new Response(
        JSON.stringify({ error: 'saintId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch saint data
    const { data: saint, error: fetchError } = await supabase
      .from('calendar_saints')
      .select('*')
      .eq('id', saintId)
      .single();

    if (fetchError || !saint) {
      return new Response(
        JSON.stringify({ error: 'Saint not found', details: fetchError }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Skip if already has image
    if (saint.image_url) {
      return new Response(
        JSON.stringify({ message: 'Saint already has an image', image_url: saint.image_url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating image for saint: ${saint.name}`);

    // Get Lovable API Key
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build artistic prompt
    const shortDescription = saint.description 
      ? saint.description.substring(0, 300) 
      : `Patron saint of ${saint.country_code || 'Latin America'}`;
    
    const prompt = `Create a beautiful, reverent religious painting of ${saint.name}. ${shortDescription}. Style: Sacred art with warm golden and divine tones, soft ethereal lighting, baroque-inspired Renaissance aesthetic with modern clarity. The saint should appear majestic, holy, and inspiring. Include subtle religious symbolism appropriate to the saint. Rich colors, detailed clothing and accessories, celestial background with soft clouds or divine light rays. Ultra high resolution, masterpiece quality religious art.`;

    // Call Lovable AI for image generation using chat completions endpoint
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image', 'text'],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate image', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    
    // Extract base64 image from chat completions response format
    const imageData = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData) {
      console.error('No image in response:', JSON.stringify(aiData).substring(0, 500));
      return new Response(
        JSON.stringify({ error: 'No image data returned from AI', response: JSON.stringify(aiData).substring(0, 200) }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract base64 from data URL (format: "data:image/png;base64,...")
    const base64Match = imageData.match(/^data:image\/[^;]+;base64,(.+)$/);
    const base64Image = base64Match ? base64Match[1] : imageData;

    // Convert base64 to Uint8Array
    const binaryString = atob(base64Image);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create filename from saint name
    const safeName = saint.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const filename = `${safeName}-${Date.now()}.webp`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('saint-images')
      .upload(filename, bytes, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload image', details: uploadError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('saint-images')
      .getPublicUrl(filename);

    const imageUrl = urlData.publicUrl;

    // Update calendar_saints with image URL
    const { error: updateError } = await supabase
      .from('calendar_saints')
      .update({ image_url: imageUrl })
      .eq('id', saintId);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update saint record', details: updateError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully generated image for ${saint.name}: ${imageUrl}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        saint_name: saint.name,
        image_url: imageUrl 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Unexpected error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
