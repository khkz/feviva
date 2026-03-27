import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const LOVABLE_AI_URL = "https://api.lovable.dev/v1/chat/completions";

const HAGIOGRAPHY_SYSTEM_PROMPT = `Eres un hagiógrafo católico experto. Tu misión es transformar datos históricos seculares en una narrativa espiritual profunda (Hagiografía Católica).

INSTRUCCIONES ESTRICTAS:
1. Elimina completamente el tono enciclopédico, frío y secular.
2. Escribe en español, con reverencia pero sin ser empalagoso.
3. Resalta las VIRTUDES HEROICAS del santo: su fe, esperanza, caridad, humildad, fortaleza.
4. Si hay datos sobre sufrimiento, persecución o martirio, narra su "noche oscura del alma" con profundidad emocional.
5. Describe CÓMO AMÓ a los demás: actos concretos de caridad, misericordia, perdón.
6. Al final, incluye UNA LECCIÓN PRÁCTICA: cómo un cristiano HOY puede imitar su caridad, especialmente en el mundo digital (redes sociales, interacciones online, uso ético de la tecnología).
7. Mantén la extensión entre 150-300 palabras.
8. NO inventes datos que no estén en el texto original. Si falta información, enfócate en lo disponible.
9. NO uses formato markdown. Escribe en prosa limpia con párrafos.`;

