-- Create user_playlists table for persistent audio routines
CREATE TABLE public.user_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  nombre TEXT NOT NULL DEFAULT 'Mi Rutina Diaria',
  tipo TEXT NOT NULL DEFAULT 'daily',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_playlists ENABLE ROW LEVEL SECURITY;

-- Users can view their own playlists
CREATE POLICY "Users can view their own playlists"
ON public.user_playlists
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own playlists
CREATE POLICY "Users can insert their own playlists"
ON public.user_playlists
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own playlists
CREATE POLICY "Users can update their own playlists"
ON public.user_playlists
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own playlists
CREATE POLICY "Users can delete their own playlists"
ON public.user_playlists
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_playlists_updated_at
BEFORE UPDATE ON public.user_playlists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create unique constraint for one daily playlist per user
CREATE UNIQUE INDEX idx_user_daily_playlist ON public.user_playlists (user_id, tipo) WHERE tipo = 'daily';