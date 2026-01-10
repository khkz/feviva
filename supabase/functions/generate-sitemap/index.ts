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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const baseUrl = "https://elrugido.com";
    const today = new Date().toISOString().split("T")[0];

    // Fetch all saints with slugs
    const { data: saints, error } = await supabase
      .from("calendar_saints")
      .select("id, slug, name, category, image_url, feast_month, feast_day, created_at")
      .order("category", { ascending: false })
      .order("feast_month")
      .order("feast_day");

    if (error) throw error;

    // Static pages
    const staticPages = [
      { url: "/", changefreq: "daily", priority: "1.0" },
      { url: "/auth", changefreq: "monthly", priority: "0.8" },
      { url: "/santos", changefreq: "weekly", priority: "0.9" },
    ];

    // Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

    // Add static pages
    for (const page of staticPages) {
      xml += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Add saint pages
    for (const saint of saints || []) {
      const slug = saint.slug || saint.id;
      const priority = saint.category === "patron_country" ? "0.8" : "0.6";
      const changefreq = saint.image_url ? "monthly" : "weekly"; // Pages with complete content change less

      xml += `  <url>
    <loc>${baseUrl}/santo/${slug}</loc>
    <lastmod>${saint.created_at?.split("T")[0] || today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>`;

      // Add image if available
      if (saint.image_url) {
        xml += `
    <image:image>
      <image:loc>${saint.image_url}</image:loc>
      <image:title>${saint.name}</image:title>
    </image:image>`;
      }

      xml += `
  </url>
`;
    }

    xml += `</urlset>`;

    // Return URL to check if generation was requested or actual XML
    const url = new URL(req.url);
    const format = url.searchParams.get("format");

    if (format === "json") {
      return new Response(
        JSON.stringify({
          success: true,
          totalUrls: staticPages.length + (saints?.length || 0),
          saintsCount: saints?.length || 0,
          patronsCount: saints?.filter((s) => s.category === "patron_country").length || 0,
          withImageCount: saints?.filter((s) => s.image_url).length || 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
      },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error generating sitemap:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
