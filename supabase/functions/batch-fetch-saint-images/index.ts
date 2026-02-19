import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse optional filters
    const { limit = 50, onlyPatrons = false, countryCode = null } = await req.json().catch(() => ({}));

    // Build query for saints without images
    let query = supabase
      .from('calendar_saints')
      .select('id, name, category, country_code')
      .is('image_url', null)
      .order('feast_month', { ascending: true })
      .order('feast_day', { ascending: true });

    if (onlyPatrons) {
      query = query.eq('category', 'patron_country');
    }

    if (countryCode) {
      query = query.eq('country_code', countryCode);
    }

    query = query.limit(limit);

    const { data: saints, error: fetchError } = await query;

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch saints', details: fetchError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!saints || saints.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No saints without images found matching criteria' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${saints.length} saints for Wikipedia image search`);

    const results: { 
      saint_name: string; 
      success: boolean; 
      image_url?: string;
      source?: string;
      error?: string;
    }[] = [];

    let successCount = 0;
    let failCount = 0;

    for (const saint of saints) {
      try {
        console.log(`Processing: ${saint.name}`);
        
        // Call the individual fetch function
        const response = await fetch(`${supabaseUrl}/functions/v1/fetch-saint-wikipedia-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ saintId: saint.id }),
        });

        const result = await response.json();
        
        if (result.success) {
          successCount++;
          results.push({
            saint_name: saint.name,
            success: true,
            image_url: result.image_url,
            source: result.source,
          });
        } else if (result.skipped) {
          results.push({
            saint_name: saint.name,
            success: true,
            image_url: result.image_url,
            source: 'existing',
          });
        } else {
          failCount++;
          results.push({
            saint_name: saint.name,
            success: false,
            error: result.message || 'No image found',
          });
        }
      } catch (error) {
        failCount++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error processing ${saint.name}:`, errorMsg);
        results.push({
          saint_name: saint.name,
          success: false,
          error: errorMsg,
        });
      }

      // Wait 1.5 seconds between requests to avoid rate limiting
      await delay(1500);
    }

    console.log(`Batch complete: ${successCount} success, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        message: 'Batch Wikipedia image fetch complete',
        total_processed: saints.length,
        success_count: successCount,
        fail_count: failCount,
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
