import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays } from 'date-fns';

export interface DailyGospel {
  id: string;
  fecha: string;
  referencia: string;
  youtube_video_id: string;
  titulo: string | null;
  sacerdote: string | null;
  tiempo_liturgico: string | null;
  published_at: string | null;
}

export const useDailyGospel = (specificDate?: string) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const targetDate = specificDate || today;

  // Fetch gospel for a specific date
  const { data: gospel, isLoading, error } = useQuery({
    queryKey: ['gospel', targetDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_gospel')
        .select('*')
        .eq('fecha', targetDate)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as DailyGospel | null;
    },
    staleTime: 60 * 60 * 1000, // 1 hora
  });

  // Fetch today's gospel
  const { data: todayGospel } = useQuery({
    queryKey: ['gospel', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_gospel')
        .select('*')
        .eq('fecha', today)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as DailyGospel | null;
    },
    staleTime: 60 * 60 * 1000,
    enabled: !specificDate, // Only fetch if not looking at specific date
  });

  // Fetch tomorrow's gospel (for evening display) - with auto-sync if missing
  const { data: tomorrowGospel } = useQuery({
    queryKey: ['gospel', tomorrow],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_gospel')
        .select('*')
        .eq('fecha', tomorrow)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      // If tomorrow's gospel is missing, try to sync from YouTube
      if (!data) {
        try {
          await supabase.functions.invoke('fetch-gospel-videos');
          // Retry fetching after sync
          const { data: retryData } = await supabase
            .from('daily_gospel')
            .select('*')
            .eq('fecha', tomorrow)
            .single();
          return retryData as DailyGospel | null;
        } catch {
          return null;
        }
      }
      
      return data as DailyGospel | null;
    },
    staleTime: 60 * 60 * 1000,
    enabled: !specificDate,
  });

  // Fetch recent gospels for navigation
  const { data: recentGospels } = useQuery({
    queryKey: ['gospels-recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_gospel')
        .select('*')
        .lte('fecha', today)
        .order('fecha', { ascending: false })
        .limit(7);
      
      if (error) throw error;
      return data as DailyGospel[];
    },
    staleTime: 60 * 60 * 1000,
  });

  // Determine which gospel to show based on time of day
  const currentHour = new Date().getHours();
  const showTomorrowGospel = currentHour >= 18 && tomorrowGospel;
  
  const activeGospel = specificDate 
    ? gospel 
    : (showTomorrowGospel ? tomorrowGospel : todayGospel);

  return {
    gospel,
    todayGospel,
    tomorrowGospel,
    activeGospel,
    recentGospels,
    isShowingTomorrow: !specificDate && showTomorrowGospel,
    isLoading,
    error,
  };
};
