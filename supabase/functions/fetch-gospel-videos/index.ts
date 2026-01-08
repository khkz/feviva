import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Channel handle: @MisionerosDigitalesCatolicos
const CHANNEL_HANDLE = '@MisionerosDigitalesCatolicos';

// Mapeo de meses en español
const MONTHS_ES: Record<string, number> = {
  'ENERO': 1, 'FEBRERO': 2, 'MARZO': 3, 'ABRIL': 4,
  'MAYO': 5, 'JUNIO': 6, 'JULIO': 7, 'AGOSTO': 8,
  'SEPTIEMBRE': 9, 'OCTUBRE': 10, 'NOVIEMBRE': 11, 'DICIEMBRE': 12
};

// Mapeo de libros en inglés a español
const BOOKS_EN_TO_ES: Record<string, string> = {
  'MATTHEW': 'Mateo', 'MARK': 'Marcos', 'LUKE': 'Lucas', 'JOHN': 'Juan',
  'GENESIS': 'Génesis', 'EXODUS': 'Éxodo', 'LEVITICUS': 'Levítico',
  'NUMBERS': 'Números', 'DEUTERONOMY': 'Deuteronomio',
  'ACTS': 'Hechos', 'ROMANS': 'Romanos', 'CORINTHIANS': 'Corintios',
  'GALATIANS': 'Gálatas', 'EPHESIANS': 'Efesios', 'PHILIPPIANS': 'Filipenses',
  'COLOSSIANS': 'Colosenses', 'THESSALONIANS': 'Tesalonicenses',
  'TIMOTHY': 'Timoteo', 'TITUS': 'Tito', 'PHILEMON': 'Filemón',
  'HEBREWS': 'Hebreos', 'JAMES': 'Santiago', 'PETER': 'Pedro',
  'JUDE': 'Judas', 'REVELATION': 'Apocalipsis'
};

interface YouTubeVideo {
  videoId: string;
  title: string;
  publishedAt: string;
  fecha: string | null;
  referencia: string | null;
}

