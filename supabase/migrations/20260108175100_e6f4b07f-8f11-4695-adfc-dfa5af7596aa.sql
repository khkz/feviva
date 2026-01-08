-- =============================================
-- FASE 1: CORRECCIONES DE SEGURIDAD CRÍTICAS
-- =============================================

-- 1. Eliminar políticas permisivas de processing_jobs
DROP POLICY IF EXISTS "Anyone can view processing jobs" ON processing_jobs;
DROP POLICY IF EXISTS "Anyone can insert processing jobs" ON processing_jobs;
DROP POLICY IF EXISTS "Anyone can update processing jobs" ON processing_jobs;
DROP POLICY IF EXISTS "Anyone can delete processing jobs" ON processing_jobs;

-- 2. Eliminar políticas permisivas de processing_logs
DROP POLICY IF EXISTS "Anyone can view processing logs" ON processing_logs;
DROP POLICY IF EXISTS "Anyone can insert processing logs" ON processing_logs;

-- 3. Crear políticas restringidas para processing_jobs (solo admins)
CREATE POLICY "Admins can view processing jobs"
ON processing_jobs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert processing jobs"
ON processing_jobs FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update processing jobs"
ON processing_jobs FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete processing jobs"
ON processing_jobs FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Crear políticas restringidas para processing_logs (solo admins)
CREATE POLICY "Admins can view processing logs"
ON processing_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert processing logs"
ON processing_logs FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Reforzar profiles - agregar política de INSERT
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 6. Asegurar que solo usuarios ven sus propios datos espirituales
-- prayer_journal
DROP POLICY IF EXISTS "Users can view their own prayers" ON prayer_journal;
CREATE POLICY "Users can view their own prayers"
ON prayer_journal FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- gratitude_entries  
DROP POLICY IF EXISTS "Users can view their own gratitude" ON gratitude_entries;
CREATE POLICY "Users can view their own gratitude"
ON gratitude_entries FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- user_rituals
DROP POLICY IF EXISTS "Users can view their own rituals" ON user_rituals;
CREATE POLICY "Users can view their own rituals"
ON user_rituals FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- =============================================
-- ÍNDICES DE RENDIMIENTO
-- =============================================

-- Índice para búsquedas frecuentes de user_stats
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id 
ON user_stats(user_id);

-- Índice para user_rituals por fecha y usuario
CREATE INDEX IF NOT EXISTS idx_user_rituals_user_fecha 
ON user_rituals(user_id, fecha);

-- Índice para content_feedback sin leer
CREATE INDEX IF NOT EXISTS idx_feedback_unread 
ON content_feedback(leido) WHERE leido = false;

-- Índice para novenas ordenadas
CREATE INDEX IF NOT EXISTS idx_novenas_orden 
ON novenas(orden);

-- Índice para library_lessons por categoría
CREATE INDEX IF NOT EXISTS idx_lessons_categoria 
ON library_lessons(categoria, orden);

-- Índice para daily_content por fecha
CREATE INDEX IF NOT EXISTS idx_daily_content_fecha 
ON daily_content(fecha DESC);