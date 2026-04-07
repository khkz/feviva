
-- Create daily capsules table
CREATE TABLE public.daily_capsules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL UNIQUE,
  dato_impactante TEXT NOT NULL,
  reflexion TEXT NOT NULL,
  fuente TEXT,
  categoria TEXT NOT NULL DEFAULT 'tech_vs_fe',
  emoji_icon TEXT NOT NULL DEFAULT '⚡',
  color_accent TEXT NOT NULL DEFAULT '#F59E0B',
  share_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_capsules ENABLE ROW LEVEL SECURITY;

-- Public read access (no auth needed)
CREATE POLICY "Anyone can read capsules"
ON public.daily_capsules
FOR SELECT
TO anon, authenticated
USING (true);

-- Admin write access
CREATE POLICY "Admins can insert capsules"
ON public.daily_capsules
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update capsules"
ON public.daily_capsules
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete capsules"
ON public.daily_capsules
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Index for date lookups
CREATE INDEX idx_daily_capsules_fecha ON public.daily_capsules(fecha DESC);
