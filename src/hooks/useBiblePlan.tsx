import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BibleReading {
  id: string;
  dia: number;
  titulo: string;
  pasaje_referencia: string;
  pasaje_texto: string;
  reflexion: string | null;
}

interface UserProgress {
  id: string;
  dia_actual: number;
  dias_completados: number[];
  racha_actual: number;
  ultima_lectura: string | null;
}

export const useBiblePlan = () => {
  const [todayReading, setTodayReading] = useState<BibleReading | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [allReadings, setAllReadings] = useState<BibleReading[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch all readings
      const { data: readings } = await supabase
        .from('bible_reading_plan')
        .select('*')
        .order('dia');
      
      if (readings) setAllReadings(readings);

      if (user) {
        // Fetch user progress
        let { data: progress } = await supabase
          .from('user_bible_progress')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!progress) {
          // Create initial progress
          const { data: newProgress } = await supabase
            .from('user_bible_progress')
            .insert({ user_id: user.id, dia_actual: 1, dias_completados: [] })
            .select()
            .single();
          progress = newProgress;
        }

        if (progress) {
          setUserProgress({
            ...progress,
            dias_completados: (progress.dias_completados as number[]) || []
          });
          
          // Set today's reading based on progress
          const currentReading = readings?.find(r => r.dia === progress.dia_actual);
          if (currentReading) setTodayReading(currentReading);
        }
      } else if (readings?.length) {
        setTodayReading(readings[0]);
      }
    } catch (error) {
      console.error('Error fetching bible plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async (dia: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !userProgress) return;

    const today = new Date().toISOString().split('T')[0];
    const wasReadYesterday = userProgress.ultima_lectura === 
      new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    const newDiasCompletados = [...userProgress.dias_completados];
    if (!newDiasCompletados.includes(dia)) {
      newDiasCompletados.push(dia);
    }

    const newRacha = wasReadYesterday || !userProgress.ultima_lectura 
      ? userProgress.racha_actual + 1 
      : 1;

    const { error } = await supabase
      .from('user_bible_progress')
      .update({
        dias_completados: newDiasCompletados,
        dia_actual: Math.min(dia + 1, 365),
        racha_actual: newRacha,
        ultima_lectura: today,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (!error) {
      toast({ title: '¡Lectura completada!', description: `Día ${dia} marcado como leído` });
      fetchData();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    todayReading,
    userProgress,
    allReadings,
    loading,
    markAsCompleted,
    progressPercentage: userProgress ? Math.round((userProgress.dias_completados.length / 365) * 100) : 0
  };
};
