-- Drop overly permissive policies and recreate with proper restrictions
DROP POLICY IF EXISTS "Service role can upload sleep images" ON storage.objects;
DROP POLICY IF EXISTS "Service role can update sleep images" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete sleep images" ON storage.objects;

-- These operations are only done via edge functions with service role key
-- No additional policies needed for INSERT/UPDATE/DELETE as service role bypasses RLS