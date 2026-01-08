-- Add unique constraint for user_lesson_progress to enable proper upsert
ALTER TABLE public.user_lesson_progress
ADD CONSTRAINT user_lesson_progress_user_lesson_unique UNIQUE (user_id, lesson_id);

-- Update RLS policies to handle upsert properly
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_lesson_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_lesson_progress;

-- Recreate insert policy with proper WITH CHECK
CREATE POLICY "Users can insert their own progress" 
ON public.user_lesson_progress 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Recreate update policy with both USING and WITH CHECK
CREATE POLICY "Users can update their own progress" 
ON public.user_lesson_progress 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);