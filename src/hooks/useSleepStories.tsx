import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAudioCache } from "@/hooks/useAudioCache";

export interface SleepStory {
  id: string;
  titulo: string;
  descripcion: string;
  contenido: string;
  categoria: string;
  duracion_estimada: number;
  audio_url: string | null;
  imagen_url: string | null;
  orden: number;
}

export const useSleepStories = () => {
  const [stories, setStories] = useState<SleepStory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { getAudioWithCache } = useAudioCache();

  /**
   * Get cached audio URL for a story
   */
  const getCachedAudioUrl = useCallback(async (audioUrl: string | null): Promise<string | null> => {
    if (!audioUrl) return null;
    return getAudioWithCache(audioUrl);
  }, [getAudioWithCache]);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from("sleep_stories")
        .select("*")
        .order("orden", { ascending: true });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las historias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAudio = async (story: SleepStory): Promise<string | null> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text: story.contenido,
            filename: `sleep-story-${story.id}`,
            voice: "nova", // Calm, soothing voice for sleep
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate audio");
      }

      const data = await response.json();
      
      // Update the story with the audio URL
      await supabase
        .from("sleep_stories")
        .update({ audio_url: data.audioUrl })
        .eq("id", story.id);

      return data.audioUrl;
    } catch (error) {
      console.error("Error generating audio:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el audio",
        variant: "destructive",
      });
      return null;
    }
  };

  const saveProgress = async (storyId: string, duracion: number, completado: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("user_sleep_history").upsert({
        user_id: user.id,
        story_id: storyId,
        duracion_escuchada: duracion,
        completado,
        fecha: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  return {
    stories,
    loading,
    generateAudio,
    saveProgress,
    refetch: fetchStories,
    getCachedAudioUrl,
  };
};
