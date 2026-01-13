import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      limit = 50, 
      onlyPatrons = false, 
      countryCode = null,
      onlyWithoutBio = true,
      dryRun = false 
    } = await req.json();

    console.log(`Batch fetch saint bios - limit: ${limit}, onlyPatrons: ${onlyPatrons}, countryCode: ${countryCode}, onlyWithoutBio: ${onlyWithoutBio}`);

    // Build query to get saints that need biographies
    let query = supabase
      .from("calendar_saints")
      .select("id, name, description, description_source, category, country_code")
      .order("feast_month", { ascending: true })
      .order("feast_day", { ascending: true })
      .limit(limit);

    // Filter by those without a good description
    if (onlyWithoutBio) {
      query = query.or("description.is.null,description.eq.");
    }

    // Filter by patron saints only
    if (onlyPatrons) {
      query = query.eq("category", "patron_country");
    }

    // Filter by country code
    if (countryCode) {
      query = query.eq("country_code", countryCode);
    }

    const { data: saints, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching saints:", fetchError);
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!saints || saints.length === 0) {
      return new Response(
        JSON.stringify({
          message: "No saints found matching criteria",
          processed: 0,
          success: 0,
          failed: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${saints.length} saints to process`);

    const results = {
      processed: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      details: [] as Array<{
        saintId: string;
        saintName: string;
        status: "success" | "failed" | "skipped";
        source?: string;
        error?: string;
      }>,
    };

    for (const saint of saints) {
      try {
        // Skip if already has a Wikipedia-sourced description
        if (saint.description_source?.startsWith("wikipedia")) {
          console.log(`Skipping ${saint.name} - already has Wikipedia bio`);
          results.skipped++;
          results.details.push({
            saintId: saint.id,
            saintName: saint.name,
            status: "skipped",
          });
          continue;
        }

        console.log(`Processing: ${saint.name}`);
        results.processed++;

        // Call the individual fetch function
        const response = await fetch(
          `${supabaseUrl}/functions/v1/fetch-saint-wikipedia-bio`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              saintId: saint.id,
              saintName: saint.name,
              dryRun,
            }),
          }
        );

        const result = await response.json();

        if (result.success) {
          results.success++;
          results.details.push({
            saintId: saint.id,
            saintName: saint.name,
            status: "success",
            source: result.source,
          });
        } else {
          results.failed++;
          results.details.push({
            saintId: saint.id,
            saintName: saint.name,
            status: "failed",
            error: result.message || result.error,
          });
        }

        // Rate limiting - 1.5 seconds between requests to be respectful to Wikipedia
        await delay(1500);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`Error processing ${saint.name}:`, error);
        results.failed++;
        results.details.push({
          saintId: saint.id,
          saintName: saint.name,
          status: "failed",
          error: errorMessage,
        });
      }
    }

    console.log(`Batch complete: ${results.success} success, ${results.failed} failed, ${results.skipped} skipped`);

    return new Response(
      JSON.stringify({
        ...results,
        totalSaints: saints.length,
        dryRun,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in batch-fetch-saint-bios:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
