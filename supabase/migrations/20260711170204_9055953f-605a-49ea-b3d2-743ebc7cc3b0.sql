
-- 1) Reprogramar crons con X-Admin-Api-Key (usando el mismo valor guardado en el secreto CRON_ADMIN_KEY)
SELECT cron.unschedule('bible-plan-auto-generate');
SELECT cron.unschedule('generate-daily-content-midnight');
SELECT cron.unschedule('generate-daily-images-midnight');

SELECT cron.schedule(
  'bible-plan-auto-generate',
  '0 * * * *',
  $$SELECT net.http_post(
      url:='https://duggdnqpemwojkojfyei.supabase.co/functions/v1/process-jobs',
      headers:=jsonb_build_object(
        'Content-Type','application/json',
        'X-Admin-Api-Key','44e444911ce8428287e8f9d8a0105fd70d6b4b1812884d89ab6a2199541f755f'
      ),
      body:='{"jobType":"bible_day","limit":5}'::jsonb
  );$$
);

SELECT cron.schedule(
  'generate-daily-content-midnight',
  '5 0 * * *',
  $$SELECT net.http_post(
      url:='https://duggdnqpemwojkojfyei.supabase.co/functions/v1/generate-daily-content',
      headers:=jsonb_build_object(
        'Content-Type','application/json',
        'X-Admin-Api-Key','44e444911ce8428287e8f9d8a0105fd70d6b4b1812884d89ab6a2199541f755f'
      ),
      body:='{}'::jsonb
  );$$
);

SELECT cron.schedule(
  'generate-daily-images-midnight',
  '30 0 * * *',
  $$SELECT net.http_post(
      url:='https://duggdnqpemwojkojfyei.supabase.co/functions/v1/generate-daily-images',
      headers:=jsonb_build_object(
        'Content-Type','application/json',
        'X-Admin-Api-Key','44e444911ce8428287e8f9d8a0105fd70d6b4b1812884d89ab6a2199541f755f'
      ),
      body:='{"force":false}'::jsonb
  );$$
);

-- 2) Reescribir tick_process_jobs para usar X-Admin-Api-Key
CREATE OR REPLACE FUNCTION public.tick_process_jobs()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_pending int;
BEGIN
  IF NOT pg_try_advisory_lock(hashtext('tick_process_jobs')) THEN
    RETURN;
  END IF;

  BEGIN
    UPDATE public.processing_jobs
    SET status = 'pending',
        error_message = 'Auto-liberado por cron: atascado >5min',
        started_at = NULL
    WHERE status = 'processing'
      AND started_at < now() - interval '5 minutes';

    SELECT COUNT(*) INTO v_pending
    FROM public.processing_jobs
    WHERE status = 'pending';

    IF v_pending = 0 THEN
      PERFORM pg_advisory_unlock(hashtext('tick_process_jobs'));
      RETURN;
    END IF;

    PERFORM net.http_post(
      url := 'https://duggdnqpemwojkojfyei.supabase.co/functions/v1/process-jobs',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'X-Admin-Api-Key', '44e444911ce8428287e8f9d8a0105fd70d6b4b1812884d89ab6a2199541f755f'
      ),
      body := jsonb_build_object('source','pg_cron','ts', now())
    );

    PERFORM pg_advisory_unlock(hashtext('tick_process_jobs'));
  EXCEPTION WHEN OTHERS THEN
    PERFORM pg_advisory_unlock(hashtext('tick_process_jobs'));
    RAISE;
  END;
END;
$function$;

-- 3) RLS de user_referral_codes: cada usuario ve solo su propio código
DROP POLICY IF EXISTS "Users can view all referral codes" ON public.user_referral_codes;
DROP POLICY IF EXISTS "Users can view referral codes" ON public.user_referral_codes;
DROP POLICY IF EXISTS "Anyone can view referral codes" ON public.user_referral_codes;
DROP POLICY IF EXISTS "Public read referral codes" ON public.user_referral_codes;
DROP POLICY IF EXISTS "Users view own referral code" ON public.user_referral_codes;

CREATE POLICY "Users view own referral code"
ON public.user_referral_codes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4) RPC seguro para buscar por código (usado por process_referral y por el frontend al canjear)
CREATE OR REPLACE FUNCTION public.get_user_id_by_referral_code(p_code text)
 RETURNS uuid
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT user_id FROM public.user_referral_codes WHERE code = UPPER(p_code) LIMIT 1;
$function$;

-- 5) REVOKE EXECUTE en funciones SECURITY DEFINER para anon y authenticated
--    (solo pueden ser llamadas por service_role o desde otras funciones SECURITY DEFINER)
REVOKE EXECUTE ON FUNCTION public.tick_process_jobs() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.get_user_id_by_referral_code(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.process_referral(uuid, varchar) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_processing_stats(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.check_feedback_alerts() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_saints_needing_bio(integer) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_user_stats_updated_at() FROM anon, authenticated, public;

-- Mantener execute solo para authenticated donde tiene sentido
GRANT EXECUTE ON FUNCTION public.get_user_id_by_referral_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_referral(uuid, varchar) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_referral_code(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_gift_invitation(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_gift_invitation_by_code(text) TO anon, authenticated;
