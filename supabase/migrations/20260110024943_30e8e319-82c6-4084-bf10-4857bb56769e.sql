-- Step 1: Add slug column
ALTER TABLE calendar_saints ADD COLUMN slug TEXT;

-- Step 2: Create slug generation function
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
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 3: Update all slugs using ID for guaranteed uniqueness
UPDATE calendar_saints 
SET slug = generate_saint_slug(name) || '-' || LEFT(id::text, 8);

-- Step 4: Add unique constraint
ALTER TABLE calendar_saints ADD CONSTRAINT calendar_saints_slug_unique UNIQUE (slug);

-- Step 5: Create index
CREATE INDEX idx_calendar_saints_slug ON calendar_saints(slug);

-- Step 6: Create trigger function
CREATE OR REPLACE FUNCTION set_saint_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_saint_slug(NEW.name) || '-' || LEFT(NEW.id::text, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger
CREATE TRIGGER trigger_set_saint_slug
BEFORE INSERT OR UPDATE ON calendar_saints
FOR EACH ROW
EXECUTE FUNCTION set_saint_slug();