-- Create table for feedback alerts configuration and history
CREATE TABLE public.feedback_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL,
  threshold_percentage INTEGER NOT NULL DEFAULT 30,
  time_window_hours INTEGER NOT NULL DEFAULT 24,
  min_feedback_count INTEGER NOT NULL DEFAULT 5,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for alert history
CREATE TABLE public.feedback_alert_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_config_id UUID REFERENCES public.feedback_alerts(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  negative_count INTEGER NOT NULL,
  total_count INTEGER NOT NULL,
  negative_percentage NUMERIC(5,2) NOT NULL,
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID,
  details JSONB
);

-- Enable RLS
ALTER TABLE public.feedback_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_alert_history ENABLE ROW LEVEL SECURITY;

-- Only admins can manage alerts
CREATE POLICY "Admins can manage feedback alerts" 
ON public.feedback_alerts 
FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view alert history" 
ON public.feedback_alert_history 
FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default alert configurations
INSERT INTO public.feedback_alerts (content_type, threshold_percentage, time_window_hours, min_feedback_count)
VALUES 
  ('sleep_story', 30, 24, 5),
  ('novena', 30, 24, 5),
  ('lesson', 30, 24, 5);

-- Create function to check feedback alerts
CREATE OR REPLACE FUNCTION public.check_feedback_alerts()
RETURNS TABLE(
  config_id UUID,
  content_type TEXT,
  negative_count BIGINT,
  total_count BIGINT,
  negative_percentage NUMERIC,
  threshold_exceeded BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fa.id as config_id,
    fa.content_type,
    COUNT(*) FILTER (WHERE cf.rating < 3)::BIGINT as negative_count,
    COUNT(*)::BIGINT as total_count,
    ROUND((COUNT(*) FILTER (WHERE cf.rating < 3)::NUMERIC / NULLIF(COUNT(*), 0) * 100), 2) as negative_percentage,
    (COUNT(*) >= fa.min_feedback_count AND 
     ROUND((COUNT(*) FILTER (WHERE cf.rating < 3)::NUMERIC / NULLIF(COUNT(*), 0) * 100), 2) >= fa.threshold_percentage) as threshold_exceeded
  FROM public.feedback_alerts fa
  LEFT JOIN public.content_feedback cf 
    ON cf.content_type = fa.content_type 
    AND cf.created_at >= now() - (fa.time_window_hours || ' hours')::INTERVAL
  WHERE fa.enabled = true
  GROUP BY fa.id, fa.content_type, fa.threshold_percentage, fa.min_feedback_count;
END;
$$;