async function getChannelId(handle: string): Promise<string | null> {
  console.log(`Fetching channel ID for handle: ${handle}`);
  
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(handle)}&key=${YOUTUBE_API_KEY}`
  );
  
  const data = await response.json();
  
  if (data.items && data.items.length > 0) {
    return data.items[0].snippet.channelId;
  }
  
  return null;
}

async function getUploadsPlaylistId(channelId: string): Promise<string | null> {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
  );
  
  const data = await response.json();
  
  if (data.items && data.items.length > 0) {
    return data.items[0].contentDetails.relatedPlaylists.uploads;
  }
  
  return null;
}

async function getRecentVideos(playlistId: string, maxVideos: number = 50): Promise<YouTubeVideo[]> {
  console.log(`Fetching recent ${maxVideos} videos from playlist: ${playlistId}`);
  
  const videos: YouTubeVideo[] = [];
  let nextPageToken: string | undefined;
  let videosFetched = 0;
  
  while (videosFetched < maxVideos) {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('playlistId', playlistId);
    url.searchParams.set('maxResults', Math.min(50, maxVideos - videosFetched).toString());
    url.searchParams.set('key', YOUTUBE_API_KEY!);
    
    if (nextPageToken) {
      url.searchParams.set('pageToken', nextPageToken);
    }
    
    const response = await fetch(url.toString());
    const data = await response.json();
    
    if (data.items) {
      for (const item of data.items) {
        const title = item.snippet.title;
        const videoId = item.snippet.resourceId.videoId;
        const publishedAt = item.snippet.publishedAt;
        
        // Log first 10 titles for debugging
        if (videosFetched < 10) {
          console.log(`Title ${videosFetched + 1}: ${title}`);
        }
        
        const fecha = extractDateFromTitle(title, publishedAt);
        const referencia = extractReference(title) || 'Evangelio del Día';
        
        videos.push({ videoId, title, publishedAt, fecha, referencia });
        videosFetched++;
        
        if (fecha) {
          console.log(`Found: ${fecha} - ${referencia} - ${videoId}`);
        }
      }
    }
    
    nextPageToken = data.nextPageToken;
    if (!nextPageToken) break;
  }
  
  console.log(`Total videos fetched: ${videos.length}`);
  return videos;
}

// Extraer fecha del título con múltiples formatos
// "Evangelio 08/01/2026- Evangelio del día" -> "2026-01-08"
// "Misa 8/01/26 - Padre Luis Zazano" -> "2026-01-08"
// "Evangelio de Hoy Miercoles 21 de Agosto de 2024" -> "2024-08-21"
function extractDateFromTitle(title: string, publishedAt: string): string | null {
  const publishYear = new Date(publishedAt).getFullYear();
  
  // Formato 1: DD/MM/YYYY o D/MM/YYYY (8 digit year)
  const patternSlash4 = /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/;
  const matchSlash4 = title.match(patternSlash4);
  if (matchSlash4) {
    const day = parseInt(matchSlash4[1], 10);
    const month = parseInt(matchSlash4[2], 10);
    const year = parseInt(matchSlash4[3], 10);
    
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }
  
  // Formato 2: D/MM/YY (2 digit year)
  const patternSlash2 = /\b(\d{1,2})\/(\d{1,2})\/(\d{2})\b/;
  const matchSlash2 = title.match(patternSlash2);
  if (matchSlash2) {
    const day = parseInt(matchSlash2[1], 10);
    const month = parseInt(matchSlash2[2], 10);
    const yearShort = parseInt(matchSlash2[3], 10);
    const year = yearShort > 50 ? 1900 + yearShort : 2000 + yearShort;
    
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }
  
  // Formato 3: "21 de Agosto de 2024"
  const patternFullDate = /(\d{1,2})\s+de\s+([A-Za-záéíóúÁÉÍÓÚ]+)\s+(?:de\s+)?(\d{4})/i;
  const matchFull = title.match(patternFullDate);
  if (matchFull) {
    const day = parseInt(matchFull[1], 10);
    const monthName = matchFull[2].toUpperCase();
    const year = parseInt(matchFull[3], 10);
    const month = MONTHS_ES[monthName];
    
    if (month && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }
  
  // Formato 4: "JANUARY 8" o "ENERO 8" (sin año, usa el del video)
  const patternShort = /\b(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER|ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE)\s+(\d{1,2})\b/i;
  const matchShort = title.match(patternShort);
  if (matchShort) {
    const monthName = matchShort[1].toUpperCase();
    const day = parseInt(matchShort[2], 10);
    
    const MONTHS_EN: Record<string, number> = {
      'JANUARY': 1, 'FEBRUARY': 2, 'MARCH': 3, 'APRIL': 4,
      'MAY': 5, 'JUNE': 6, 'JULY': 7, 'AUGUST': 8,
      'SEPTEMBER': 9, 'OCTOBER': 10, 'NOVEMBER': 11, 'DECEMBER': 12
    };
    
    const month = MONTHS_ES[monthName] || MONTHS_EN[monthName];
    
    if (month && day >= 1 && day <= 31) {
      return `${publishYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }
  
  return null;
}

