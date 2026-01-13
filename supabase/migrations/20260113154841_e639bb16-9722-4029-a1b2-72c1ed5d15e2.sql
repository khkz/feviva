-- Fix get_saints_needing_bio to exclude saints that already have Wikipedia sources
-- Only process saints that need biographies (no source or non-Wikipedia source)

CREATE OR REPLACE FUNCTION get_saints_needing_bio(min_length INTEGER DEFAULT 100)
RETURNS SETOF calendar_saints AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM calendar_saints
  WHERE (
    description IS NULL 
    OR description = ''
    OR LENGTH(description) < min_length
  )
  AND (
    description_source IS NULL 
    OR description_source = ''
    OR description_source NOT LIKE 'wikipedia%'
  )
  ORDER BY feast_month ASC, feast_day ASC;
END;
$$ LANGUAGE plpgsql;