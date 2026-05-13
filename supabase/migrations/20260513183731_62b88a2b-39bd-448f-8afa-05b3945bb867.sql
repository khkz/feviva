CREATE OR REPLACE FUNCTION public.update_updated_at_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_saints_needing_bio(min_length integer DEFAULT 100)
RETURNS SETOF public.calendar_saints
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT * FROM public.calendar_saints
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
$function$;