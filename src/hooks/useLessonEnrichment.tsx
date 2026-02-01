import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseLessonAudioProps {
  lessonId: string;
  titulo: string;
  existingAudioUrl?: string | null;
}

interface EnrichedContent {
  contenido_enriquecido: string;
  puntos_clave: string[];
  citas_biblicas: string[];
  duracion_lectura: number;
  resumen_audio: string;
}

/**
 * Hook for generating lesson audio (TTS).
 * Playback is handled by the global AudioPlayerContext.
 */
export function useLessonAudio({ lessonId, titulo, existingAudioUrl }: UseLessonAudioProps) {
  const { toast } = useToast();
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudioUrl || null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  const generateAudio = useCallback(async (resumenAudio: string) => {
    if (audioUrl || isGeneratingAudio) return audioUrl;
    
    setIsGeneratingAudio(true);
    
    try {
      toast({
        title: "Generando audio...",
        description: "Esto puede tomar unos segundos",
      });

      const { data, error } = await supabase.functions.invoke('lesson-tts', {
        body: { 
          lessonId,
          text: resumenAudio, 
          titulo,
          voice: 'sage'
        },
      });

      if (error) throw error;
      
      if (data?.audioUrl) {
        setAudioUrl(data.audioUrl);
        toast({
          title: "Audio generado",
          description: "Ya puedes escuchar la lección",
        });
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
      setIsGeneratingAudio(false);
    }
    
    return null;
  }, [lessonId, titulo, audioUrl, isGeneratingAudio, toast]);

  return {
    audioUrl,
    isGeneratingAudio,
    generateAudio,
    hasAudio: !!audioUrl,
  };
}

export function useLessonEnrichment() {
  const { toast } = useToast();
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichedContent, setEnrichedContent] = useState<EnrichedContent | null>(null);

  const enrichLesson = useCallback(async (
    lessonId: string,
    titulo: string,
    descripcion: string,
    contenido: string,
    categoria: string
  ) => {
    setIsEnriching(true);
    
    try {
      toast({
        title: "Enriqueciendo contenido...",
        description: "Gemini 3 Pro está generando contenido extenso",
      });

      const { data, error } = await supabase.functions.invoke('enrich-lesson', {
        body: { 
          lessonId,
          titulo,
          descripcion,
          contenido,
          categoria,
        },
      });

      if (error) throw error;
      
      if (data?.success) {
        setEnrichedContent({
          contenido_enriquecido: data.contenido_enriquecido,
          puntos_clave: data.puntos_clave || [],
          citas_biblicas: data.citas_biblicas || [],
          duracion_lectura: data.duracion_lectura || 10,
          resumen_audio: data.resumen_audio || '',
        });
        
        toast({
          title: "Contenido enriquecido",
          description: "La lección ha sido expandida con éxito",
        });
        
        return data;
      }
    } catch (error) {
      console.error('Error enriching lesson:', error);
      toast({
        title: "Error al enriquecer",
        description: "No se pudo generar el contenido. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsEnriching(false);
    }
    
    return null;
  }, [toast]);

  const clearEnrichedContent = useCallback(() => {
    setEnrichedContent(null);
  }, []);

  return {
    isEnriching,
    enrichedContent,
    enrichLesson,
    clearEnrichedContent,
  };
}