async function transformToHagiography(rawBio: string, saintName: string): Promise<string> {
  if (!LOVABLE_API_KEY) {
    console.log("⚠️ LOVABLE_API_KEY not set, returning raw bio");
    return rawBio;
  }

  try {
    console.log(`  🕊️ Transforming bio to hagiography for: ${saintName}`);

    const response = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: HAGIOGRAPHY_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Transforma esta biografía secular del santo/a "${saintName}" en una hagiografía católica espiritual:\n\n${rawBio}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      console.error(`  LLM call failed: ${response.status}`);
      return rawBio;
    }

    const data = await response.json();
    const transformed = data.choices?.[0]?.message?.content?.trim();

    if (transformed && transformed.length > 50) {
      console.log(`  ✅ Hagiography generated: ${transformed.length} chars`);
      return transformed;
    }

    console.log("  ⚠️ LLM returned empty/short response, using raw bio");
    return rawBio;
  } catch (error) {
    console.error("  Error in hagiography transform:", error);
    return rawBio;
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Common Spanish to English saint name translations
const nameTranslations: Record<string, string> = {
  "Inés": "Agnes",
  "Timoteo": "Timothy",
  "Tito": "Titus",
  "Colmano": "Colman",
  "Jacobo": "James",
  "Juan": "John",
  "Pedro": "Peter",
  "Pablo": "Paul",
  "María": "Mary",
  "José": "Joseph",
  "Sebastián": "Sebastian",
  "Antonio": "Anthony",
  "Francisco": "Francis",
  "Teresa": "Teresa",
  "Catalina": "Catherine",
  "Margarita": "Margaret",
  "Isabel": "Elizabeth",
  "Ana": "Anne",
  "Miguel": "Michael",
  "Gabriel": "Gabriel",
  "Rafael": "Raphael",
  "Andrés": "Andrew",
  "Tomás": "Thomas",
  "Felipe": "Philip",
  "Bartolomé": "Bartholomew",
  "Mateo": "Matthew",
  "Simón": "Simon",
  "Judas": "Jude",
  "Esteban": "Stephen",
  "Lorenzo": "Lawrence",
  "Vicente": "Vincent",
  "Agustín": "Augustine",
  "Jerónimo": "Jerome",
  "Gregorio": "Gregory",
  "Ambrosio": "Ambrose",
  "Benito": "Benedict",
  "Bernardo": "Bernard",
  "Domingo": "Dominic",
  "Ignacio": "Ignatius",
  "Javier": "Xavier",
  "Luis": "Louis",
  "Carlos": "Charles",
  "Eduardo": "Edward",
  "Enrique": "Henry",
  "Jorge": "George",
  "Patricio": "Patrick",
  "Nicolás": "Nicholas",
  "Martín": "Martin",
  "Basilio": "Basil",
  "Cirilo": "Cyril",
  "Metodio": "Methodius",
  "Clemente": "Clement",
  "León": "Leo",
  "Marcos": "Mark",
  "Lucas": "Luke",
  "Matías": "Matthias",
  "Valentín": "Valentine",
  "Blas": "Blaise",
  "Cecilia": "Cecilia",
  "Lucía": "Lucy",
  "Bárbara": "Barbara",
  "Clara": "Clare",
  "Rosa": "Rose",
  "Rita": "Rita",
  "Mónica": "Monica",
  "Helena": "Helen",
  "Brígida": "Brigid",
  "Gertrudis": "Gertrude",
  "Escolástica": "Scholastica",
  "Ágata": "Agatha",
  "Perpetua": "Perpetua",
  "Felicidad": "Felicity",
  "Cosme": "Cosmas",
  "Damián": "Damian",
  "Crisóstomo": "Chrysostom",
  "Atanasio": "Athanasius",
  "Policarpo": "Polycarp",
  "Cipriano": "Cyprian",
  "Hilario": "Hilary",
  "Isidoro": "Isidore",
  "Leandro": "Leander",
  "Fulgencio": "Fulgentius",
  "Ildefonso": "Ildephonsus",
  "Toribio": "Turibius",
  "Raimundo": "Raymond",
  "Diego": "Didacus",
  "Ramón": "Raymond",
  "Alberto": "Albert",
  "Anselmo": "Anselm",
  "Buenaventura": "Bonaventure",
  "Duns": "Duns",
  "Escoto": "Scotus",
  "Aquino": "Aquinas",
  "Cantalicio": "Cantalice",
  "Cayetano": "Cajetan",
  "Camilo": "Camillus",
  "Alfonso": "Alphonsus",
  "Ligorio": "Liguori",
  "Bosco": "Bosco",
  "Cottolengo": "Cottolengo",
  "Maximiliano": "Maximilian",
  "Kolbe": "Kolbe",
  "Edith": "Edith",
  "Stein": "Stein",
  "Faustina": "Faustina",
  "Pío": "Pio",
  "Pietrelcina": "Pietrelcina",
  "Josemaría": "Josemaría",
  "Escrivá": "Escrivá",
  "Óscar": "Oscar",
  "Romero": "Romero",
};

interface WikipediaSearchResult {
  pages?: Array<{
    id: number;
    key: string;
    title: string;
    excerpt?: string;
    description?: string;
  }>;
}

interface WikipediaSummaryResponse {
  title?: string;
  extract?: string;
  description?: string;
  type?: string;
}

// Clean saint name by removing prefixes
function cleanSaintName(name: string): string {
  return name
    .replace(/^(San|Santa|Santo|Santos|Santas|Beato|Beata|Beatos|Beatas)\s+/i, "")
    .replace(/\s+y\s+.+$/, "") // Remove " y Tito" from "Timoteo y Tito"
    .trim();
}

// Extract location from name like "Inés de Roma" -> "Roma"
function extractLocation(name: string): string | null {
  const match = name.match(/\s+de\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

// Remove location from name
function removeLocation(name: string): string {
  return name.replace(/\s+de\s+.+$/i, "").trim();
}

// Translate a Spanish name to English
function translateName(name: string): string | null {
  // Try exact match first
  if (nameTranslations[name]) {
    return nameTranslations[name];
  }
  
  // Try each word in the name
  const words = name.split(/\s+/);
  const translated = words.map(word => nameTranslations[word] || word);
  const result = translated.join(" ");
  
  // Only return if at least one word was translated
  return result !== name ? result : null;
}

// Generate search variants for a saint name
function generateSearchVariants(originalName: string): { es: string[]; en: string[] } {
  const esVariants: string[] = [];
  const enVariants: string[] = [];
  
  // Clean name (without San/Santa prefix)
  const cleanName = cleanSaintName(originalName);
  const location = extractLocation(cleanName);
  const nameWithoutLocation = removeLocation(cleanName);
  
  // Spanish variants
  esVariants.push(cleanName); // "Inés de Roma"
  if (location) {
    esVariants.push(nameWithoutLocation); // "Inés"
    esVariants.push(`${nameWithoutLocation} (santa)`); // "Inés (santa)"
    esVariants.push(`${nameWithoutLocation} (mártir)`); // "Inés (mártir)"
  }
  esVariants.push(`${cleanName} (santo)`);
  esVariants.push(`${cleanName} (santa)`);
  
  // English variants
  const translatedName = translateName(nameWithoutLocation);
  const translatedLocation = location ? translateName(location) : null;
  
  if (translatedName) {
    if (location) {
      const locPart = translatedLocation || location;
      enVariants.push(`${translatedName} of ${locPart}`); // "Agnes of Rome"
      enVariants.push(`Saint ${translatedName} of ${locPart}`); // "Saint Agnes of Rome"
    }
    enVariants.push(translatedName); // "Agnes"
    enVariants.push(`Saint ${translatedName}`); // "Saint Agnes"
    enVariants.push(`${translatedName} (saint)`); // "Agnes (saint)"
  }
  
  // Also try the original name with English prefix
  enVariants.push(`Saint ${cleanName}`);
  
  return { es: esVariants, en: enVariants };
}

// Search Wikipedia using the Search API
async function searchWikipedia(
  query: string,
  lang: "es" | "en"
): Promise<{ title: string; key: string } | null> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://${lang}.wikipedia.org/w/rest.php/v1/search/page?q=${encodedQuery}&limit=5`;
    
    console.log(`  Searching Wikipedia ${lang}: "${query}"`);
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "ElRugidoApp/1.0 (Catholic devotional app; contact@elrugido.com)",
      },
    });

    if (!response.ok) {
      console.log(`  Search failed with status ${response.status}`);
      return null;
    }

    const data: WikipediaSearchResult = await response.json();
    
    if (!data.pages || data.pages.length === 0) {
      console.log(`  No search results`);
      return null;
    }

    // Look for a result that seems to be about a saint
    const saintKeywords = [
      "santo", "santa", "saint", "mártir", "martyr", "obispo", "bishop",
      "papa", "pope", "monje", "monk", "religioso", "religious", "virgen",
      "virgin", "confesor", "confessor", "doctor", "apóstol", "apostle",
      "beato", "beata", "blessed", "venerable"
    ];
    
    for (const page of data.pages) {
      const lowerTitle = page.title.toLowerCase();
      const lowerDesc = (page.description || "").toLowerCase();
      const lowerExcerpt = (page.excerpt || "").toLowerCase();
      
      // Check if it's likely about a saint
      const isSaintRelated = saintKeywords.some(keyword => 
        lowerTitle.includes(keyword) || 
        lowerDesc.includes(keyword) ||
        lowerExcerpt.includes(keyword)
      );
      
      // Also accept if the title closely matches our query
      const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      const titleMatchesQuery = queryWords.some(word => lowerTitle.includes(word));
      
      if (isSaintRelated || titleMatchesQuery) {
        console.log(`  Found: "${page.title}" (key: ${page.key})`);
        return { title: page.title, key: page.key };
      }
    }
    
    // If no saint-specific result, return the first result if title matches query
    const firstResult = data.pages[0];
    if (firstResult) {
      console.log(`  Using first result: "${firstResult.title}"`);
      return { title: firstResult.title, key: firstResult.key };
    }
    
    return null;
  } catch (error) {
    console.error(`  Search error:`, error);
    return null;
  }
}

