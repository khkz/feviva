
-- === 1) STORAGE: saint-images ===
DROP POLICY IF EXISTS "Service role write access for saint images"  ON storage.objects;
DROP POLICY IF EXISTS "Service role update access for saint images" ON storage.objects;
DROP POLICY IF EXISTS "Service role delete access for saint images" ON storage.objects;

CREATE POLICY "saint_images_service_insert"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'saint-images' AND auth.role() = 'service_role');

CREATE POLICY "saint_images_service_update"
  ON storage.objects
  FOR UPDATE
  TO public
  USING (bucket_id = 'saint-images' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'saint-images' AND auth.role() = 'service_role');

CREATE POLICY "saint_images_service_delete"
  ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'saint-images' AND auth.role() = 'service_role');

-- === 2) STORAGE: daily-share-images ===
DROP POLICY IF EXISTS "Service role can upload daily share images" ON storage.objects;

CREATE POLICY "daily_share_images_service_insert"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'daily-share-images' AND auth.role() = 'service_role');

-- === 3) get_or_create_referral_code: fix IDOR + revoke anon ===
CREATE OR REPLACE FUNCTION public.get_or_create_referral_code(p_user_id uuid)
RETURNS varchar
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  existing_code varchar(12);
  new_code varchar(12);
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  -- Ignoramos p_user_id: siempre usamos el uid del llamador para evitar IDOR.
  -- (El parámetro se mantiene por compatibilidad con el cliente.)
  IF p_user_id IS NOT NULL AND p_user_id <> v_uid THEN
    RAISE EXCEPTION 'Forbidden: cannot access another user''s referral code' USING ERRCODE = '42501';
  END IF;

  SELECT code INTO existing_code
  FROM public.user_referral_codes
  WHERE user_id = v_uid;

  IF existing_code IS NOT NULL THEN
    RETURN existing_code;
  END IF;

  new_code := generate_referral_code();

  INSERT INTO public.user_referral_codes (user_id, code)
  VALUES (v_uid, new_code);

  RETURN new_code;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_or_create_referral_code(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_or_create_referral_code(uuid) TO authenticated;