// Extraer referencia bíblica del título
// "Mc 6, 34-44- Evangelio del día" -> "Marcos 6:34-44"
// "Mt. 4,12-17.23-25- Evangelio del día" -> "Mateo 4:12-17,23-25"
function extractReference(title: string): string | null {
  // Abreviaturas de libros
  const ABBREV_TO_BOOK: Record<string, string> = {
    'MT': 'Mateo', 'MC': 'Marcos', 'LC': 'Lucas', 'JN': 'Juan',
    'GN': 'Génesis', 'EX': 'Éxodo', 'HCH': 'Hechos', 'HECH': 'Hechos',
    'ROM': 'Romanos', '1COR': '1 Corintios', '2COR': '2 Corintios',
    'GAL': 'Gálatas', 'EF': 'Efesios', 'FLP': 'Filipenses', 'COL': 'Colosenses',
    'HEB': 'Hebreos', 'SANT': 'Santiago', '1PED': '1 Pedro', '2PED': '2 Pedro',
    'JUD': 'Judas', 'AP': 'Apocalipsis', 'APOC': 'Apocalipsis'
  };
  
  // Pattern for abbreviated books: "Mc 6, 34-44" or "Mt. 4,12-17"
  const patternAbbrev = /^([A-Za-z]+)\.?\s*(\d+)[,\s]+([\d\-.,]+)/i;
  const matchAbbrev = title.match(patternAbbrev);
  
  if (matchAbbrev) {
    const abbrev = matchAbbrev[1].toUpperCase();
    const chapter = matchAbbrev[2];
    const verses = matchAbbrev[3].replace(/[.,]/g, (m) => m === '.' ? ',' : ':').replace(/\s/g, '');
    
    const book = ABBREV_TO_BOOK[abbrev] || BOOKS_EN_TO_ES[abbrev] || matchAbbrev[1];
    return `${book} ${chapter}:${verses}`;
  }
  
  // Pattern: Full book names in Spanish
  const patternEs = /\b(Mateo|Marcos|Lucas|Juan|Génesis|Éxodo|Hechos|Romanos|Corintios|Gálatas|Efesios|Filipenses|Colosenses|Hebreos|Santiago|Pedro|Judas|Apocalipsis)\s*([\d]+)[\s:,]+([\d\-.,]+)/i;
  const matchEs = title.match(patternEs);
  
  if (matchEs) {
    return `${matchEs[1]} ${matchEs[2]}:${matchEs[3]}`;
  }
  
  // Pattern: English book names
  const pattern = /^([A-Za-z]+)\s*([\d]+)[:]([\d,-]+)/;
  const match = title.match(pattern);
  
  if (match) {
    const bookEn = match[1].toUpperCase();
    const chapter = match[2];
    const verses = match[3];
    
    const bookEs = BOOKS_EN_TO_ES[bookEn] || match[1];
    return `${bookEs} ${chapter}:${verses}`;
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!YOUTUBE_API_KEY) {
      throw new Error('YOUTUBE_API_KEY is not configured');
    }

    const body = await req.json().catch(() => ({}));
    const maxVideos = body.maxVideos || 50;

    console.log('Starting Gospel video fetch process...');
    
    // Step 1: Get channel ID
    const channelId = await getChannelId(CHANNEL_HANDLE);
    if (!channelId) {
      throw new Error(`Could not find channel: ${CHANNEL_HANDLE}`);
    }
    console.log(`Found channel ID: ${channelId}`);
    
    // Step 2: Get uploads playlist ID
    const uploadsPlaylistId = await getUploadsPlaylistId(channelId);
    if (!uploadsPlaylistId) {
      throw new Error('Could not find uploads playlist');
    }
    console.log(`Found uploads playlist: ${uploadsPlaylistId}`);
    
    // Step 3: Get recent videos from playlist
    const videos = await getRecentVideos(uploadsPlaylistId, maxVideos);
    
    // Step 4: Filter videos with valid dates
    const videosWithDates = videos.filter(v => v.fecha !== null);
    console.log(`Videos with valid dates: ${videosWithDates.length}`);
    
    // Step 5: Update database
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    let insertedCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];
    
    for (const video of videosWithDates) {
      if (!video.fecha) continue;
      
      // Try to upsert (insert or update)
      const { data: existing } = await supabase
        .from('daily_gospel')
        .select('id')
        .eq('fecha', video.fecha)
        .single();
      
      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('daily_gospel')
          .update({ 
            youtube_video_id: video.videoId,
            referencia: video.referencia,
            titulo: video.title,
            published_at: video.publishedAt,
            updated_at: new Date().toISOString()
          })
          .eq('fecha', video.fecha);
        
        if (error) {
          errors.push(`Update ${video.fecha}: ${error.message}`);
        } else {
          updatedCount++;
        }
      } else {
        // Insert new
        const { error } = await supabase
          .from('daily_gospel')
          .insert({ 
            fecha: video.fecha,
            youtube_video_id: video.videoId,
            referencia: video.referencia,
            titulo: video.title,
            published_at: video.publishedAt
          });
        
        if (error) {
          errors.push(`Insert ${video.fecha}: ${error.message}`);
        } else {
          insertedCount++;
        }
      }
    }
    
    const result = {
      success: true,
      channelId,
      totalVideosFound: videos.length,
      videosWithValidDates: videosWithDates.length,
      inserted: insertedCount,
      updated: updatedCount,
      errors: errors.length > 0 ? errors : undefined,
      sampleVideos: videosWithDates.slice(0, 10).map(v => ({
        fecha: v.fecha,
        referencia: v.referencia,
        videoId: v.videoId,
        title: v.title
      }))
    };
    
    console.log('Process completed:', JSON.stringify(result, null, 2));
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in fetch-gospel-videos:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
