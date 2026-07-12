ALTER TABLE public.calendar_saints
  ADD COLUMN IF NOT EXISTS discrepancia_detalle jsonb,
  ADD COLUMN IF NOT EXISTS fuente_url text,
  ADD COLUMN IF NOT EXISTS verificado_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_calendar_saints_estado_verificacion ON public.calendar_saints(estado_verificacion);