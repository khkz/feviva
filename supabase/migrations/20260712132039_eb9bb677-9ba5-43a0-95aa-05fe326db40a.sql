UPDATE public.calendar_saints
SET fuente_url = 'https://es.wikipedia.org/wiki/Bas%C3%ADlica_de_Santa_Mar%C3%ADa_la_Mayor',
    verificado_at = now(),
    verificado_por_agente = 'correccion_manual_dedicaciones_2026_07_12'
WHERE name = 'Dedicación de Santa María la Mayor';

UPDATE public.calendar_saints
SET fuente_url = 'https://es.wikipedia.org/wiki/Bas%C3%ADlica_de_San_Pedro',
    verificado_at = now(),
    verificado_por_agente = 'correccion_manual_dedicaciones_2026_07_12'
WHERE name = 'Dedicación de las Basílicas de Pedro y Pablo';