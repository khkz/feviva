UPDATE public.calendar_saints
SET description = replace(replace(description, 'manos nudosa', 'manos nudosas'), 'Esteban', 'Adriano')
WHERE id = '6de81b65-2a58-43aa-a329-bb6d9388ce43';