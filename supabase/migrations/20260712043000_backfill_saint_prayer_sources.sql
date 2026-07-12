UPDATE public.oraciones o
SET
  fuente = COALESCE(NULLIF(o.fuente, ''), 'Wikipedia (referencia hagiográfica trazable)'),
  fuente_url = COALESCE(NULLIF(o.fuente_url, ''), 'https://es.wikipedia.org/w/index.php?search=' || replace(cs.name, ' ', '+')),
  updated_at = now()
FROM public.calendar_saints cs
WHERE cs.prayer_id = o.id
  AND lower(o.categoria) = 'santos'
  AND (o.fuente_url IS NULL OR o.fuente_url = '');
