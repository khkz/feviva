-- Add new columns to oraciones table for enhanced UX
ALTER TABLE public.oraciones 
ADD COLUMN IF NOT EXISTS tagline text,
ADD COLUMN IF NOT EXISTS es_fundamental boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cita_celebre text,
ADD COLUMN IF NOT EXISTS cita_autor text;

-- Add comments for documentation
COMMENT ON COLUMN public.oraciones.tagline IS 'Short inspirational description of the prayer';
COMMENT ON COLUMN public.oraciones.es_fundamental IS 'Whether this is one of the 4 fundamental Catholic prayers';
COMMENT ON COLUMN public.oraciones.cita_celebre IS 'Famous quote about this prayer';
COMMENT ON COLUMN public.oraciones.cita_autor IS 'Author of the famous quote';

-- Update the fundamental prayers with their data
UPDATE public.oraciones SET 
  es_fundamental = true,
  tagline = 'La oración que Jesús nos enseñó',
  cita_celebre = 'El Padre Nuestro es la oración perfecta',
  cita_autor = 'San Agustín'
WHERE nombre ILIKE '%padre nuestro%';

UPDATE public.oraciones SET 
  es_fundamental = true,
  tagline = 'El saludo del ángel a María',
  cita_celebre = 'Dios te salve, llena de gracia, el Señor es contigo',
  cita_autor = 'Lucas 1:28'
WHERE nombre ILIKE '%ave mar%' OR nombre ILIKE '%avemaría%';

UPDATE public.oraciones SET 
  es_fundamental = true,
  tagline = 'Alabanza a la Santísima Trinidad',
  cita_celebre = 'Gloria a Dios en el cielo y en la tierra paz a los hombres',
  cita_autor = 'Liturgia Romana'
WHERE nombre ILIKE '%gloria%' AND (nombre ILIKE '%padre%' OR categoria ILIKE '%básic%' OR categoria ILIKE '%fundamental%');

UPDATE public.oraciones SET 
  es_fundamental = true,
  tagline = 'Profesión de fe desde el siglo I',
  cita_celebre = 'Creo en Dios Padre todopoderoso, creador del cielo y de la tierra',
  cita_autor = 'Concilio de Nicea, 325 d.C.'
WHERE nombre ILIKE '%credo%';