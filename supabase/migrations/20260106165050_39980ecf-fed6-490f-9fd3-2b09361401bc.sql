-- Tabla principal de jobs de procesamiento
CREATE TABLE public.processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id UUID NOT NULL,
  target_title TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  error_message TEXT,
  result_data JSONB,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  CONSTRAINT processing_jobs_status_check CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  CONSTRAINT processing_jobs_unique_job UNIQUE (job_type, target_id)
);

-- Tabla de logs detallados de cada intento
CREATE TABLE public.processing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.processing_jobs(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT processing_logs_status_check CHECK (status IN ('started', 'success', 'error'))
);

-- Índices para consultas eficientes
CREATE INDEX idx_processing_jobs_status ON public.processing_jobs(status);
CREATE INDEX idx_processing_jobs_job_type ON public.processing_jobs(job_type);
CREATE INDEX idx_processing_jobs_created_at ON public.processing_jobs(created_at DESC);
CREATE INDEX idx_processing_logs_job_id ON public.processing_logs(job_id);

-- Habilitar RLS
ALTER TABLE public.processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Cualquiera puede ver los jobs y logs (son datos de sistema)
CREATE POLICY "Anyone can view processing jobs"
  ON public.processing_jobs FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view processing logs"
  ON public.processing_logs FOR SELECT
  USING (true);

-- Habilitar realtime para actualizaciones en vivo
ALTER PUBLICATION supabase_realtime ADD TABLE public.processing_jobs;

-- Función para obtener estadísticas de procesamiento
CREATE OR REPLACE FUNCTION public.get_processing_stats(p_job_type TEXT DEFAULT NULL)
RETURNS TABLE (
  job_type TEXT,
  total_jobs BIGINT,
  pending_jobs BIGINT,
  processing_jobs BIGINT,
  completed_jobs BIGINT,
  error_jobs BIGINT,
  avg_processing_time_ms NUMERIC,
  success_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pj.job_type,
    COUNT(*)::BIGINT as total_jobs,
    COUNT(*) FILTER (WHERE pj.status = 'pending')::BIGINT as pending_jobs,
    COUNT(*) FILTER (WHERE pj.status = 'processing')::BIGINT as processing_jobs,
    COUNT(*) FILTER (WHERE pj.status = 'completed')::BIGINT as completed_jobs,
    COUNT(*) FILTER (WHERE pj.status = 'error')::BIGINT as error_jobs,
    ROUND(AVG(pj.processing_time_ms) FILTER (WHERE pj.status = 'completed'), 2) as avg_processing_time_ms,
    ROUND(
      (COUNT(*) FILTER (WHERE pj.status = 'completed')::NUMERIC / 
       NULLIF(COUNT(*) FILTER (WHERE pj.status IN ('completed', 'error')), 0) * 100), 2
    ) as success_rate
  FROM public.processing_jobs pj
  WHERE (p_job_type IS NULL OR pj.job_type = p_job_type)
  GROUP BY pj.job_type;
END;
$$;