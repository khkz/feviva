import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  users: {
    total: number;
    thisWeek: number;
    active: number;
  };
  content: {
    sleepStories: { total: number; withAudio: number };
    novenas: { total: number; withImages: number };
    lessons: { total: number; enriched: number };
    oraciones: { total: number; withAudio: number };
    courses: { total: number; published: number };
    movies: { total: number; published: number };
  };
  processing: {
    pending: number;
    completed: number;
    errors: number;
    processing: number;
  };
  feedback: {
    total: number;
    positive: number;
    negative: number;
    averageRating: number;
  };
  liveSessions: {
    scheduled: number;
    completed: number;
  };
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      // Fetch all stats in parallel
      const [
        profilesRes,
        sleepStoriesRes,
        novenasRes,
        lessonsRes,
        oracionesRes,
        coursesRes,
        moviesRes,
        processingJobsRes,
        feedbackRes,
        liveSessionsRes,
        userStatsRes
      ] = await Promise.all([
        supabase.from('profiles').select('id, created_at', { count: 'exact' }),
        supabase.from('sleep_stories').select('id, audio_url'),
        supabase.from('novenas').select('id, imagen_url'),
        supabase.from('library_lessons').select('id, contenido_enriquecido'),
        supabase.from('oraciones').select('id, audio_url'),
        supabase.from('courses').select('id, publicado'),
        supabase.from('movies').select('id, publicada'),
        supabase.from('processing_jobs').select('id, status'),
        supabase.from('content_feedback').select('id, rating'),
        supabase.from('live_sessions').select('id, estado'),
        supabase.from('user_stats').select('id, ultima_actividad')
      ]);

      // Calculate this week's new users
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeekUsers = profilesRes.data?.filter(p => 
        new Date(p.created_at) > oneWeekAgo
      ).length || 0;

      // Calculate active users (activity in last 7 days)
      const activeUsers = userStatsRes.data?.filter(s => 
        s.ultima_actividad && new Date(s.ultima_actividad) > oneWeekAgo
      ).length || 0;

      // Calculate feedback stats
      const feedbackData = feedbackRes.data || [];
      const positiveCount = feedbackData.filter(f => f.rating === 5).length;
      const negativeCount = feedbackData.filter(f => f.rating === 1).length;
      const avgRating = feedbackData.length > 0 
        ? feedbackData.reduce((acc, f) => acc + f.rating, 0) / feedbackData.length 
        : 0;

      // Calculate processing stats
      const jobs = processingJobsRes.data || [];
      const processingStats = {
        pending: jobs.filter(j => j.status === 'pending').length,
        completed: jobs.filter(j => j.status === 'completed').length,
        errors: jobs.filter(j => j.status === 'error').length,
        processing: jobs.filter(j => j.status === 'processing').length
      };

      // Live sessions stats
      const sessions = liveSessionsRes.data || [];
      const liveSessionStats = {
        scheduled: sessions.filter(s => s.estado === 'scheduled').length,
        completed: sessions.filter(s => s.estado === 'ended').length
      };

      setStats({
        users: {
          total: profilesRes.count || 0,
          thisWeek: thisWeekUsers,
          active: activeUsers
        },
        content: {
          sleepStories: {
            total: sleepStoriesRes.data?.length || 0,
            withAudio: sleepStoriesRes.data?.filter(s => s.audio_url).length || 0
          },
          novenas: {
            total: novenasRes.data?.length || 0,
            withImages: novenasRes.data?.filter(n => n.imagen_url).length || 0
          },
          lessons: {
            total: lessonsRes.data?.length || 0,
            enriched: lessonsRes.data?.filter(l => l.contenido_enriquecido).length || 0
          },
          oraciones: {
            total: oracionesRes.data?.length || 0,
            withAudio: oracionesRes.data?.filter(o => o.audio_url).length || 0
          },
          courses: {
            total: coursesRes.data?.length || 0,
            published: coursesRes.data?.filter(c => c.publicado).length || 0
          },
          movies: {
            total: moviesRes.data?.length || 0,
            published: moviesRes.data?.filter(m => m.publicada).length || 0
          }
        },
        processing: processingStats,
        feedback: {
          total: feedbackData.length,
          positive: positiveCount,
          negative: negativeCount,
          averageRating: Math.round(avgRating * 10) / 10
        },
        liveSessions: liveSessionStats
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
};
