import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReferralLeaderboardEntry {
  id: string;
  nombre: string;
  avatar_url: string | null;
  referral_points: number;
  total_referrals: number;
  rank: number;
}

interface ReferralStats {
  code: string | null;
  totalReferrals: number;
  totalPoints: number;
  referrals: {
    id: string;
    referred_id: string;
    points_awarded: number;
    created_at: string;
    referred_name?: string;
  }[];
}

export const useReferrals = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  // Obtener código de referido del usuario
  const { data: referralCode, isLoading: loadingCode } = useQuery({
    queryKey: ['referral-code', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Llamar a la función RPC para obtener o crear código
      const { data, error } = await supabase.rpc('get_or_create_referral_code', {
        p_user_id: userId
      });
      
      if (error) throw error;
      return data as string;
    },
    enabled: !!userId,
  });

  // Obtener estadísticas de referidos
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['referral-stats', userId],
    queryFn: async (): Promise<ReferralStats> => {
      if (!userId) return { code: null, totalReferrals: 0, totalPoints: 0, referrals: [] };

      // Obtener referidos del usuario
      const { data: referrals, error: refError } = await supabase
        .from('referrals')
        .select('id, referred_id, points_awarded, created_at')
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (refError) throw refError;

      // Obtener puntos totales de perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_points')
        .eq('id', userId)
        .single();

      return {
        code: referralCode || null,
        totalReferrals: referrals?.length || 0,
        totalPoints: profile?.referral_points || 0,
        referrals: referrals || [],
      };
    },
    enabled: !!userId && !!referralCode,
  });

  // Obtener leaderboard
  const { data: leaderboard, isLoading: loadingLeaderboard } = useQuery({
    queryKey: ['referral-leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referral_leaderboard')
        .select('*')
        .limit(10);

      if (error) throw error;
      return data as ReferralLeaderboardEntry[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Aplicar código de referido
  const applyReferralCode = useMutation({
    mutationFn: async (code: string) => {
      if (!userId) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase.rpc('process_referral', {
        p_referred_id: userId,
        p_referral_code: code.toUpperCase(),
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string; points_awarded?: number };
      if (!result.success) {
        throw new Error(result.error || 'Error al aplicar código');
      }
      
      return result;
    },
    onSuccess: (data) => {
      toast({
        title: '¡Código aplicado!',
        description: `Has recibido un regalo de bienvenida. Tu amigo ganó ${data.points_awarded} puntos.`,
      });
      queryClient.invalidateQueries({ queryKey: ['referral-stats'] });
      queryClient.invalidateQueries({ queryKey: ['referral-leaderboard'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Generar link de invitación
  const getShareLink = () => {
    if (!referralCode) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/auth?ref=${referralCode}`;
  };

  // Generar mensaje de WhatsApp
  const getWhatsAppMessage = () => {
    const link = getShareLink();
    return encodeURIComponent(
      `¡Te invito a El Rugido! 🦁✝️\n\nUna app católica con santos, oraciones, novenas y mucho más.\n\nÚnete con mi código: ${referralCode}\n\n${link}`
    );
  };

  // Copiar código al portapapeles
  const copyCode = async () => {
    if (!referralCode) return;
    await navigator.clipboard.writeText(referralCode);
    toast({
      title: '¡Copiado!',
      description: 'Código de referido copiado al portapapeles',
    });
  };

  // Copiar link al portapapeles
  const copyLink = async () => {
    const link = getShareLink();
    if (!link) return;
    await navigator.clipboard.writeText(link);
    toast({
      title: '¡Copiado!',
      description: 'Link de invitación copiado al portapapeles',
    });
  };

  return {
    referralCode,
    stats,
    leaderboard,
    loading: loadingCode || loadingStats,
    loadingLeaderboard,
    applyReferralCode,
    getShareLink,
    getWhatsAppMessage,
    copyCode,
    copyLink,
    userId,
  };
};
