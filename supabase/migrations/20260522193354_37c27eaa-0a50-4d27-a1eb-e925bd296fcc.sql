-- 1. Add legacy_slug column to preserve old URLs for redirects
ALTER TABLE public.calendar_saints
ADD COLUMN IF NOT EXISTS legacy_slug TEXT;

-- 2. Backfill legacy_slug with current slug (only if not already set)
UPDATE public.calendar_saints
SET legacy_slug = slug
WHERE legacy_slug IS NULL;

-- 3. Clean current slugs (remove -xxxxxxxx suffix)
UPDATE public.calendar_saints
SET slug = regexp_replace(slug, '-[0-9a-f]{8}$', '')
WHERE slug ~ '-[0-9a-f]{8}$';

-- 4. Index legacy_slug for fast redirect lookups
CREATE INDEX IF NOT EXISTS idx_calendar_saints_legacy_slug
ON public.calendar_saints (legacy_slug);

-- 5. Update trigger: only append UUID suffix on actual collision
CREATE OR REPLACE FUNCTION public.set_saint_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  base_slug TEXT;
  candidate TEXT;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := generate_saint_slug(NEW.name);
    candidate := base_slug;
    -- If collision, append short UUID suffix
    IF EXISTS (SELECT 1 FROM public.calendar_saints WHERE slug = candidate AND id <> NEW.id) THEN
      candidate := base_slug || '-' || LEFT(NEW.id::text, 8);
    END IF;
    NEW.slug := candidate;
  END IF;
  RETURN NEW;
END;
$function$;