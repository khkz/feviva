import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAudioCache } from "@/hooks/useAudioCache";

interface UseOracionAudioProps {
  oracionId: string;
  nombre: string;
  texto: string;
  existingAudioUrl?: string;
}

export function useOracionAudio({ oracionId, nombre, texto, existingAudioUrl }: UseOracionAudioProps) {
  const { toast } = useToast();
  const { getAudioWithCache } = useAudioCache();
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudioUrl || null);
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Pre-cache audio if URL exists
  useEffect(() => {
    if (existingAudioUrl) {
      getAudioWithCache(existingAudioUrl).then(url => {
        if (url) setCachedUrl(url);
      });
    }
  }, [existingAudioUrl, getAudioWithCache]);

  const generateAudio = useCallback(async () => {
    if (audioUrl || isGenerating) return audioUrl;
    
    setIsGenerating(true);
    
    try {
      // Clean the filename
      const filename = `oraciones/${oracionId}-${nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: texto, 
          filename,
          voice: 'shimmer', // Calm, gentle voice for prayers
          targetTable: 'oraciones', // Save audio URL directly from edge function
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
      setIsGenerating(false);
    }
    
    return null;
  }, [oracionId, nombre, texto, audioUrl, isGenerating, toast]);

  const play = useCallback(async () => {
    let url = cachedUrl || audioUrl;
    
    // Generate audio if not available
    if (!url) {
      url = await generateAudio();
      if (!url) return;
      // Cache the newly generated audio
      const cached = await getAudioWithCache(url);
      if (cached) {
        setCachedUrl(cached);
        url = cached;
      }
    }

    // Create or reuse audio element
    if (!audioRef.current || audioRef.current.src !== url) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(url);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setProgress(0);
      };
      
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setProgress(pct);
        }
      };
    }

    await audioRef.current.play();
    setIsPlaying(true);
  }, [audioUrl, generateAudio]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
    }
  }, []);

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
