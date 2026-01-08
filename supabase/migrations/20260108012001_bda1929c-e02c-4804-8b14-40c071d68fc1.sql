-- Add new audio columns for all daily content sections
ALTER TABLE public.daily_content 
ADD COLUMN IF NOT EXISTS audio_reflexion_url text,
ADD COLUMN IF NOT EXISTS audio_laudes_url text,
ADD COLUMN IF NOT EXISTS audio_completas_url text,
ADD COLUMN IF NOT EXISTS audio_tip_url text;