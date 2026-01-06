-- Add new columns for enriched content and audio to library_lessons
ALTER TABLE public.library_lessons 
ADD COLUMN IF NOT EXISTS contenido_enriquecido TEXT,
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS duracion_estimada INTEGER DEFAULT 5;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_library_lessons_categoria ON public.library_lessons(categoria);
CREATE INDEX IF NOT EXISTS idx_library_lessons_nivel ON public.library_lessons(nivel);