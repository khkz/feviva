
-- Create storage bucket for novena images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('novena-images', 'novena-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to novena images
CREATE POLICY "Public can view novena images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'novena-images');

-- Allow authenticated users to upload novena images (for admin/generation)
CREATE POLICY "Authenticated users can upload novena images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'novena-images' AND auth.role() = 'authenticated');
