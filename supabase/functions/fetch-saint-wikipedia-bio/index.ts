import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WikipediaResponse {
  title?: string;
  extract?: string;
  description?: string;
  type?: string;
}

async function fetchWikipediaExtract(
  name: string,
  lang: "es" | "en"
): Promise<{ extract: string | null; title: string | null }> {
  try {
    // Clean the name for Wikipedia search
    const cleanName = name
      .replace(/^(San|Santa|Santo|Beato|Beata)\s+/i, "")
      .trim();
    
    // Try with full name first, then cleaned name
    const searchTerms = [name, cleanName];
    
    for (const term of searchTerms) {
      const encodedName = encodeURIComponent(term);
      const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodedName}`;
      
      console.log(`Fetching from Wikipedia ${lang}: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          "User-Agent": "ElRugidoApp/1.0 (Catholic devotional app; contact@elrugido.com)",
        },
      });

      if (response.ok) {
        const data: WikipediaResponse = await response.json();
        
        // Check if it's a disambiguation or missing page
        if (data.type === "disambiguation" || data.type === "https://mediawiki.org/wiki/HyperSwitch/errors/not_found") {
          console.log(`Wikipedia ${lang}: disambiguation or not found for "${term}"`);
          continue;
        }
        
        if (data.extract && data.extract.length > 50) {
          console.log(`Found extract for "${term}" (${data.extract.length} chars)`);
          return { extract: data.extract, title: data.title || term };
        }
      }
    }
    
    return { extract: null, title: null };
  } catch (error) {
    console.error(`Error fetching Wikipedia ${lang}:`, error);
    return { extract: null, title: null };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { saintId, saintName, dryRun = false } = await req.json();

    if (!saintId || !saintName) {
      return new Response(
        JSON.stringify({ error: "saintId and saintName are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing saint: ${saintName} (ID: ${saintId})`);

    // Try Spanish Wikipedia first
    let result = await fetchWikipediaExtract(saintName, "es");
    let source: "wikipedia_es" | "wikipedia_en" | null = result.extract ? "wikipedia_es" : null;

    // If not found in Spanish, try English
    if (!result.extract) {
      console.log(`Not found in Spanish Wikipedia, trying English...`);
      
      // Convert common Spanish saint prefixes to English
      const englishName = saintName
        .replace(/^San\s+/i, "Saint ")
        .replace(/^Santa\s+/i, "Saint ")
        .replace(/^Santo\s+/i, "Saint ")
        .replace(/^Beato\s+/i, "Blessed ")
        .replace(/^Beata\s+/i, "Blessed ");
      
      result = await fetchWikipediaExtract(englishName, "en");
      source = result.extract ? "wikipedia_en" : null;
    }

    if (!result.extract) {
      console.log(`No Wikipedia biography found for: ${saintName}`);
      return new Response(
        JSON.stringify({
          success: false,
          saintId,
          saintName,
          message: "No Wikipedia biography found",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Don't update if dry run
    if (dryRun) {
      return new Response(
        JSON.stringify({
          success: true,
          saintId,
          saintName,
          source,
          extractLength: result.extract.length,
          preview: result.extract.substring(0, 200) + "...",
          dryRun: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update the saint's description
    const { error: updateError } = await supabase
      .from("calendar_saints")
      .update({
        description: result.extract,
        description_source: source,
      })
      .eq("id", saintId);

    if (updateError) {
      console.error("Error updating saint:", updateError);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully updated biography for: ${saintName} (source: ${source})`);

    return new Response(
      JSON.stringify({
        success: true,
        saintId,
        saintName,
        source,
        extractLength: result.extract.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in fetch-saint-wikipedia-bio:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
