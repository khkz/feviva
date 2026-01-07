import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map Spanish book names to GetBible.net API format
const BOOK_MAP: Record<string, string> = {
  "génesis": "genesis",
  "genesis": "genesis",
  "éxodo": "exodus",
  "exodo": "exodus",
  "levítico": "leviticus",
  "levitico": "leviticus",
  "números": "numbers",
  "numeros": "numbers",
  "deuteronomio": "deuteronomy",
  "josué": "joshua",
  "josue": "joshua",
  "jueces": "judges",
  "rut": "ruth",
  "1 samuel": "1_samuel",
  "2 samuel": "2_samuel",
  "1 reyes": "1_kings",
  "2 reyes": "2_kings",
  "1 crónicas": "1_chronicles",
  "1 cronicas": "1_chronicles",
  "2 crónicas": "2_chronicles",
  "2 cronicas": "2_chronicles",
  "esdras": "ezra",
  "nehemías": "nehemiah",
  "nehemias": "nehemiah",
  "ester": "esther",
  "job": "job",
  "salmo": "psalms",
  "salmos": "psalms",
  "proverbios": "proverbs",
  "eclesiastés": "ecclesiastes",
  "eclesiastes": "ecclesiastes",
  "cantar": "song_of_solomon",
  "cantar de los cantares": "song_of_solomon",
  "isaías": "isaiah",
  "isaias": "isaiah",
  "jeremías": "jeremiah",
  "jeremias": "jeremiah",
  "lamentaciones": "lamentations",
  "ezequiel": "ezekiel",
  "daniel": "daniel",
  "oseas": "hosea",
  "joel": "joel",
  "amós": "amos",
  "amos": "amos",
  "abdías": "obadiah",
  "abdias": "obadiah",
  "jonás": "jonah",
  "jonas": "jonah",
  "miqueas": "micah",
  "nahúm": "nahum",
  "nahum": "nahum",
  "habacuc": "habakkuk",
  "sofonías": "zephaniah",
  "sofonias": "zephaniah",
  "ageo": "haggai",
  "zacarías": "zechariah",
  "zacarias": "zechariah",
  "malaquías": "malachi",
  "malaquias": "malachi",
  "mateo": "matthew",
  "marcos": "mark",
  "lucas": "luke",
  "juan": "john",
  "hechos": "acts",
  "romanos": "romans",
  "1 corintios": "1_corinthians",
  "2 corintios": "2_corinthians",
  "gálatas": "galatians",
  "galatas": "galatians",
  "efesios": "ephesians",
  "filipenses": "philippians",
  "colosenses": "colossians",
  "1 tesalonicenses": "1_thessalonians",
  "2 tesalonicenses": "2_thessalonians",
  "1 timoteo": "1_timothy",
  "2 timoteo": "2_timothy",
  "tito": "titus",
  "filemón": "philemon",
  "filemon": "philemon",
  "hebreos": "hebrews",
  "santiago": "james",
  "1 pedro": "1_peter",
  "2 pedro": "2_peter",
  "1 juan": "1_john",
  "2 juan": "2_john",
  "3 juan": "3_john",
  "judas": "jude",
  "apocalipsis": "revelation",
};

// Parse reference like "Génesis 1-3" or "Salmo 23:1-5" or "Proverbios 1:1-7"
function parseReference(reference: string): { book: string; chapters: number[]; verses?: { start: number; end: number } } | null {
  const normalizedRef = reference.toLowerCase().trim();
  
  // Match patterns like "Génesis 1-3", "Salmo 23", "Proverbios 1:1-7"
  const match = normalizedRef.match(/^([a-záéíóúñ\s\d]+?)\s+(\d+)(?:-(\d+))?(?::(\d+)(?:-(\d+))?)?$/);
  
  if (!match) return null;
  
  const [, bookName, startChapter, endChapter, startVerse, endVerse] = match;
  const book = BOOK_MAP[bookName.trim()];
  
  if (!book) return null;
  
  const start = parseInt(startChapter);
  const end = endChapter ? parseInt(endChapter) : start;
  const chapters = [];
  
  for (let i = start; i <= end; i++) {
    chapters.push(i);
  }
  
  const result: { book: string; chapters: number[]; verses?: { start: number; end: number } } = { book, chapters };
  
  if (startVerse) {
    result.verses = {
      start: parseInt(startVerse),
      end: endVerse ? parseInt(endVerse) : parseInt(startVerse)
    };
  }
  
  return result;
}

async function fetchChapterFromAPI(book: string, chapter: number): Promise<string | null> {
  try {
    // Using GetBible.net API - Reina Valera 1909 (Spanish)
    const response = await fetch(`https://getbible.net/v2/rvr09/${book}/${chapter}.json`);
    
    if (!response.ok) {
      console.error(`API error for ${book} ${chapter}:`, response.status);
      return null;
    }
    
    const data = await response.json();
    
    // Extract verses and combine into text
    const verses = Object.values(data.verses as Record<string, { verse: number; text: string }>)
      .sort((a, b) => a.verse - b.verse)
      .map(v => `${v.verse}. ${v.text}`)
      .join("\n");
    
    return verses;
  } catch (error) {
    console.error(`Error fetching ${book} ${chapter}:`, error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { reference } = await req.json();
    
    if (!reference) {
      return new Response(
        JSON.stringify({ error: "Reference is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parsed = parseReference(reference);
    
    if (!parsed) {
      return new Response(
        JSON.stringify({ error: `Could not parse reference: ${reference}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const texts: string[] = [];
    
    for (const chapter of parsed.chapters) {
      // Check cache first
      const { data: cached } = await supabase
        .from("bible_text_cache")
        .select("texto")
        .eq("libro", parsed.book)
        .eq("capitulo", chapter)
        .single();
      
      if (cached) {
        texts.push(`**Capítulo ${chapter}**\n${cached.texto}`);
        continue;
      }
      
      // Fetch from API
      const text = await fetchChapterFromAPI(parsed.book, chapter);
      
      if (text) {
        // Cache it
        await supabase.from("bible_text_cache").upsert({
          libro: parsed.book,
          capitulo: chapter,
          texto: text,
          traduccion: "rvr"
        });
        
        texts.push(`**Capítulo ${chapter}**\n${text}`);
      }
    }
    
    // If we have verse ranges, we might want to filter (optional future enhancement)
    const fullText = texts.join("\n\n");

    return new Response(
      JSON.stringify({ 
        success: true, 
        reference,
        book: parsed.book,
        chapters: parsed.chapters,
        text: fullText 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
