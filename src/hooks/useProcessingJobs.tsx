import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ProcessingJob {
  id: string;
  job_type: string;
  target_table: string;
  target_id: string;
  target_title: string | null;
  status: 'pending' | 'processing' | 'completed' | 'error';
  attempts: number;
  max_attempts: number;
  error_message: string | null;
  result_data: Record<string, unknown> | null;
  processing_time_ms: number | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface ProcessingStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  error: number;
  successRate: number | null;
  avgProcessingTime: number | null;
}

interface UseProcessingJobsOptions {
  jobType?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useProcessingJobs = (options: UseProcessingJobsOptions = {}) => {
  const { jobType, autoRefresh = true, refreshInterval = 5000 } = options;
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [stats, setStats] = useState<ProcessingStats>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    error: 0,
    successRate: null,
    avgProcessingTime: null,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchJobs = useCallback(async () => {
    try {
      let query = supabase
        .from('processing_jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (jobType) {
        query = query.eq('job_type', jobType);
      }

      const { data, error } = await query;

      if (error) throw error;

      const typedJobs = (data || []) as ProcessingJob[];
      setJobs(typedJobs);

      // Calcular estadísticas
      const newStats: ProcessingStats = {
        total: typedJobs.length,
        pending: typedJobs.filter(j => j.status === 'pending').length,
        processing: typedJobs.filter(j => j.status === 'processing').length,
        completed: typedJobs.filter(j => j.status === 'completed').length,
        error: typedJobs.filter(j => j.status === 'error').length,
        successRate: null,
        avgProcessingTime: null,
      };

      const finishedJobs = typedJobs.filter(j => j.status === 'completed' || j.status === 'error');
      if (finishedJobs.length > 0) {
        newStats.successRate = (newStats.completed / finishedJobs.length) * 100;
      }

      const completedWithTime = typedJobs.filter(j => j.status === 'completed' && j.processing_time_ms);
      if (completedWithTime.length > 0) {
        newStats.avgProcessingTime = completedWithTime.reduce((acc, j) => acc + (j.processing_time_ms || 0), 0) / completedWithTime.length;
      }

      setStats(newStats);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  }, [jobType]);

  // Encolar nuevos jobs
  const queueJobs = async (
    type: string, 
    items: { id: string; title?: string; table: string }[]
  ): Promise<number> => {
    try {
      const jobsToInsert = items.map(item => ({
        job_type: type,
        target_table: item.table,
        target_id: item.id,
        target_title: item.title || null,
        status: 'pending' as const,
      }));

      const { error } = await supabase
        .from('processing_jobs')
        .upsert(jobsToInsert, { 
          onConflict: 'job_type,target_id',
          ignoreDuplicates: true 
        });

      if (error) throw error;

      toast({
        title: "Jobs en cola",
        description: `${items.length} items añadidos a la cola de procesamiento`,
      });

      await fetchJobs();
      return items.length;
    } catch (error) {
      console.error("Error queuing jobs:", error);
      toast({
        title: "Error",
        description: "No se pudieron encolar los jobs",
        variant: "destructive",
      });
      return 0;
    }
  };

  // Reintentar jobs con error
  const retryFailed = async (): Promise<number> => {
    try {
      let query = supabase
        .from('processing_jobs')
        .update({ status: 'pending', error_message: null })
        .eq('status', 'error');

      if (jobType) {
        query = query.eq('job_type', jobType);
      }

      const { error, count } = await query;

      if (error) throw error;

      toast({
        title: "Jobs reintentados",
        description: `${count || 0} jobs marcados para reintento`,
      });

      await fetchJobs();
      return count || 0;
    } catch (error) {
      console.error("Error retrying jobs:", error);
      toast({
        title: "Error",
        description: "No se pudieron reintentar los jobs",
        variant: "destructive",
      });
      return 0;
    }
  };

  // Procesar todos los jobs pendientes (en background)
  const triggerProcessing = async (limit: number = 100): Promise<void> => {
    try {
      const response = await supabase.functions.invoke('process-jobs', {
        body: { job_type: jobType, limit },
      });

      if (response.error) throw response.error;

      const data = response.data;
      
      if (data.processed > 0) {
        toast({
          title: "Procesamiento en cola",
          description: `${data.processed} job(s) se procesarán en segundo plano`,
        });
      } else {
        toast({
          title: "Sin jobs pendientes",
          description: "No hay jobs pendientes para procesar",
        });
      }
      // No necesitamos fetchJobs() - realtime lo actualizará automáticamente
    } catch (error) {
      console.error("Error triggering processing:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el procesamiento",
        variant: "destructive",
      });
    }
  };

  // Limpiar jobs completados
  const clearCompleted = async (): Promise<number> => {
    try {
      let query = supabase
        .from('processing_jobs')
        .delete()
        .eq('status', 'completed');

      if (jobType) {
        query = query.eq('job_type', jobType);
      }

      const { error, count } = await query;

      if (error) throw error;

      toast({
        title: "Jobs limpiados",
        description: `${count || 0} jobs completados eliminados`,
      });

      await fetchJobs();
      return count || 0;
    } catch (error) {
      console.error("Error clearing jobs:", error);
      toast({
        title: "Error",
        description: "No se pudieron limpiar los jobs",
        variant: "destructive",
      });
      return 0;
    }
  };

  // Cargar jobs al montar
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Auto-refresh mientras hay jobs pendientes o procesando
  useEffect(() => {
    if (!autoRefresh) return;
    
    const hasActiveJobs = stats.pending > 0 || stats.processing > 0;
    if (!hasActiveJobs) return;

    const interval = setInterval(fetchJobs, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, stats.pending, stats.processing, fetchJobs]);

  // Suscripción realtime
  useEffect(() => {
    const channel = supabase
      .channel('processing-jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'processing_jobs',
          ...(jobType && { filter: `job_type=eq.${jobType}` }),
        },
        () => {
          fetchJobs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobType, fetchJobs]);

  return {
    jobs,
    stats,
    loading,
    queueJobs,
    retryFailed,
    triggerProcessing,
    clearCompleted,
    refetch: fetchJobs,
  };
};
