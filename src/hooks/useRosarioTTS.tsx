import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAudioCache } from "@/hooks/useAudioCache";
import { ORACIONES_ROSARIO } from "@/lib/rosarioData";

type PrayerType = 'padreNuestro' | 'aveMaria' | 'gloria' | 'salveRegina';

interface CachedAudios {
  padreNuestro?: string;
  aveMaria?: string;
  gloria?: string;
  salveRegina?: string;
}

export function useRosarioTTS() {
  const { toast } = useToast();
  const { getAudioWithCache } = useAudioCache();
  const [audioUrls, setAudioUrls] = useState<CachedAudios>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingPrayer, setGeneratingPrayer] = useState<PrayerType | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPrayer, setCurrentPrayer] = useState<PrayerType | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const generatingRef = useRef<Set<PrayerType>>(new Set());
  const onEndedCallbackRef = useRef<(() => void) | null>(null);

  // Check for existing audio URLs from localStorage cache
  useEffect(() => {
    const cached = localStorage.getItem('rosario_tts_urls');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setAudioUrls(parsed);
      } catch {}
    }
  }, []);

  // Save to localStorage when URLs change
  useEffect(() => {
    if (Object.keys(audioUrls).length > 0) {
      localStorage.setItem('rosario_tts_urls', JSON.stringify(audioUrls));
    }
  }, [audioUrls]);

  const generatePrayerAudio = useCallback(async (prayerType: PrayerType): Promise<string | null> => {
    // Check if already cached
    if (audioUrls[prayerType]) {
      return audioUrls[prayerType]!;
    }

    // Prevent duplicate generation
    if (generatingRef.current.has(prayerType)) {
      return null;
    }

    generatingRef.current.add(prayerType);
    setIsGenerating(true);
    setGeneratingPrayer(prayerType);

    try {
      const prayerTexts: Record<PrayerType, string> = {
        padreNuestro: ORACIONES_ROSARIO.padreNuestro,
        aveMaria: ORACIONES_ROSARIO.aveMaria,
        gloria: ORACIONES_ROSARIO.gloria,
        salveRegina: ORACIONES_ROSARIO.salveRegina,
      };

      const text = prayerTexts[prayerType];
      const filename = `rosario/${prayerType}`;

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text,
          filename,
          voice: 'onyx', // Deep solemn voice for prayers
        },
      });

      if (error) throw error;

      if (data?.audioUrl) {
        setAudioUrls(prev => ({ ...prev, [prayerType]: data.audioUrl }));
        console.log(`Rosary prayer audio generated: ${prayerType}`, data.audioUrl);
        return data.audioUrl;
      }
    } catch (error) {
      console.error(`Error generating ${prayerType} audio:`, error);
      toast({
        title: "Error al generar audio",
        description: `No se pudo generar el audio de ${prayerType}`,
        variant: "destructive",
      });
    } finally {
      generatingRef.current.delete(prayerType);
      setIsGenerating(false);
      setGeneratingPrayer(null);
    }

    return null;
  }, [audioUrls, toast]);

  // Pre-generate all prayers
  const preGenerateAll = useCallback(async () => {
    const prayers: PrayerType[] = ['padreNuestro', 'aveMaria', 'gloria', 'salveRegina'];
    
    for (const prayer of prayers) {
      if (!audioUrls[prayer]) {
        await generatePrayerAudio(prayer);
      }
    }
  }, [audioUrls, generatePrayerAudio]);

  const playPrayer = useCallback(async (prayerType: PrayerType) => {
    let url = audioUrls[prayerType];

    // Generate if not available
    if (!url) {
      url = await generatePrayerAudio(prayerType);
      if (!url) return;
    }

    // Get cached blob URL for faster playback
    const cachedUrl = await getAudioWithCache(url);
    const finalUrl = cachedUrl || url;

    try {
      // Stop current audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      audioRef.current = new Audio(finalUrl);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentPrayer(null);
        // Call the onEnded callback if set (for auto-advance)
        if (onEndedCallbackRef.current) {
          onEndedCallbackRef.current();
        }
      };

      audioRef.current.onerror = () => {
        setIsPlaying(false);
        setCurrentPrayer(null);
        toast({
          title: "Error de reproducción",
          description: "No se pudo reproducir el audio",
          variant: "destructive",
        });
      };

      await audioRef.current.play();
      setIsPlaying(true);
      setCurrentPrayer(prayerType);
    } catch (error) {
      console.error('Error playing prayer audio:', error);
    }
  }, [audioUrls, generatePrayerAudio, getAudioWithCache, toast]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentPrayer(null);
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  // Determine prayer type from current prayer index
  const getPrayerTypeFromIndex = useCallback((prayerIndex: number): PrayerType => {
    if (prayerIndex === 0) return 'padreNuestro';
    if (prayerIndex >= 1 && prayerIndex <= 10) return 'aveMaria';
    return 'gloria';
  }, []);

  // Set callback for when audio ends (for auto-advance)
  const setOnEnded = useCallback((callback: (() => void) | null) => {
    onEndedCallbackRef.current = callback;
  }, []);

  return {
    audioUrls,
    isGenerating,
    generatingPrayer,
    isPlaying,
    currentPrayer,
    generatePrayerAudio,
    preGenerateAll,
    playPrayer,
    stop,
    pause,
    resume,
    getPrayerTypeFromIndex,
    setOnEnded,
    hasAllAudios: !!(audioUrls.padreNuestro && audioUrls.aveMaria && audioUrls.gloria),
  };
}
