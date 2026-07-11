
-- ============================================================
-- FIX 1: user_referral_codes — cerrar SELECT abierto a todos
-- Los authenticated ya no pueden listar códigos; el lookup
-- por código sigue disponible vía RPC SECURITY DEFINER
-- (get_user_id_by_referral_code) que expone solo el user_id.
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can lookup referral codes" ON public.user_referral_codes;

-- ============================================================
-- FIX 2: usage_quotas — políticas explícitas de escritura
-- Los usuarios solo pueden crear/actualizar SU propia cuota.
-- El service_role (edge functions) sigue con acceso total.
-- ============================================================
CREATE POLICY "Users can insert their own quotas"
  ON public.usage_quotas
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quotas"
  ON public.usage_quotas
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- FIX 3 & 4: SECURITY DEFINER funciones internas — revocar
-- EXECUTE a anon/authenticated. Solo el service_role las llama.
-- Las que deben seguir siendo RPCs públicas para logged-in
-- users NO se tocan: accept_gift_invitation, get_gift_invitation_by_code,
-- get_or_create_referral_code, get_user_id_by_referral_code,
-- process_referral, has_role (usada dentro de RLS: la ejecución
-- ocurre en el contexto SQL, no necesita GRANT para anon).
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_feedback_alerts() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tick_process_jobs() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_user_stats_updated_at() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_processing_stats(text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, PUBLIC;
-- has_role sigue disponible para authenticated porque algunos hooks del
-- cliente pueden validar rol, y las RLS policies la invocan implícitamente.
