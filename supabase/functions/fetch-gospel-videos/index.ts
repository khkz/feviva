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
        const fecha = extractDateFromTitle(title, publishedAt);
        const referencia = extractReference(title);
        
        videos.push({ videoId, title, publishedAt, fecha, referencia });
        videosFetched++;
        
        if (fecha) {
          console.log(`Found: ${fecha} - ${referencia || 'N/A'} - ${videoId}`);
        }
      }
    }
    
    nextPageToken = data.nextPageToken;
    if (!nextPageToken) break;
  }
  
  console.log(`Total videos fetched: ${videos.length}`);
  return videos;
}

// Extraer fecha del título: "ENERO 8" -> "2026-01-08"
function extractDateFromTitle(title: string, publishedAt: string): string | null {
  // Pattern: "ENERO 8", "Enero 8", "ENERO 08", etc.
  const pattern = /\b([A-Za-záéíóúÁÉÍÓÚ]+)\s+(\d{1,2})\b/i;
  const match = title.match(pattern);
  
  if (match) {
    const monthName = match[1].toUpperCase();
    const day = parseInt(match[2], 10);
    const month = MONTHS_ES[monthName];
    
    if (month && day >= 1 && day <= 31) {
      // Usar el año del video publicado
      const year = new Date(publishedAt).getFullYear();
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }
  return null;
}

// Extraer referencia bíblica del título
// "Mark 6:34-44 - Gospel of the day" -> "Marcos 6:34-44"
function extractReference(title: string): string | null {
  // Pattern: Book Chapter:Verses at the beginning
  const pattern = /^([A-Za-z]+)\s*([\d]+)[:]([\d,-]+)/;
  const match = title.match(pattern);
  
  if (match) {
    const bookEn = match[1].toUpperCase();
    const chapter = match[2];
    const verses = match[3];
    
    const bookEs = BOOKS_EN_TO_ES[bookEn] || match[1];
    return `${bookEs} ${chapter}:${verses}`;
  }
  
  // Try Spanish pattern
  const patternEs = /\b(Mateo|Marcos|Lucas|Juan|Génesis|Éxodo|Hechos|Romanos|Corintios|Gálatas|Efesios|Filipenses|Colosenses|Hebreos|Santiago|Pedro|Judas|Apocalipsis)\s*([\d]+)[:]([\d,-]+)/i;
  const matchEs = title.match(patternEs);
  
  if (matchEs) {
    return `${matchEs[1]} ${matchEs[2]}:${matchEs[3]}`;
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
      if (!video.fecha || !video.referencia) continue;
      
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
