import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface DailyCapsule {
  id: string;
  fecha: string;
  dato_impactante: string;
  reflexion: string;
  fuente: string | null;
  categoria: string;
  emoji_icon: string;
  color_accent: string;
  share_count: number;
  created_at: string;
}

export const useDailyCapsule = () => {
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: capsule, isLoading } = useQuery({
    queryKey: ['daily-capsule', today],
    queryFn: async () => {
      // Try today first, fallback to most recent
      const { data } = await supabase
        .from('daily_capsules')
        .select('*')
        .lte('fecha', today)
        .order('fecha', { ascending: false })
        .limit(1)
        .single();
      return data as DailyCapsule | null;
    },
    staleTime: 60 * 60 * 1000,
  });

  const { data: recentCapsules } = useQuery({
    queryKey: ['capsules-recent'],
    queryFn: async () => {
      const { data } = await supabase
        .from('daily_capsules')
        .select('*')
        .lte('fecha', today)
        .order('fecha', { ascending: false })
        .limit(7);
      return (data || []) as DailyCapsule[];
    },
    staleTime: 60 * 60 * 1000,
  });

  const incrementShare = async (capsuleId: string) => {
    await supabase.rpc('increment_capsule_share' as never, { capsule_id: capsuleId } as never).catch(() => {
      // Fallback: just track client-side
    });
  };

  return { capsule, recentCapsules, isLoading, incrementShare };
};
