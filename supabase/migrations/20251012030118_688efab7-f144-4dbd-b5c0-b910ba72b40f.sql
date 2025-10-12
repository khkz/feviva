-- Create library_lessons table
CREATE TABLE public.library_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  contenido TEXT NOT NULL,
  nivel INTEGER NOT NULL CHECK (nivel >= 1 AND nivel <= 4),
  categoria TEXT NOT NULL,
  recursos JSONB DEFAULT '[]'::jsonb,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_lesson_progress table
CREATE TABLE public.user_lesson_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.library_lessons(id) ON DELETE CASCADE,
  completado BOOLEAN DEFAULT false,
  fecha_completado TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.library_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for library_lessons
CREATE POLICY "Anyone can view lessons"
ON public.library_lessons
FOR SELECT
TO authenticated
USING (true);

-- RLS Policies for user_lesson_progress
CREATE POLICY "Users can view their own progress"
ON public.user_lesson_progress
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
ON public.user_lesson_progress
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.user_lesson_progress
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);