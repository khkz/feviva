
ALTER TABLE public.calendar_saints
  ADD COLUMN IF NOT EXISTS verificado_por_agente text;

DO $$
DECLARE
  v_author text := 'verificacion_claude_2026_07_12';
  corrections jsonb := '[
    {"name":"San Damián de Molokai","old":"12/2","new_day":10,"new_month":5},
    {"name":"Santa Anastasia de Sirmio","old":"15/4","new_day":25,"new_month":12},
    {"name":"Santa Clotilde","old":"4/6","new_day":3,"new_month":6},
    {"name":"San Gregorio Barbarigo","old":"17/6","new_day":18,"new_month":6},
    {"name":"San Romualdo","old":"18/6","new_day":19,"new_month":6},
    {"name":"San Josemaría Escrivá","old":"19/6","new_day":26,"new_month":6},
    {"name":"Santa Laura de Córdoba","old":"20/10","new_day":19,"new_month":10},
    {"name":"Santa Bertila Boscardin","old":"5/11","new_day":20,"new_month":10},
    {"name":"San Vicente Pallotti","old":"23/1","new_day":22,"new_month":1},
    {"name":"San Colmano de Lindisfarne","old":"7/2","new_day":18,"new_month":2},
    {"name":"San Modesto de Jerusalén","old":"24/2","new_day":17,"new_month":12},
    {"name":"San Cristóbal","old":"24/7","new_day":10,"new_month":7},
    {"name":"Santa Tecla","old":"24/9","new_day":23,"new_month":9},
    {"name":"Beata Francisca Schervier","old":"22/12","new_day":14,"new_month":12}
  ]'::jsonb;
  item jsonb;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(corrections)
  LOOP
    UPDATE public.calendar_saints
    SET
      feast_day = (item->>'new_day')::int,
      feast_month = (item->>'new_month')::int,
      estado_verificacion = 'discrepancia_corregida',
      verificado_por_agente = v_author,
      verificado_at = now(),
      discrepancia_detalle = jsonb_build_object(
        'motivo', 'Corrección manual verificada contra Wikipedia / ACI Prensa / Vatican News / EWTN',
        'cambio', format('app decía %s, fuente dice %s/%s',
                         item->>'old',
                         item->>'new_day',
                         item->>'new_month'),
        'verificado_por_agente', v_author
      )
    WHERE name = item->>'name';
  END LOOP;
END $$;

UPDATE public.calendar_saints
SET tags = array_remove(tags, 'martires')
WHERE name IN ('San Modesto de Jerusalén', 'Santa Tecla')
  AND tags IS NOT NULL
  AND 'martires' = ANY(tags);
