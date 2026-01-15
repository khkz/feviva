-- Add slug column to oraciones table for better SEO (without unique constraint initially)
ALTER TABLE public.oraciones ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create function to generate slug from nombre
CREATE OR REPLACE FUNCTION generate_prayer_slug(nombre TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        translate(
          nombre,
          'áéíóúüñÁÉÍÓÚÜÑ',
          'aeiouunAEIOUUN'
        ),
        '[^a-zA-Z0-9]+',
        '-',
        'g'
      ),
      '(^-|-$)',
      '',
      'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

-- Populate slugs for existing prayers (add suffix for duplicates)
WITH ranked_prayers AS (
  SELECT id, nombre,
         ROW_NUMBER() OVER (PARTITION BY generate_prayer_slug(nombre) ORDER BY created_at) as rn
  FROM public.oraciones
)
UPDATE public.oraciones o
SET slug = CASE 
  WHEN rp.rn = 1 THEN generate_prayer_slug(o.nombre)
  ELSE generate_prayer_slug(o.nombre) || '-' || rp.rn
END
FROM ranked_prayers rp
WHERE o.id = rp.id AND o.slug IS NULL;

-- Add unique constraint after populating
ALTER TABLE public.oraciones ADD CONSTRAINT oraciones_slug_unique UNIQUE (slug);

-- Create trigger to auto-generate slug on insert if not provided
CREATE OR REPLACE FUNCTION set_prayer_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INT := 1;
BEGIN
  IF NEW.slug IS NULL THEN
    base_slug := generate_prayer_slug(NEW.nombre);
    final_slug := base_slug;
    
    -- Handle duplicates by adding suffix
    WHILE EXISTS (SELECT 1 FROM public.oraciones WHERE slug = final_slug AND id != NEW.id) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS set_prayer_slug_trigger ON public.oraciones;
CREATE TRIGGER set_prayer_slug_trigger
  BEFORE INSERT OR UPDATE ON public.oraciones
  FOR EACH ROW
  EXECUTE FUNCTION set_prayer_slug();

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_oraciones_slug ON public.oraciones(slug);