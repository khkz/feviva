-- Function to get saints needing biography updates
-- Returns saints with null, empty, or short descriptions
CREATE OR REPLACE FUNCTION get_saints_needing_bio(min_length INTEGER DEFAULT 100)
RETURNS SETOF calendar_saints AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM calendar_saints
  WHERE description IS NULL 
     OR description = ''
     OR LENGTH(description) < min_length
     OR description_source IS NULL
  ORDER BY feast_month ASC, feast_day ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;