-- Allow admins to view all user stats
CREATE POLICY "Admins can view all user stats"
ON public.user_stats
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all debates
CREATE POLICY "Admins can view all debates"
ON public.debates
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all user bible progress
CREATE POLICY "Admins can view all bible progress"
ON public.user_bible_progress
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all user rosario progress
CREATE POLICY "Admins can view all rosario progress"
ON public.user_rosario_progress
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all user novena progress
CREATE POLICY "Admins can view all novena progress"
ON public.user_novena_progress
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all user sleep history
CREATE POLICY "Admins can view all sleep history"
ON public.user_sleep_history
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all content feedback
CREATE POLICY "Admins can view all content feedback"
ON public.content_feedback
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all gratitude entries
CREATE POLICY "Admins can view all gratitude entries"
ON public.gratitude_entries
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));