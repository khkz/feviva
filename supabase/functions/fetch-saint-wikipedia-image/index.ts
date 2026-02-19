import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Convert Spanish saint name to English for Wikipedia search
function convertToEnglishName(spanishName: string): string {
  let name = spanishName
    .replace(/^San\s+/i, 'Saint ')
    .replace(/^Santa\s+/i, 'Saint ')
    .replace(/^Santo\s+/i, 'Saint ')
    .replace(/^Beato\s+/i, 'Blessed ')
    .replace(/^Beata\s+/i, 'Blessed ')
    .replace(/^Nuestra Señora\s+/i, 'Our Lady ')
    .replace(/^Virgen\s+/i, 'Virgin ');
  
  return name;
}

// Clean name for Wikipedia URL (handle special characters)
function cleanNameForUrl(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[()]/g, '');
}

// Try to fetch image from Wikipedia API
async function fetchWikipediaImage(searchName: string, lang: 'es' | 'en'): Promise<{ imageUrl: string | null; pageTitle: string | null }> {
  const cleanName = cleanNameForUrl(searchName);
  const apiUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanName)}`;
  
  console.log(`Searching Wikipedia ${lang}: ${apiUrl}`);
  
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'ElRugido/1.0 (https://elrugido.app; contact@elrugido.app)',
      },
    });
    
    if (!response.ok) {
      console.log(`Wikipedia ${lang} returned ${response.status} for ${searchName}`);
      return { imageUrl: null, pageTitle: null };
    }
    
    const data = await response.json();
    
    // Try to get the best quality image
    const imageUrl = data.originalimage?.source || data.thumbnail?.source || null;
    const pageTitle = data.title || null;
    
    if (imageUrl) {
      console.log(`Found image for ${searchName} on Wikipedia ${lang}: ${imageUrl}`);
    }
    
    return { imageUrl, pageTitle };
  } catch (error) {
    console.error(`Error fetching from Wikipedia ${lang}:`, error);
    return { imageUrl: null, pageTitle: null };
  }
}

// Search Wikimedia Commons directly
async function searchWikimediaCommons(saintName: string): Promise<string | null> {
  const searchQuery = saintName.replace(/^(San|Santa|Santo|Beato|Beata)\s+/i, '');
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery + ' saint')}&srnamespace=6&format=json&origin=*`;
  
  console.log(`Searching Wikimedia Commons: ${searchQuery}`);
  
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'ElRugido/1.0 (https://elrugido.app; contact@elrugido.app)',
      },
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const results = data.query?.search || [];
    
    if (results.length === 0) return null;
    
    // Get the first image file
    const firstResult = results[0];
    const fileName = firstResult.title.replace('File:', '');
    
    // Get the actual image URL
    const imageInfoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(firstResult.title)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
    const imageInfoResponse = await fetch(imageInfoUrl, {
      headers: {
        'User-Agent': 'ElRugido/1.0 (https://elrugido.app; contact@elrugido.app)',
      },
    });
    
    if (!imageInfoResponse.ok) return null;
    
    const imageInfoData = await imageInfoResponse.json();
    const pages = imageInfoData.query?.pages || {};
    const pageId = Object.keys(pages)[0];
    const imageUrl = pages[pageId]?.imageinfo?.[0]?.url || null;
    
    if (imageUrl) {
      console.log(`Found image on Wikimedia Commons: ${imageUrl}`);
    }
    
    return imageUrl;
  } catch (error) {
    console.error('Error searching Wikimedia Commons:', error);
    return null;
  }
}

