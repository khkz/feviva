-- Create table for pre-generated daily shareable images
CREATE TABLE public.daily_share_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'santo', 'evangelio', 'versiculo', 'reflexion'
  formato VARCHAR(20) NOT NULL, -- 'story', 'post'
  image_url TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(fecha, tipo, formato)
);

-- Enable RLS
ALTER TABLE public.daily_share_images ENABLE ROW LEVEL SECURITY;

-- Public read access (images are meant to be shared)
CREATE POLICY "Daily share images are publicly readable"
ON public.daily_share_images
FOR SELECT
USING (true);

-- Only service role can insert/update (via edge function)
CREATE POLICY "Service role can manage daily share images"
ON public.daily_share_images
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create index for fast date lookups
CREATE INDEX idx_daily_share_images_fecha ON public.daily_share_images(fecha);
CREATE INDEX idx_daily_share_images_fecha_tipo ON public.daily_share_images(fecha, tipo);

-- Create storage bucket for daily share images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'daily-share-images',
  'daily-share-images',
  true,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for public read access
CREATE POLICY "Daily share images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'daily-share-images');

-- Allow service role to upload images
CREATE POLICY "Service role can upload daily share images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'daily-share-images');