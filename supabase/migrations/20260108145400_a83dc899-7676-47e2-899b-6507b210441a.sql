-- Add columns for tracking regeneration and backup
ALTER TABLE public.gratitude_sessions 
ADD COLUMN IF NOT EXISTS regenerated_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE public.gratitude_sessions 
ADD COLUMN IF NOT EXISTS descripcion_original TEXT DEFAULT NULL;