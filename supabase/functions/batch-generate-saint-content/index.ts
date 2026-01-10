import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { 
      contentType = 'history', // 'history' | 'prayer' | 'both'
      onlyPatrons = false,
      countryCode = null,
      limit = 10
    } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build query based on content type needed
    let query = supabase
      .from('calendar_saints')
      .select('id, name, description, prayer_id, category, country_code');

    if (onlyPatrons) {
      query = query.eq('category', 'patron_country');
    }

    if (countryCode) {
      query = query.eq('country_code', countryCode);
    }

    // Note: We can't filter by description length in the query,
    // so we'll fetch all and filter in code for history
    if (contentType === 'prayer') {
      query = query.is('prayer_id', null);
    }
    // For 'history' and 'both', we need to check description length in code

    query = query.limit(limit);

    const { data: allSaints, error: saintsError } = await query;

    if (saintsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch saints', details: saintsError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter saints that need content based on type
    let saints = allSaints || [];
    
    if (contentType === 'history' || contentType === 'both') {
      // Filter to only saints with no/short description (< 100 chars)
      saints = saints.filter(s => 
        !s.description || s.description.length < 100
      );
    }
    
    // Apply limit after filtering
    saints = saints.slice(0, limit);

    if (saints.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No saints need content generation',
          processed: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${saints.length} saints for ${contentType} generation`);

    const results = {
      processed: 0,
      historyGenerated: 0,
      prayerGenerated: 0,
      errors: [] as { saintId: string; saintName: string; error: string }[],
    };

    for (const saint of saints) {
      console.log(`Processing: ${saint.name}`);

      // Generate history if needed
      if ((contentType === 'history' || contentType === 'both') && 
          (!saint.description || saint.description.length < 50)) {
        try {
          const historyResponse = await supabase.functions.invoke('generate-saint-history', {
            body: { saintId: saint.id }
          });

          if (historyResponse.error) {
            results.errors.push({
              saintId: saint.id,
              saintName: saint.name,
              error: `History: ${historyResponse.error.message}`
            });
          } else if (!historyResponse.data?.skipped) {
            results.historyGenerated++;
          }
        } catch (e) {
          results.errors.push({
            saintId: saint.id,
            saintName: saint.name,
            error: `History: ${e instanceof Error ? e.message : 'Unknown error'}`
          });
        }
        
        // Delay between API calls to avoid rate limiting
        await delay(2000);
      }

      // Generate prayer if needed
      if ((contentType === 'prayer' || contentType === 'both') && !saint.prayer_id) {
        try {
          const prayerResponse = await supabase.functions.invoke('generate-saint-prayer', {
            body: { saintId: saint.id }
          });

          if (prayerResponse.error) {
            results.errors.push({
              saintId: saint.id,
              saintName: saint.name,
              error: `Prayer: ${prayerResponse.error.message}`
            });
          } else if (!prayerResponse.data?.skipped) {
            results.prayerGenerated++;
          }
        } catch (e) {
          results.errors.push({
            saintId: saint.id,
            saintName: saint.name,
            error: `Prayer: ${e instanceof Error ? e.message : 'Unknown error'}`
          });
        }
        
        // Delay between API calls
        await delay(2000);
      }

      results.processed++;
    }

    console.log(`Batch complete. Processed: ${results.processed}, Histories: ${results.historyGenerated}, Prayers: ${results.prayerGenerated}, Errors: ${results.errors.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        ...results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in batch-generate-saint-content:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
