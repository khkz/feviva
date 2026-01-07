-- Create storage bucket for sleep story images
INSERT INTO storage.buckets (id, name, public)
VALUES ('sleep-images', 'sleep-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to sleep images
CREATE POLICY "Sleep images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'sleep-images');

-- Allow service role to upload sleep images
CREATE POLICY "Service role can upload sleep images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'sleep-images');

-- Allow service role to update sleep images
CREATE POLICY "Service role can update sleep images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'sleep-images');

-- Allow service role to delete sleep images
CREATE POLICY "Service role can delete sleep images"
ON storage.objects FOR DELETE
USING (bucket_id = 'sleep-images');