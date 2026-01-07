-- Política para insertar processing jobs (cualquier usuario autenticado o service role)
CREATE POLICY "Anyone can insert processing jobs"
ON public.processing_jobs
FOR INSERT
WITH CHECK (true);

-- Política para actualizar processing jobs (para el service role en edge functions)
CREATE POLICY "Anyone can update processing jobs"
ON public.processing_jobs
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Política para eliminar processing jobs completados
CREATE POLICY "Anyone can delete processing jobs"
ON public.processing_jobs
FOR DELETE
USING (true);