import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DailyContent {
  id: string;
  fecha: string;
  versiculo_referencia: string;
  versiculo_texto: string;
  reflexion_ia: string;
  tip_apologetico: string;
  oracion_laudes: string;
  oracion_completas: string;
  ensenanza_titulo: string | null;
  ensenanza_contenido: string | null;
  audio_versiculo_url: string | null;
  audio_ensenanza_url: string | null;
}

interface UserRitual {
  id: string;
  user_id: string;
  fecha: string;
  ritual_matutino_completado: boolean;
  ritual_nocturno_completado: boolean;
  meta_evangelizacion: string | null;
  compartio_fe: boolean;
  notas_evangelizacion: string | null;
  diario_personal: string | null;
  examen_conciencia: Record<string, string> | null;
}

export const useDailyContent = () => {
  const [content, setContent] = useState<DailyContent | null>(null);
  const [ritual, setRitual] = useState<UserRitual | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const fetchContent = async () => {
    try {
      // First try to get existing content
      const { data: existingContent, error: fetchError } = await supabase
        .from('daily_content')
        .select('*')
        .eq('fecha', today)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingContent) {
        setContent(existingContent as DailyContent);
      } else {
        // Generate new content
        await generateContent();
      }
    } catch (err) {
      console.error('Error fetching content:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar contenido');
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async () => {
    setGenerating(true);
    try {
      const { data, error: funcError } = await supabase.functions.invoke('generate-daily-content', {
        body: { fecha: today }
      });

      if (funcError) throw funcError;

      if (data?.content) {
        setContent(data.content as DailyContent);
      }
    } catch (err) {
      console.error('Error generating content:', err);
      setError(err instanceof Error ? err.message : 'Error al generar contenido');
    } finally {
      setGenerating(false);
    }
  };

  const fetchRitual = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existingRitual, error: fetchError } = await supabase
        .from('user_rituals')
        .select('*')
        .eq('user_id', user.id)
        .eq('fecha', today)
        .maybeSingle();

      if (fetchError) throw fetchError;

      setRitual(existingRitual as UserRitual | null);
    } catch (err) {
      console.error('Error fetching ritual:', err);
    }
  };

  const updateRitual = async (updates: Partial<UserRitual>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      if (ritual) {
        // Update existing
        const { data, error } = await supabase
          .from('user_rituals')
          .update(updates)
          .eq('id', ritual.id)
          .select()
          .single();

        if (error) throw error;
        setRitual(data as UserRitual);
      } else {
        // Create new
        const { data, error } = await supabase
          .from('user_rituals')
          .insert({
            user_id: user.id,
            fecha: today,
            ...updates
          })
          .select()
          .single();

        if (error) throw error;
        setRitual(data as UserRitual);
      }
    } catch (err) {
      console.error('Error updating ritual:', err);
      throw err;
    }
  };

  const completeMorningRitual = async (metaEvangelizacion?: string) => {
    await updateRitual({
      ritual_matutino_completado: true,
      meta_evangelizacion: metaEvangelizacion || null
    });
  };

  const completeEveningRitual = async (data: {
    examenConciencia: Record<string, string>;
    diarioPersonal: string;
    compartioFe: boolean;
    notasEvangelizacion?: string;
  }) => {
    await updateRitual({
      ritual_nocturno_completado: true,
      examen_conciencia: data.examenConciencia,
      diario_personal: data.diarioPersonal,
      compartio_fe: data.compartioFe,
      notas_evangelizacion: data.notasEvangelizacion || null
    });
  };

  useEffect(() => {
    fetchContent();
    fetchRitual();
  }, []);

  return {
    content,
    ritual,
    loading,
    generating,
    error,
    generateContent,
    completeMorningRitual,
    completeEveningRitual,
    updateRitual,
    refetch: () => {
      fetchContent();
      fetchRitual();
    }
  };
};