// Download image and upload to Supabase Storage
async function downloadAndUploadImage(
  imageUrl: string, 
  saintName: string, 
  supabaseClient: any
): Promise<{ storedUrl: string | null; usedDirect: boolean }> {
  try {
    console.log(`Downloading image: ${imageUrl}`);
    
    // Skip very large images by checking URL patterns
    const isLargeImage = imageUrl.includes('/commons/') && !imageUrl.includes('/thumb/');
    
    // For large images or SVGs, try to get a smaller version
    let fetchUrl = imageUrl;
    if (isLargeImage && !imageUrl.endsWith('.svg')) {
      // Try to get a 600px thumbnail from Commons
      const fileName = imageUrl.split('/').pop() || '';
      if (fileName) {
        const thumbUrl = imageUrl.replace('/commons/', '/commons/thumb/') + '/600px-' + fileName;
        console.log(`Trying thumbnail: ${thumbUrl}`);
        const thumbCheck = await fetch(thumbUrl, { method: 'HEAD' });
        if (thumbCheck.ok) {
          fetchUrl = thumbUrl;
        }
      }
    }
    
    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'ElRugido/1.0 (https://elrugido.app; contact@elrugido.app)',
      },
    });
    
    if (!response.ok) {
      console.error(`Failed to download image: ${response.status}`);
      // Return original URL as fallback
      return { storedUrl: imageUrl, usedDirect: true };
    }
    
    // Check content length - skip if too large (> 5MB)
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
      console.log(`Image too large (${contentLength} bytes), using direct URL`);
      return { storedUrl: imageUrl, usedDirect: true };
    }
    
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Skip SVG files - use direct URL
    if (contentType.includes('svg')) {
      console.log('SVG file, using direct URL');
      return { storedUrl: imageUrl, usedDirect: true };
    }
    
    const extension = contentType.includes('png') ? 'png' : 
                      contentType.includes('webp') ? 'webp' : 
                      contentType.includes('gif') ? 'gif' : 'jpg';
    
    const imageBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(imageBuffer);
    
    // Create safe filename
    const safeName = saintName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const filename = `${safeName}-${Date.now()}.${extension}`;
    
    console.log(`Uploading to storage: ${filename} (${bytes.length} bytes)`);
    
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('saint-images')
      .upload(filename, bytes, {
        contentType,
        upsert: true,
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      // Return original URL as fallback
      return { storedUrl: imageUrl, usedDirect: true };
    }
    
    // Get public URL
    const { data: urlData } = supabaseClient.storage
      .from('saint-images')
      .getPublicUrl(filename);
    
    return { storedUrl: urlData.publicUrl, usedDirect: false };
  } catch (error) {
    console.error('Error downloading/uploading image:', error);
    // Return original URL as fallback
    return { storedUrl: imageUrl, usedDirect: true };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const adminKey = req.headers.get('X-Admin-Api-Key');
    const ADMIN_KEY = Deno.env.get('ADMIN_API_KEY');
    if (adminKey && ADMIN_KEY && adminKey === ADMIN_KEY) { /* Admin OK */ }
    else if (authHeader?.startsWith('Bearer ')) {
      const _ac = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
      const { error: authErr } = await _ac.auth.getUser(authHeader.replace('Bearer ', ''));
      if (authErr) return new Response(JSON.stringify({ error: 'Token inválido' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } else {
      return new Response(JSON.stringify({ error: 'Autenticación requerida' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

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
        JSON.stringify({ 
          message: 'Saint already has an image', 
          image_url: saint.image_url,
          skipped: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Searching Wikipedia image for: ${saint.name}`);

    let imageUrl: string | null = null;
    let source: string | null = null;

    // 1. Try Wikipedia Spanish
    const esResult = await fetchWikipediaImage(saint.name, 'es');
    if (esResult.imageUrl) {
      imageUrl = esResult.imageUrl;
      source = 'wikipedia_es';
    }

    // 2. Try Wikipedia English if no result
    if (!imageUrl) {
      const englishName = convertToEnglishName(saint.name);
      const enResult = await fetchWikipediaImage(englishName, 'en');
      if (enResult.imageUrl) {
        imageUrl = enResult.imageUrl;
        source = 'wikipedia_en';
      }
    }

    // 3. Try Wikimedia Commons as last resort
    if (!imageUrl) {
      imageUrl = await searchWikimediaCommons(saint.name);
      if (imageUrl) {
        source = 'wikimedia_commons';
      }
    }

    // If no image found anywhere
    if (!imageUrl) {
      console.log(`No image found for ${saint.name}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          saint_name: saint.name,
          message: 'No image found on Wikipedia or Wikimedia Commons'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Download and upload to Supabase Storage (with fallback to direct URL)
    const { storedUrl, usedDirect } = await downloadAndUploadImage(imageUrl, saint.name, supabase);

    if (!storedUrl) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          saint_name: saint.name,
          message: 'Failed to process image',
          original_url: imageUrl
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const finalImageUrl = storedUrl;

    // Update calendar_saints with image URL
    const { error: updateError } = await supabase
      .from('calendar_saints')
      .update({ image_url: finalImageUrl })
      .eq('id', saintId);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update saint record', details: updateError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully ${usedDirect ? 'linked' : 'stored'} image for ${saint.name} from ${source}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        saint_name: saint.name,
        image_url: finalImageUrl,
        source: source,
        original_url: imageUrl,
        used_direct_url: usedDirect
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