// Fetch the summary/extract for a Wikipedia article
async function fetchWikipediaSummary(
  key: string,
  lang: "es" | "en"
): Promise<string | null> {
  try {
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(key)}`;
    
    console.log(`  Fetching summary for: ${key}`);
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "ElRugidoApp/1.0 (Catholic devotional app; contact@elrugido.com)",
      },
    });

    if (!response.ok) {
      console.log(`  Summary fetch failed with status ${response.status}`);
      return null;
    }

    const data: WikipediaSummaryResponse = await response.json();
    
    if (data.type === "disambiguation") {
      console.log(`  Result is disambiguation page, skipping`);
      return null;
    }
    
    if (data.extract && data.extract.length > 50) {
      console.log(`  Got extract: ${data.extract.length} chars`);
      return data.extract;
    }
    
    return null;
  } catch (error) {
    console.error(`  Summary fetch error:`, error);
    return null;
  }
}

// Main function to find a saint's biography
async function findSaintBiography(
  name: string
): Promise<{ extract: string; source: "wikipedia_es" | "wikipedia_en" } | null> {
  console.log(`\nSearching biography for: "${name}"`);
  
  const variants = generateSearchVariants(name);
  console.log(`  ES variants: ${variants.es.join(", ")}`);
  console.log(`  EN variants: ${variants.en.join(", ")}`);
  
  // Try Spanish Wikipedia first
  for (const variant of variants.es) {
    const searchResult = await searchWikipedia(variant, "es");
    if (searchResult) {
      const extract = await fetchWikipediaSummary(searchResult.key, "es");
      if (extract) {
        return { extract, source: "wikipedia_es" };
      }
    }
  }
  
  // Try English Wikipedia
  for (const variant of variants.en) {
    const searchResult = await searchWikipedia(variant, "en");
    if (searchResult) {
      const extract = await fetchWikipediaSummary(searchResult.key, "en");
      if (extract) {
        return { extract, source: "wikipedia_en" };
      }
    }
  }
  
  console.log(`  No biography found for: "${name}"`);
  return null;
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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { saintId, saintName, dryRun = false } = await req.json();

    if (!saintId || !saintName) {
      return new Response(
        JSON.stringify({ error: "saintId and saintName are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`\n${"=".repeat(50)}`);
    console.log(`Processing saint: ${saintName} (ID: ${saintId})`);
    console.log(`${"=".repeat(50)}`);

    const result = await findSaintBiography(saintName);

    if (!result) {
      console.log(`❌ No Wikipedia biography found for: ${saintName}`);
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
          source: result.source,
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
        description_source: result.source,
      })
      .eq("id", saintId);

    if (updateError) {
      console.error("Error updating saint:", updateError);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`✅ Successfully updated biography for: ${saintName} (source: ${result.source}, ${result.extract.length} chars)`);

    return new Response(
      JSON.stringify({
        success: true,
        saintId,
        saintName,
        source: result.source,
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
