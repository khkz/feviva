-- Fix function search path for generate_saint_slug
CREATE OR REPLACE FUNCTION generate_saint_slug(name_input TEXT)
RETURNS TEXT AS $$
DECLARE
  slug_result TEXT;
BEGIN
  slug_result := LOWER(name_input);
  slug_result := REPLACE(slug_result, 'á', 'a');
  slug_result := REPLACE(slug_result, 'é', 'e');
  slug_result := REPLACE(slug_result, 'í', 'i');
  slug_result := REPLACE(slug_result, 'ó', 'o');
  slug_result := REPLACE(slug_result, 'ú', 'u');
  slug_result := REPLACE(slug_result, 'ü', 'u');
  slug_result := REPLACE(slug_result, 'ñ', 'n');
  slug_result := REPLACE(slug_result, 'Á', 'a');
  slug_result := REPLACE(slug_result, 'É', 'e');
  slug_result := REPLACE(slug_result, 'Í', 'i');
  slug_result := REPLACE(slug_result, 'Ó', 'o');
  slug_result := REPLACE(slug_result, 'Ú', 'u');
  slug_result := REPLACE(slug_result, 'Ü', 'u');
  slug_result := REPLACE(slug_result, 'Ñ', 'n');
  slug_result := REGEXP_REPLACE(slug_result, '[^a-z0-9]+', '-', 'g');
  slug_result := TRIM(BOTH '-' FROM slug_result);
  RETURN slug_result;
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

-- Fix function search path for set_saint_slug
CREATE OR REPLACE FUNCTION set_saint_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_saint_slug(NEW.name) || '-' || LEFT(NEW.id::text, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;