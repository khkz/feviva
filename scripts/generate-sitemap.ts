// Runs before `vite dev` and `vite build` (predev/prebuild); writes public/sitemap.xml.
// Queries Supabase REST API to include all saints, prayers, novenas and frontera articles.

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://elrugido.com";
const SUPABASE_URL = "https://duggdnqpemwojkojfyei.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1Z2dkbnFwZW13b2prb2pmeWVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNTUxNDYsImV4cCI6MjA3NTczMTE0Nn0.ILOVuibQqKIvJYgWmRdXmG4HR4g57ajFUunrOiUmoA0";

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
  image?: { loc: string; title: string };
}

async function fetchTable(path: string): Promise<any[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Range-Unit": "items",
        Range: "0-2999",
      },
    });
    if (!res.ok) {
      console.warn(`[sitemap] fetch ${path} failed: ${res.status}`);
      return [];
    }
    return await res.json();
  } catch (err) {
    console.warn(`[sitemap] error fetching ${path}:`, err);
    return [];
  }
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!)
  );
}

function toEntry(e: SitemapEntry): string {
  const parts = [
    `  <url>`,
    `    <loc>${e.loc}</loc>`,
    e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
    e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
    e.priority ? `    <priority>${e.priority}</priority>` : null,
    e.image
      ? `    <image:image>\n      <image:loc>${escapeXml(e.image.loc)}</image:loc>\n      <image:title>${escapeXml(e.image.title)}</image:title>\n    </image:image>`
      : null,
    `  </url>`,
  ];
  return parts.filter(Boolean).join("\n");
}

async function main() {
  const today = new Date().toISOString().split("T")[0];

  const staticPages: SitemapEntry[] = [
    { loc: `${BASE_URL}/`, lastmod: today, changefreq: "daily", priority: "1.0" },
    { loc: `${BASE_URL}/sobre-nosotros`, lastmod: today, changefreq: "monthly", priority: "0.8" },
    { loc: `${BASE_URL}/santos`, lastmod: today, changefreq: "daily", priority: "0.9" },
    { loc: `${BASE_URL}/oraciones`, lastmod: today, changefreq: "weekly", priority: "0.9" },
    { loc: `${BASE_URL}/evangelio-del-dia`, lastmod: today, changefreq: "daily", priority: "0.9" },
    { loc: `${BASE_URL}/novenas`, lastmod: today, changefreq: "weekly", priority: "0.8" },
    { loc: `${BASE_URL}/evangelio-del-dia`, lastmod: today, changefreq: "daily", priority: "0.9" },
    { loc: `${BASE_URL}/capsula-del-dia`, lastmod: today, changefreq: "daily", priority: "0.8" },
    { loc: `${BASE_URL}/frontera-final`, lastmod: today, changefreq: "weekly", priority: "0.7" },
    { loc: `${BASE_URL}/auth`, lastmod: today, changefreq: "monthly", priority: "0.5" },
  ];

  const [saints, oraciones, novenas, articulos] = await Promise.all([
    fetchTable("calendar_saints?select=id,slug,name,category,image_url,updated_at,created_at"),
    fetchTable("oraciones?select=id,nombre,slug,es_fundamental,updated_at,created_at"),
    fetchTable("novenas?select=id,titulo,created_at"),
    fetchTable("frontera_articulos?select=id,updated_at"),
  ]);

  const entries: SitemapEntry[] = [...staticPages];

  for (const s of saints) {
    const slug = s.slug || s.id;
    const lastmod = (s.updated_at || s.created_at || "").split("T")[0] || today;
    entries.push({
      loc: `${BASE_URL}/santo/${slug}`,
      lastmod,
      changefreq: s.image_url ? "monthly" : "weekly",
      priority: s.category === "patron_country" ? "0.8" : "0.6",
      image: s.image_url ? { loc: s.image_url, title: s.name } : undefined,
    });
  }

  for (const o of oraciones) {
    const slug = o.slug || o.id;
    const lastmod = (o.updated_at || o.created_at || "").split("T")[0] || today;
    entries.push({
      loc: `${BASE_URL}/oracion/${slug}`,
      lastmod,
      changefreq: "monthly",
      priority: o.es_fundamental ? "0.8" : "0.6",
    });
  }

  for (const n of novenas) {
    const lastmod = (n.created_at || "").split("T")[0] || today;
    entries.push({
      loc: `${BASE_URL}/novena/${n.id}`,
      lastmod,
      changefreq: "monthly",
      priority: "0.7",
    });
  }

  for (const a of articulos) {
    const lastmod = (a.updated_at || "").split("T")[0] || today;
    entries.push({
      loc: `${BASE_URL}/frontera-final/${a.id}`,
      lastmod,
      changefreq: "monthly",
      priority: "0.6",
    });
  }

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`,
    `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
    ...entries.map(toEntry),
    `</urlset>`,
  ].join("\n");

  writeFileSync(resolve("public/sitemap.xml"), xml);
  console.log(
    `[sitemap] wrote ${entries.length} urls (static:${staticPages.length} saints:${saints.length} oraciones:${oraciones.length} novenas:${novenas.length} articulos:${articulos.length})`
  );
}

main().catch((err) => {
  console.error("[sitemap] FATAL:", err);
  process.exit(0); // never block dev/build
});
