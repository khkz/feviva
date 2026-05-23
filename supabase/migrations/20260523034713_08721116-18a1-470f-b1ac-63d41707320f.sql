
-- 1. GIFT INVITATIONS: remove public SELECT, add secure RPC lookup + accept
DROP POLICY IF EXISTS "Anyone can view invitation by code" ON public.gift_invitations;

CREATE POLICY "Senders can view their invitations"
ON public.gift_invitations
FOR SELECT
TO authenticated
USING (auth.uid() = sender_id);

CREATE OR REPLACE FUNCTION public.get_gift_invitation_by_code(p_code text)
RETURNS TABLE(recipient_name text, sender_name text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT gi.recipient_name, p.nombre
  FROM public.gift_invitations gi
  LEFT JOIN public.profiles p ON p.id = gi.sender_id
  WHERE gi.invite_code = p_code
    AND gi.status = 'sent'
  LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_gift_invitation(p_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated INT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  UPDATE public.gift_invitations
  SET status = 'accepted', accepted_at = now()
  WHERE invite_code = p_code AND status = 'sent';
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.get_gift_invitation_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_gift_invitation_by_code(text) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.accept_gift_invitation(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_gift_invitation(text) TO authenticated;

-- 2. USER ACHIEVEMENTS: validate thresholds server-side
DROP POLICY IF EXISTS "Users can insert their own achievements" ON public.user_achievements;

CREATE POLICY "Users can claim earned achievements"
ON public.user_achievements
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.achievements a
    LEFT JOIN public.user_stats us ON us.user_id = auth.uid()
    WHERE a.id = user_achievements.achievement_id
      AND (a.puntos_requeridos    IS NULL OR COALESCE(us.puntos_totales, 0)        >= a.puntos_requeridos)
      AND (a.debates_requeridos   IS NULL OR COALESCE(us.debates_completados, 0)   >= a.debates_requeridos)
      AND (a.lecciones_requeridas IS NULL OR COALESCE(us.lecciones_completadas, 0) >= a.lecciones_requeridas)
      AND (a.racha_requerida      IS NULL OR COALESCE(us.racha_actual_dias, 0)     >= a.racha_requerida)
  )
);

-- 3. REALTIME: remove processing_jobs from public broadcast (admin-only data)
ALTER PUBLICATION supabase_realtime DROP TABLE public.processing_jobs;

-- 4. STORAGE: novena-images uploads restricted to admins
DROP POLICY IF EXISTS "Authenticated users can upload novena images" ON storage.objects;
CREATE POLICY "Admins can upload novena images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'novena-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- 5. STORAGE: drop permissive teachings-audio insert (service role bypasses RLS)
DROP POLICY IF EXISTS "Service can upload audio" ON storage.objects;

-- 6. Revoke execute on internal/trigger SECURITY DEFINER functions from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.handle_new_user()                  FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_user_stats_updated_at()     FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code()           FROM anon, authenticated;
