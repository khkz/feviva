-- Add updated_at column to calendar_saints if not exists
ALTER TABLE public.calendar_saints 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add updated_at column to oraciones if not exists  
ALTER TABLE public.oraciones 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for calendar_saints
DROP TRIGGER IF EXISTS update_calendar_saints_updated_at ON public.calendar_saints;
CREATE TRIGGER update_calendar_saints_updated_at
    BEFORE UPDATE ON public.calendar_saints
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_timestamp();

-- Create trigger for oraciones
DROP TRIGGER IF EXISTS update_oraciones_updated_at ON public.oraciones;
CREATE TRIGGER update_oraciones_updated_at
    BEFORE UPDATE ON public.oraciones
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_timestamp();

-- Initialize updated_at for existing rows that don't have it set
UPDATE public.calendar_saints SET updated_at = created_at WHERE updated_at IS NULL;
UPDATE public.oraciones SET updated_at = created_at WHERE updated_at IS NULL;