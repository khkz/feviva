-- Corregir funciones sin search_path seguro
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.calculate_level(integer) SET search_path = public;