-- Create a public bucket for ambient audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('ambient-audio', 'ambient-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to ambient audio files
CREATE POLICY "Public can read ambient audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'ambient-audio');

-- Allow authenticated users to upload (for admin purposes)
CREATE POLICY "Admins can upload ambient audio"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ambient-audio' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to delete ambient audio
CREATE POLICY "Admins can delete ambient audio"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ambient-audio'
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);