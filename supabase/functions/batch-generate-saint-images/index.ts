import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to wait
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get optional filter from request body
    const body = await req.json().catch(() => ({}));
    const { onlyPatrons = true, countryCode } = body;

    // Build query for saints without images
    let query = supabase
      .from('calendar_saints')
      .select('id, name, country_code, category')
      .is('image_url', null);

    // Filter to only patron saints if requested
    if (onlyPatrons) {
      query = query.eq('category', 'patron_country');
    }

    // Filter by country if specified
    if (countryCode) {
      query = query.eq('country_code', countryCode);
    }

    const { data: saints, error: fetchError } = await query;

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch saints', details: fetchError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!saints || saints.length === 0) {
      return new Response(
        JSON.stringify({ message: 'All saints already have images', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${saints.length} saints without images. Starting batch generation...`);

    const results: Array<{ name: string; success: boolean; error?: string; image_url?: string }> = [];

    for (let i = 0; i < saints.length; i++) {
      const saint = saints[i];
      console.log(`Processing ${i + 1}/${saints.length}: ${saint.name}`);

      try {
        // Call generate-saint-image function
        const response = await fetch(`${supabaseUrl}/functions/v1/generate-saint-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ saintId: saint.id }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          results.push({ 
            name: saint.name, 
            success: true, 
            image_url: result.image_url 
          });
          console.log(`✓ Generated image for ${saint.name}`);
        } else {
          results.push({ 
            name: saint.name, 
            success: false, 
            error: result.error || 'Unknown error' 
          });
          console.error(`✗ Failed for ${saint.name}: ${result.error}`);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        results.push({ 
          name: saint.name, 
          success: false, 
          error: errorMessage 
        });
        console.error(`✗ Exception for ${saint.name}: ${errorMessage}`);
      }

      // Wait 3 seconds between requests to avoid rate limiting
      if (i < saints.length - 1) {
        console.log('Waiting 3 seconds before next request...');
        await delay(3000);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`Batch complete: ${successCount} success, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        message: 'Batch generation complete',
        total: saints.length,
        success: successCount,
        failed: failCount,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Batch error:', error);
    return new Response(
      JSON.stringify({ error: 'Batch processing failed', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
