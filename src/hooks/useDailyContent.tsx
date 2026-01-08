import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  audio_reflexion_url: string | null;
  audio_laudes_url: string | null;
  audio_completas_url: string | null;
  audio_tip_url: string | null;
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

const today = new Date().toISOString().split('T')[0];

const fetchDailyContent = async (): Promise<DailyContent | null> => {
  const { data: existingContent, error } = await supabase
    .from('daily_content')
    .select('*')
    .eq('fecha', today)
    .maybeSingle();

  if (error) throw error;
  return existingContent as DailyContent | null;
};

const fetchUserRitual = async (): Promise<UserRitual | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_rituals')
    .select('*')
    .eq('user_id', user.id)
    .eq('fecha', today)
    .maybeSingle();

  if (error) throw error;
  return data as UserRitual | null;
};

export const useDailyContent = () => {
  const queryClient = useQueryClient();

  const { 
    data: content, 
    isLoading: contentLoading, 
    error: contentError,
    refetch: refetchContent
  } = useQuery({
    queryKey: ['daily-content', today],
    queryFn: fetchDailyContent,
    staleTime: 30 * 60 * 1000, // 30 minutes - content doesn't change often
  });

  const { 
    data: ritual, 
    isLoading: ritualLoading,
    refetch: refetchRitual
  } = useQuery({
    queryKey: ['user-ritual', today],
    queryFn: fetchUserRitual,
    staleTime: 5 * 60 * 1000,
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-daily-content', {
        body: { fecha: today }
      });
      if (error) throw error;
      return data?.content as DailyContent;
    },
    onSuccess: (newContent) => {
      queryClient.setQueryData(['daily-content', today], newContent);
    },
  });

  const updateRitual = async (updates: Partial<UserRitual>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    if (ritual) {
      const { data, error } = await supabase
        .from('user_rituals')
        .update(updates)
        .eq('id', ritual.id)
        .select()
        .single();

      if (error) throw error;
      queryClient.setQueryData(['user-ritual', today], data);
      return data;
    } else {
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
      queryClient.setQueryData(['user-ritual', today], data);
      return data;
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

  return {
    content: content ?? null,
    ritual: ritual ?? null,
    loading: contentLoading || ritualLoading,
    generating: generateMutation.isPending,
    error: contentError?.message || null,
    generateContent: generateMutation.mutateAsync,
    completeMorningRitual,
    completeEveningRitual,
    updateRitual,
    refetch: () => {
      refetchContent();
      refetchRitual();
    }
  };
};
