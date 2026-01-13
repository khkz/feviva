-- Add column to track biography source
ALTER TABLE public.calendar_saints 
ADD COLUMN IF NOT EXISTS description_source TEXT DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.calendar_saints.description_source IS 'Source of biography: wikipedia_es, wikipedia_en, ai_generated, manual';