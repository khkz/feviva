import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GratitudeSession {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
  duracion_min: number;
  audio_url: string | null;
}

interface GratitudeProgress {
  sesion_actual: number;
  sesiones_completadas: number;
}

export const useGratitudeExperience = () => {
  const [session, setSession] = useState<GratitudeSession | null>(null);
  const [progress, setProgress] = useState<GratitudeProgress | null>(null);
  const [totalSessions, setTotalSessions] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get or create user progress
      let { data: progressData } = await supabase
        .from('user_gratitude_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!progressData) {
        const { data: newProgress } = await supabase
          .from('user_gratitude_progress')
          .insert({ user_id: user.id, sesion_actual: 1, sesiones_completadas: 0 })
          .select()
          .single();
        progressData = newProgress;
      }

      if (progressData) {
        setProgress({
          sesion_actual: progressData.sesion_actual || 1,
          sesiones_completadas: progressData.sesiones_completadas || 0
        });
      }

      // Get total sessions count
      const { count } = await supabase
        .from('gratitude_sessions')
        .select('*', { count: 'exact', head: true });
      
      setTotalSessions(count || 256);

      // Fetch current session
      const sessionNumber = progressData?.sesion_actual || 1;
      const { data: sessionData } = await supabase
        .from('gratitude_sessions')
        .select('*')
        .eq('numero', sessionNumber)
        .single();

      if (sessionData) {
        setSession(sessionData);
      }
    } catch (error) {
      console.error('Error fetching gratitude experience:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const advanceSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !progress) return;

      const nextSession = progress.sesion_actual >= totalSessions ? 1 : progress.sesion_actual + 1;
      
      await supabase
        .from('user_gratitude_progress')
        .update({
          sesion_actual: nextSession,
          sesiones_completadas: progress.sesiones_completadas + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      await fetchProgress();
    } catch (error) {
      console.error('Error advancing session:', error);
    }
  };

  return {
    session,
    progress,
    totalSessions,
    loading,
    advanceSession,
    refetch: fetchProgress
  };
};
