-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create gratitude_sessions table for the 255 spiritual reflections
CREATE TABLE public.gratitude_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero INTEGER NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  duracion_min INTEGER DEFAULT 4,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS with public read access
ALTER TABLE public.gratitude_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gratitude sessions"
ON public.gratitude_sessions
FOR SELECT
USING (true);

-- Create user_gratitude_progress table to track user's current session
CREATE TABLE public.user_gratitude_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  sesion_actual INTEGER DEFAULT 1,
  sesiones_completadas INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_gratitude_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own gratitude progress"
ON public.user_gratitude_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gratitude progress"
ON public.user_gratitude_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gratitude progress"
ON public.user_gratitude_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_gratitude_progress_updated_at
BEFORE UPDATE ON public.user_gratitude_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();