import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseOracionAudioProps {
  oracionId: string;
  nombre: string;
  texto: string;
  existingAudioUrl?: string;
}

export function useOracionAudio({ oracionId, nombre, texto, existingAudioUrl }: UseOracionAudioProps) {
  const { toast } = useToast();
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudioUrl || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
          voice: 'nova' // Spanish-friendly voice
        },
      });

      if (error) throw error;
      
      if (data?.audioUrl) {
        setAudioUrl(data.audioUrl);
        
        // Update the prayer record with the audio URL
        await supabase
          .from('oraciones')
          .update({ audio_url: data.audioUrl })
          .eq('id', oracionId);
        
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
    let url = audioUrl;
    
    // Generate audio if not available
    if (!url) {
      url = await generateAudio();
      if (!url) return;
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
