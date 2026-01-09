-- Create public bucket for saint images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('saint-images', 'saint-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access policy
CREATE POLICY "Public read access for saint images" ON storage.objects
FOR SELECT USING (bucket_id = 'saint-images');

-- Service role write access policy  
CREATE POLICY "Service role write access for saint images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'saint-images');

-- Update policy for service role
CREATE POLICY "Service role update access for saint images" ON storage.objects
FOR UPDATE USING (bucket_id = 'saint-images');

-- Delete policy for service role
CREATE POLICY "Service role delete access for saint images" ON storage.objects
FOR DELETE USING (bucket_id = 'saint-images');