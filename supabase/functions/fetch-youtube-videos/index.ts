import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Channel handle: @LaBibliaEn365Dias
const CHANNEL_HANDLE = '@LaBibliaEn365Dias';

interface YouTubeVideo {
  videoId: string;
  title: string;
  dayNumber: number | null;
}

async function getChannelId(handle: string): Promise<string | null> {
  console.log(`Fetching channel ID for handle: ${handle}`);
  
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(handle)}&key=${YOUTUBE_API_KEY}`
  );
  
  const data = await response.json();
  console.log('Channel search response:', JSON.stringify(data, null, 2));
  
  if (data.items && data.items.length > 0) {
    return data.items[0].snippet.channelId;
  }
  
  return null;
}

async function getUploadsPlaylistId(channelId: string): Promise<string | null> {
  console.log(`Fetching uploads playlist for channel: ${channelId}`);
  
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
  );
  
  const data = await response.json();
  console.log('Channel details response:', JSON.stringify(data, null, 2));
  
  if (data.items && data.items.length > 0) {
    return data.items[0].contentDetails.relatedPlaylists.uploads;
  }
  
  return null;
}

async function getAllVideosFromPlaylist(playlistId: string): Promise<YouTubeVideo[]> {
  console.log(`Fetching all videos from playlist: ${playlistId}`);
  
  const videos: YouTubeVideo[] = [];
  let nextPageToken: string | undefined;
  let pageCount = 0;
  
  do {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('playlistId', playlistId);
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('key', YOUTUBE_API_KEY!);
    
    if (nextPageToken) {
      url.searchParams.set('pageToken', nextPageToken);
    }
    
    const response = await fetch(url.toString());
    const data = await response.json();
    
    pageCount++;
    console.log(`Page ${pageCount}: Retrieved ${data.items?.length || 0} videos`);
    
    if (data.items) {
      for (const item of data.items) {
        const title = item.snippet.title;
        const videoId = item.snippet.resourceId.videoId;
        const dayNumber = extractDayFromTitle(title);
        
        videos.push({ videoId, title, dayNumber });
        
        if (dayNumber) {
          console.log(`Found: Day ${dayNumber} - ${videoId} - ${title}`);
        }
      }
    }
    
    nextPageToken = data.nextPageToken;
  } while (nextPageToken);
  
  console.log(`Total videos fetched: ${videos.length}`);
  return videos;
}

function extractDayFromTitle(title: string): number | null {
  // Patterns to match day numbers in titles:
  // "Día 1: En el Principio"
  // "Día 1 - En el Principio"
  // "Day 1: In the Beginning"
  // "Dia 1: ..."
  
  const patterns = [
    /D[íi]a\s*(\d+)/i,  // Día 1, Dia 1
    /Day\s*(\d+)/i,      // Day 1
    /^(\d+)\s*[-:]/,     // 1: or 1 -
    /\(D[íi]a\s*(\d+)\)/i, // (Día 1)
  ];
  
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      const dayNum = parseInt(match[1], 10);
      if (dayNum >= 1 && dayNum <= 365) {
        return dayNum;
      }
    }
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

    console.log('Starting YouTube video fetch process...');
    
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
    
    // Step 3: Get all videos from playlist
    const videos = await getAllVideosFromPlaylist(uploadsPlaylistId);
    
    // Step 4: Filter videos with valid day numbers
    const videosWithDays = videos.filter(v => v.dayNumber !== null);
    console.log(`Videos with valid day numbers: ${videosWithDays.length}`);
    
    // Step 5: Update database
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    let updatedCount = 0;
    let errors: string[] = [];
    
    for (const video of videosWithDays) {
      const { error } = await supabase
        .from('bible_reading_plan')
        .update({ youtube_video_id: video.videoId })
        .eq('dia', video.dayNumber);
      
      if (error) {
        errors.push(`Day ${video.dayNumber}: ${error.message}`);
        console.error(`Error updating day ${video.dayNumber}:`, error);
      } else {
        updatedCount++;
      }
    }
    
    const result = {
      success: true,
      channelId,
      uploadsPlaylistId,
      totalVideosFound: videos.length,
      videosWithValidDays: videosWithDays.length,
      updatedInDatabase: updatedCount,
      errors: errors.length > 0 ? errors : undefined,
      sampleVideos: videosWithDays.slice(0, 10).map(v => ({
        day: v.dayNumber,
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
    console.error('Error in fetch-youtube-videos:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
