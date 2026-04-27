import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAudioCache } from "@/hooks/useAudioCache";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";

interface UseOracionAudioProps {
  oracionId: string;
  nombre: string;
  texto: string;
  existingAudioUrl?: string;
}

export function useOracionAudio({ oracionId, nombre, texto, existingAudioUrl }: UseOracionAudioProps) {
  const { toast } = useToast();
  const { getAudioWithCache } = useAudioCache();
  const audioPlayer = useAudioPlayer();
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudioUrl || null);
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const isGeneratingRef = useRef(false);

  const isCurrentPrayer = audioPlayer.currentItem?.type === 'oracion' && audioPlayer.currentItem.id === oracionId;
  const isPlaying = isCurrentPrayer && audioPlayer.isPlaying;
  const progress = isCurrentPrayer && audioPlayer.duration > 0
    ? (audioPlayer.currentTime / audioPlayer.duration) * 100
    : 0;

  // Pre-cache audio if URL exists
  useEffect(() => {
    if (existingAudioUrl) {
      getAudioWithCache(existingAudioUrl).then(url => {
        if (url) setCachedUrl(url);
      });
    }
  }, [existingAudioUrl, getAudioWithCache]);

  const generateAudio = useCallback(async () => {
    // Use ref to prevent race conditions from multiple rapid clicks
    if (audioUrl || isGeneratingRef.current) return audioUrl;
    
    isGeneratingRef.current = true;
    
    setIsGenerating(true);
    
    try {
      // Clean the filename
      const filename = `oraciones/${oracionId}-${nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: texto, 
          filename,
          voice: 'echo', // Male deep voice for solemn prayers - Spanish Latino
          targetTable: 'oraciones',
          targetId: oracionId
        },
      });

      if (error) throw error;
      
      if (data?.audioUrl) {
        setAudioUrl(data.audioUrl);
        console.log('Audio generated and saved:', data.audioUrl);
        return data.audioUrl;
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        title: "Error al generar audio",
        description: "No se pudo generar el audio. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      isGeneratingRef.current = false;
      setIsGenerating(false);
    }
    
    return null;
  }, [oracionId, nombre, texto, audioUrl, toast]);

  const play = useCallback(async () => {
    let url = cachedUrl || audioUrl;
    
    // Generate audio if not available
    if (!url) {
      url = await generateAudio();
      if (!url) return;
    }

    try {
      audioPlayer.play({
        id: oracionId,
        title: nombre,
        subtitle: "Oración",
        audioUrl: url,
        type: 'oracion',
        originalData: { texto },
      });

      if (!cachedUrl && url) {
        getAudioWithCache(url).then(cached => {
          if (cached) setCachedUrl(cached);
        });
      }
    } catch (playError) {
      console.error('Error playing audio:', playError);
      toast({
        title: "Error al reproducir",
        description: "No se pudo reproducir el audio.",
        variant: "destructive",
      });
    }
  }, [audioUrl, cachedUrl, generateAudio, getAudioWithCache, audioPlayer, oracionId, nombre, texto, toast]);

  const pause = useCallback(() => {
    if (isCurrentPrayer) audioPlayer.pause();
  }, [audioPlayer, isCurrentPrayer]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const stop = useCallback(() => {
    if (isCurrentPrayer) audioPlayer.close();
  }, [audioPlayer, isCurrentPrayer]);

  return {
    audioUrl,
    isGenerating,
    isPlaying,
    progress,
    play,
    pause,
    toggle,
    stop,
    hasAudio: !!audioUrl,
  };
}
