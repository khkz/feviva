import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate audio using text-to-speech function
async function generateAudio(
  supabaseUrl: string, 
  supabaseServiceKey: string, 
  text: string, 
  filename: string
): Promise<string | null> {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/text-to-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'X-Admin-Api-Key': Deno.env.get('ADMIN_API_KEY') || '',
      },
      body: JSON.stringify({ text, filename, voice: 'nova' }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`TTS error for ${filename}:`, error);
      return null;
    }

    const data = await response.json();
    return data.audioUrl;
  } catch (error) {
    console.error(`Error generating audio for ${filename}:`, error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
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

    const { fecha } = await req.json().catch(() => ({}));
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build query - either specific date or all with missing audio
    let query = supabase
      .from('daily_content')
      .select('*');

    if (fecha) {
      query = query.eq('fecha', fecha);
    } else {
      // Find content with ANY missing audio
      query = query.or('audio_reflexion_url.is.null,audio_laudes_url.is.null,audio_completas_url.is.null,audio_tip_url.is.null');
    }

    const { data: contentList, error: fetchError } = await query.order('fecha', { ascending: false });

    if (fetchError) {
      throw new Error(`Error fetching content: ${fetchError.message}`);
    }

    if (!contentList || contentList.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No content found with missing audio',
          processed: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${contentList.length} content entries to process`);
    const results: { fecha: string; audiosGenerated: string[] }[] = [];

    for (const content of contentList) {
      const audiosGenerated: string[] = [];
      const updates: Record<string, string> = {};

      // Generate missing reflexion audio
      if (!content.audio_reflexion_url && content.reflexion_ia) {
        console.log(`Generating reflexion audio for ${content.fecha}`);
        const audioUrl = await generateAudio(
          supabaseUrl, 
          supabaseServiceKey, 
          content.reflexion_ia, 
          `daily-reflexion-${content.fecha}`
        );
        if (audioUrl) {
          updates.audio_reflexion_url = audioUrl;
          audiosGenerated.push('reflexion');
        }
      }

      // Generate missing laudes audio
      if (!content.audio_laudes_url && content.oracion_laudes) {
        console.log(`Generating laudes audio for ${content.fecha}`);
        const audioUrl = await generateAudio(
          supabaseUrl, 
          supabaseServiceKey, 
          content.oracion_laudes, 
          `daily-laudes-${content.fecha}`
        );
        if (audioUrl) {
          updates.audio_laudes_url = audioUrl;
          audiosGenerated.push('laudes');
        }
      }

      // Generate missing completas audio
      if (!content.audio_completas_url && content.oracion_completas) {
        console.log(`Generating completas audio for ${content.fecha}`);
        const audioUrl = await generateAudio(
          supabaseUrl, 
          supabaseServiceKey, 
          content.oracion_completas, 
          `daily-completas-${content.fecha}`
        );
        if (audioUrl) {
          updates.audio_completas_url = audioUrl;
          audiosGenerated.push('completas');
        }
      }

      // Generate missing tip audio
      if (!content.audio_tip_url && content.tip_apologetico) {
        console.log(`Generating tip audio for ${content.fecha}`);
        const audioUrl = await generateAudio(
          supabaseUrl, 
          supabaseServiceKey, 
          content.tip_apologetico, 
          `daily-tip-${content.fecha}`
        );
        if (audioUrl) {
          updates.audio_tip_url = audioUrl;
          audiosGenerated.push('tip');
        }
      }

      // Update the record if we generated any audio
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('daily_content')
          .update(updates)
          .eq('id', content.id);

        if (updateError) {
          console.error(`Error updating ${content.fecha}:`, updateError);
        } else {
          console.log(`Updated ${content.fecha} with ${audiosGenerated.length} new audios`);
        }
      }

      results.push({ fecha: content.fecha, audiosGenerated });
    }

    const totalAudios = results.reduce((sum, r) => sum + r.audiosGenerated.length, 0);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Generated ${totalAudios} audios for ${results.length} days`,
        processed: results.length,
        totalAudios,
        details: results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in regenerate-daily-audio:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
