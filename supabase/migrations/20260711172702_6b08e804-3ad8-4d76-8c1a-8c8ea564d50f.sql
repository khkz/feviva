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
        error_message = 'Auto-liberado por cron: atascado >30min',
        started_at = NULL
    WHERE status = 'processing'
      AND started_at < now() - interval '30 minutes';

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
      body := jsonb_build_object('source','pg_cron','ts', now()),
      timeout_milliseconds := 300000
    );

    PERFORM pg_advisory_unlock(hashtext('tick_process_jobs'));
  EXCEPTION WHEN OTHERS THEN
    PERFORM pg_advisory_unlock(hashtext('tick_process_jobs'));
    RAISE;
  END;
END;
$function$;