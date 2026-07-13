
-- 1) Bloquear cualquier acceso directo de anon a la tabla (defensa en profundidad)
REVOKE ALL ON public.gift_invitations FROM anon, PUBLIC;

-- 2) Policy restrictiva explícita: incluso si en el futuro alguien añade un GRANT, anon nunca podrá leer/escribir
DROP POLICY IF EXISTS "Block anon direct access to gift_invitations" ON public.gift_invitations;
CREATE POLICY "Block anon direct access to gift_invitations"
  ON public.gift_invitations
  AS RESTRICTIVE
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);
