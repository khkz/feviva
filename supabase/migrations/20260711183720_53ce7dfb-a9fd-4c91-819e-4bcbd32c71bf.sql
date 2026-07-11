
-- 1) Función server-side para validar suscripción activa
CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscribers s
    WHERE s.user_id = _user_id
      AND s.subscribed = true
      AND (s.subscription_end IS NULL OR s.subscription_end > now())
  );
$$;

REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid) TO authenticated, service_role;

-- 2) Endurecer subscribers: solo service_role escribe (webhook Stripe).
--    Mantiene la política existente de SELECT del propio usuario.
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

REVOKE INSERT, UPDATE, DELETE ON public.subscribers FROM authenticated, anon;
GRANT SELECT ON public.subscribers TO authenticated;
GRANT ALL ON public.subscribers TO service_role;
