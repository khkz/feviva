import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CalendarSaint {
  id: string;
  name: string;
  slug: string | null;
  feast_month: number;
  feast_day: number;
  country_code: string | null;
  category: string;
  tags: string[] | null;
  description: string | null;
  image_url: string | null;
  prayer_id: string | null;
  created_at: string | null;
}

interface UseSaintOfDayResult {
  saint: CalendarSaint | null;
  isNationalFeast: boolean;
  allSaintsToday: CalendarSaint[];
  loading: boolean;
  error: Error | null;
}

export const useSaintOfDay = (userCountryCode?: string | null): UseSaintOfDayResult => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // JavaScript months are 0-indexed
  const currentDay = today.getDate();

  const { data: saintsToday, isLoading, error } = useQuery({
    queryKey: ['saints-of-day', currentMonth, currentDay],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_saints')
        .select('*')
        .eq('feast_month', currentMonth)
        .eq('feast_day', currentDay)
        .is('duplicado_de', null);

      if (error) throw error;
      return data as CalendarSaint[];
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  // Prioritize national patron if user's country matches
  const nationalSaint = saintsToday?.find(
    (saint) => saint.country_code === userCountryCode && saint.category === 'patron_country'
  );

  // If no national match, get the first universal saint or any saint
  const universalSaint = saintsToday?.find(
    (saint) => saint.country_code === null || saint.category === 'universal_helper'
  );

  const primarySaint = nationalSaint || universalSaint || saintsToday?.[0] || null;
  const isNationalFeast = !!nationalSaint;

  return {
    saint: primarySaint,
    isNationalFeast,
    allSaintsToday: saintsToday || [],
    loading: isLoading,
    error: error as Error | null,
  };
};
