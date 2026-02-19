import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate URL-friendly slug from prayer name
function generateSlug(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const baseUrl = "https://elrugido.com";
    const today = new Date().toISOString().split("T")[0];

    // Fetch all saints with slugs and updated_at
    const { data: saints, error: saintsError } = await supabase
      .from("calendar_saints")
      .select("id, slug, name, category, image_url, feast_month, feast_day, created_at, updated_at")
      .order("category", { ascending: false })
      .order("feast_month")
      .order("feast_day");

    if (saintsError) throw saintsError;

    // Fetch all prayers with slug and updated_at
    const { data: oraciones, error: oracionesError } = await supabase
      .from("oraciones")
      .select("id, nombre, slug, categoria, es_fundamental, created_at, updated_at")
      .order("categoria")
      .order("orden");

    if (oracionesError) throw oracionesError;

    // Static pages with priorities
    const staticPages = [
      { url: "/", changefreq: "daily", priority: "1.0" },
      { url: "/santos", changefreq: "daily", priority: "0.9" },
      { url: "/oraciones", changefreq: "weekly", priority: "0.9" },
      { url: "/auth", changefreq: "monthly", priority: "0.6" },
      { url: "/frontera-final", changefreq: "weekly", priority: "0.7" },
      { url: "/frontera-final/padre-big-bang", changefreq: "monthly", priority: "0.6" },
      { url: "/frontera-final/observatorio-vaticano", changefreq: "monthly", priority: "0.6" },
      { url: "/frontera-final/bautizar-extraterrestre", changefreq: "monthly", priority: "0.6" },
      { url: "/frontera-final/punto-omega", changefreq: "monthly", priority: "0.6" },
      { url: "/frontera-final/libro-naturaleza", changefreq: "monthly", priority: "0.6" },
      { url: "/frontera-final/ia-alma", changefreq: "monthly", priority: "0.6" },
      { url: "/frontera-final/colonizar-conquistar", changefreq: "monthly", priority: "0.6" },
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

    // Add prayer pages
    for (const oracion of oraciones || []) {
      // Use database slug if available, fallback to generated
      const prayerSlug = oracion.slug || generateSlug(oracion.nombre);
      const priority = oracion.es_fundamental ? "0.8" : "0.6";
      const changefreq = "monthly";
      const lastmod = oracion.updated_at?.split("T")[0] || oracion.created_at?.split("T")[0] || today;

      xml += `  <url>
    <loc>${baseUrl}/oracion/${prayerSlug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`;
    }

    // Add saint pages
    for (const saint of saints || []) {
      const slug = saint.slug || saint.id;
      const priority = saint.category === "patron_country" ? "0.8" : "0.6";
      const changefreq = saint.image_url ? "monthly" : "weekly";
      const lastmod = saint.updated_at?.split("T")[0] || saint.created_at?.split("T")[0] || today;

      xml += `  <url>
    <loc>${baseUrl}/santo/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
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
          totalUrls: staticPages.length + (saints?.length || 0) + (oraciones?.length || 0),
          staticPagesCount: staticPages.length,
          saintsCount: saints?.length || 0,
          oracionesCount: oraciones?.length || 0,
          patronsCount: saints?.filter((s) => s.category === "patron_country").length || 0,
          fundamentalPrayersCount: oraciones?.filter((o) => o.es_fundamental).length || 0,
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
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        "X-Robots-Tag": "noindex",
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
