-- Add verification columns to library_lessons
ALTER TABLE public.library_lessons 
ADD COLUMN IF NOT EXISTS estado_verificacion text NOT NULL DEFAULT 'sin_verificar',
ADD COLUMN IF NOT EXISTS verificado_por uuid,
ADD COLUMN IF NOT EXISTS contenido_enriquecido_hash text;

-- Add verification columns to calendar_saints
ALTER TABLE public.calendar_saints
ADD COLUMN IF NOT EXISTS estado_verificacion text NOT NULL DEFAULT 'sin_verificar',
ADD COLUMN IF NOT EXISTS verificado_por uuid,
ADD COLUMN IF NOT EXISTS fuente_descripcion text DEFAULT 'ia_generada';

-- Allow admins to update library_lessons
CREATE POLICY "Admins can update lessons"
ON public.library_lessons
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update calendar_saints verification (already has ALL policy, but explicit is clearer)
-- No new policy needed for calendar_saints since "Admins can manage saints" ALL policy exists

-- Create index for verification status filtering
CREATE INDEX IF NOT EXISTS idx_lessons_verificacion ON public.library_lessons(estado_verificacion);
CREATE INDEX IF NOT EXISTS idx_saints_verificacion ON public.calendar_saints(estado_verificacion);