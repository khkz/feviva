-- Add new columns to bible_reading_plan table
ALTER TABLE public.bible_reading_plan 
ADD COLUMN IF NOT EXISTS periodo VARCHAR(50),
ADD COLUMN IF NOT EXISTS color_periodo VARCHAR(20),
ADD COLUMN IF NOT EXISTS lectura_1 VARCHAR(150),
ADD COLUMN IF NOT EXISTS lectura_2 VARCHAR(150),
ADD COLUMN IF NOT EXISTS lectura_3 VARCHAR(150),
ADD COLUMN IF NOT EXISTS youtube_video_id VARCHAR(20),
ADD COLUMN IF NOT EXISTS es_libro_narrativo BOOLEAN DEFAULT false;

-- Create table for caching bible text from API
CREATE TABLE IF NOT EXISTS public.bible_text_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  libro VARCHAR(50) NOT NULL,
  capitulo INTEGER NOT NULL,
  texto TEXT NOT NULL,
  traduccion VARCHAR(20) DEFAULT 'rvr',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(libro, capitulo, traduccion)
);

-- Enable RLS on bible_text_cache
ALTER TABLE public.bible_text_cache ENABLE ROW LEVEL SECURITY;

-- Anyone can read cached bible text
CREATE POLICY "Anyone can view cached bible text"
ON public.bible_text_cache
FOR SELECT
USING (true);

-- Create table for user notes on bible readings
CREATE TABLE IF NOT EXISTS public.bible_plan_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  dia INTEGER NOT NULL,
  nota TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, dia)
);

-- Enable RLS on bible_plan_notes
ALTER TABLE public.bible_plan_notes ENABLE ROW LEVEL SECURITY;

-- Users can manage their own notes
CREATE POLICY "Users can view their own notes"
ON public.bible_plan_notes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
ON public.bible_plan_notes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
ON public.bible_plan_notes
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
ON public.bible_plan_notes
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bible_text_cache_lookup ON public.bible_text_cache(libro, capitulo, traduccion);
CREATE INDEX IF NOT EXISTS idx_bible_plan_notes_user_dia ON public.bible_plan_notes(user_id, dia);