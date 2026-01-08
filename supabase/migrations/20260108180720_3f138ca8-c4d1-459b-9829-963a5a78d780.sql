-- Create daily_gospel table for liturgical daily Gospel videos
CREATE TABLE public.daily_gospel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL UNIQUE,
  referencia TEXT NOT NULL,
  youtube_video_id TEXT NOT NULL,
  titulo TEXT,
  sacerdote TEXT DEFAULT 'P. Luis Zazano',
  tiempo_liturgico TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast date lookups
CREATE INDEX idx_daily_gospel_fecha ON public.daily_gospel(fecha DESC);

-- Enable RLS
ALTER TABLE public.daily_gospel ENABLE ROW LEVEL SECURITY;

-- Anyone can view gospels (public content)
CREATE POLICY "Anyone can view gospels"
ON public.daily_gospel FOR SELECT
USING (true);

-- Only admins can manage gospels
CREATE POLICY "Admins can manage gospels"
ON public.daily_gospel FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_daily_gospel_updated_at
BEFORE UPDATE ON public.daily_gospel
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();