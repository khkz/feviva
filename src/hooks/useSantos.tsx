import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CalendarSaint {
  id: string;
  name: string;
  description: string | null;
  feast_day: number;
  feast_month: number;
  category: string;
  country_code: string | null;
  image_url: string | null;
  prayer_id: string | null;
  tags: string[] | null;
  created_at: string | null;
  slug: string | null;
}

interface UseSantosOptions {
  month?: number | null;
  countryCode?: string | null;
  category?: string | null;
  onlyWithImage?: boolean;
  onlyWithPrayer?: boolean;
}

export function useSantos(options: UseSantosOptions = {}) {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: saints = [], isLoading, error } = useQuery({
    queryKey: ['calendar-saints'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_saints')
        .select('*')
        .order('feast_month', { ascending: true })
        .order('feast_day', { ascending: true })
        .limit(3000);

      if (error) throw error;
      return data as CalendarSaint[];
    },
  });

  // Get today's saints
  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  const saintsToday = useMemo(() => {
    return saints.filter(
      (saint) => saint.feast_month === todayMonth && saint.feast_day === todayDay
    );
  }, [saints, todayMonth, todayDay]);

  // Filter saints based on options and search
  const filteredSaints = useMemo(() => {
    let result = [...saints];

    // Filter by month
    if (options.month) {
      result = result.filter((saint) => saint.feast_month === options.month);
    }

    // Filter by country code
    if (options.countryCode) {
      result = result.filter((saint) => saint.country_code === options.countryCode);
    }

    // Filter by category
    if (options.category) {
      result = result.filter((saint) => saint.category === options.category);
    }

    // Filter by image presence
    if (options.onlyWithImage) {
      result = result.filter((saint) => saint.image_url);
    }

    // Filter by prayer presence
    if (options.onlyWithPrayer) {
      result = result.filter((saint) => saint.prayer_id);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (saint) =>
          saint.name.toLowerCase().includes(query) ||
          saint.description?.toLowerCase().includes(query) ||
          saint.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return result;
  }, [saints, options.month, options.countryCode, options.category, options.onlyWithImage, options.onlyWithPrayer, searchQuery]);

  // Get patron saints
  const patronSaints = useMemo(() => {
    return saints.filter((saint) => saint.category === 'patron_country');
  }, [saints]);

  // Get saints for current month
  const saintsThisMonth = useMemo(() => {
    return saints.filter((saint) => saint.feast_month === todayMonth);
  }, [saints, todayMonth]);

  // Get unique countries
  const countries = useMemo(() => {
    const codes = new Set<string>();
    saints.forEach((saint) => {
      if (saint.country_code) codes.add(saint.country_code);
    });
    return Array.from(codes).sort();
  }, [saints]);

  // Statistics
  const stats = useMemo(() => ({
    total: saints.length,
    withImage: saints.filter((s) => s.image_url).length,
    withPrayer: saints.filter((s) => s.prayer_id).length,
    patrons: patronSaints.length,
    withDescription: saints.filter((s) => s.description && s.description.length > 50).length,
  }), [saints, patronSaints]);

  // Months for filtering
  const months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ];

  return {
    saints: filteredSaints,
    allSaints: saints,
    saintsToday,
    saintsThisMonth,
    patronSaints,
    countries,
    months,
    stats,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
  };
}
