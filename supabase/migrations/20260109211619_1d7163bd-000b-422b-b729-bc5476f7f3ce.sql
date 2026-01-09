-- FASE 1: Modificar tabla profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS country_code TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS devotion_primary TEXT;

-- Migrar datos existentes de 'pais' a 'country_code'
UPDATE public.profiles SET country_code = CASE
  WHEN LOWER(pais) LIKE '%méxico%' OR LOWER(pais) LIKE '%mexico%' THEN 'MX'
  WHEN LOWER(pais) LIKE '%argentina%' THEN 'AR'
  WHEN LOWER(pais) LIKE '%colombia%' THEN 'CO'
  WHEN LOWER(pais) LIKE '%perú%' OR LOWER(pais) LIKE '%peru%' THEN 'PE'
  WHEN LOWER(pais) LIKE '%chile%' THEN 'CL'
  WHEN LOWER(pais) LIKE '%venezuela%' THEN 'VE'
  WHEN LOWER(pais) LIKE '%ecuador%' THEN 'EC'
  WHEN LOWER(pais) LIKE '%guatemala%' THEN 'GT'
  WHEN LOWER(pais) LIKE '%cuba%' THEN 'CU'
  WHEN LOWER(pais) LIKE '%bolivia%' THEN 'BO'
  WHEN LOWER(pais) LIKE '%dominicana%' THEN 'DO'
  WHEN LOWER(pais) LIKE '%honduras%' THEN 'HN'
  WHEN LOWER(pais) LIKE '%paraguay%' THEN 'PY'
  WHEN LOWER(pais) LIKE '%salvador%' THEN 'SV'
  WHEN LOWER(pais) LIKE '%nicaragua%' THEN 'NI'
  WHEN LOWER(pais) LIKE '%costa rica%' THEN 'CR'
  WHEN LOWER(pais) LIKE '%panamá%' OR LOWER(pais) LIKE '%panama%' THEN 'PA'
  WHEN LOWER(pais) LIKE '%uruguay%' THEN 'UY'
  WHEN LOWER(pais) LIKE '%puerto rico%' THEN 'PR'
  WHEN LOWER(pais) LIKE '%brasil%' OR LOWER(pais) LIKE '%brazil%' THEN 'BR'
  WHEN LOWER(pais) LIKE '%españa%' OR LOWER(pais) LIKE '%spain%' THEN 'ES'
  ELSE NULL
END WHERE pais IS NOT NULL AND country_code IS NULL;

-- FASE 2: Modificar tabla oraciones
ALTER TABLE public.oraciones 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- FASE 3: Crear tabla calendar_saints
CREATE TABLE IF NOT EXISTS public.calendar_saints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  feast_month INTEGER NOT NULL CHECK (feast_month >= 1 AND feast_month <= 12),
  feast_day INTEGER NOT NULL CHECK (feast_day >= 1 AND feast_day <= 31),
  country_code TEXT,
  category TEXT NOT NULL DEFAULT 'universal_helper',
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  image_url TEXT,
  prayer_id UUID REFERENCES public.oraciones(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS con política pública de lectura
ALTER TABLE public.calendar_saints ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede ver santos (lectura pública)
CREATE POLICY "Anyone can view saints"
ON public.calendar_saints FOR SELECT
USING (true);

-- Política: Solo admins pueden modificar (firma correcta: user_id primero, role después)
CREATE POLICY "Admins can manage saints"
ON public.calendar_saints FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Índices para consultas eficientes
CREATE INDEX IF NOT EXISTS idx_saints_feast_date ON public.calendar_saints(feast_month, feast_day);
CREATE INDEX IF NOT EXISTS idx_saints_country ON public.calendar_saints(country_code);

-- FASE 4: Seed Data - Patronos Nacionales
INSERT INTO public.calendar_saints (name, feast_month, feast_day, country_code, category, tags, description) VALUES
('Virgen de la Altagracia', 1, 21, 'DO', 'patron_country', ARRAY['protección', 'familia'], 'Patrona de la República Dominicana, venerada desde el siglo XVI.'),
('Cristo Negro de Esquipulas', 1, 15, 'GT', 'patron_country', ARRAY['salud', 'milagros'], 'Patrono de Guatemala. La imagen del Cristo Negro ha sido venerada desde 1595.'),
('Virgen de Suyapa', 2, 3, 'HN', 'patron_country', ARRAY['protección', 'familia'], 'Patrona de Honduras. Una pequeña imagen de 6 cm encontrada en 1747.'),
('Nuestra Señora de Luján', 5, 8, 'AR', 'patron_country', ARRAY['protección', 'familia', 'patria'], 'Patrona de Argentina, Uruguay y Paraguay.'),
('Virgen de Chiquinquirá', 7, 9, 'CO', 'patron_country', ARRAY['renovación', 'fe'], 'Patrona de Colombia. La imagen se renovó milagrosamente en 1586.'),
('Virgen del Carmen', 7, 16, 'CL', 'patron_country', ARRAY['protección', 'mar'], 'Patrona de Chile y de los marineros.'),
('Virgen de los Ángeles', 8, 2, 'CR', 'patron_country', ARRAY['protección', 'salud'], 'Patrona de Costa Rica. "La Negrita" apareció en 1635.'),
('Virgen de Copacabana', 8, 5, 'BO', 'patron_country', ARRAY['protección', 'lago'], 'Patrona de Bolivia. Venerada a orillas del Lago Titicaca.'),
('Divino Salvador del Mundo', 8, 6, 'SV', 'patron_country', ARRAY['salvación', 'patria'], 'Patrono de El Salvador.'),
('Santa Rosa de Lima', 8, 30, 'PE', 'patron_country', ARRAY['penitencia', 'mística', 'latinoamérica'], 'Primera santa de América. Patrona de Perú y América Latina.'),
('Virgen de la Caridad del Cobre', 9, 8, 'CU', 'patron_country', ARRAY['protección', 'mar', 'exilio'], 'Patrona de Cuba. Apareció flotando en la bahía de Nipe en 1612.'),
('Santa María la Antigua', 9, 9, 'PA', 'patron_country', ARRAY['protección', 'historia'], 'Patrona de Panamá.'),
('Virgen de Coromoto', 9, 11, 'VE', 'patron_country', ARRAY['conversión', 'indígenas'], 'Patrona de Venezuela. Apareció a un cacique indígena en 1652.'),
('Nuestra Señora Aparecida', 10, 12, 'BR', 'patron_country', ARRAY['protección', 'milagros'], 'Patrona de Brasil. Una pequeña imagen negra encontrada por pescadores en 1717.'),
('Señor de los Milagros', 10, 18, 'PE', 'patron_country', ARRAY['milagros', 'terremotos', 'protección'], 'Cristo Moreno de Lima. La procesión más grande de Sudamérica.'),
('Virgen de los Treinta y Tres', 11, 8, 'UY', 'patron_country', ARRAY['independencia', 'patria'], 'Patrona de Uruguay.'),
('Virgen de la Providencia', 11, 19, 'PR', 'patron_country', ARRAY['providencia', 'familia'], 'Patrona de Puerto Rico.'),
('Virgen del Quinche', 11, 21, 'EC', 'patron_country', ARRAY['protección', 'sanación'], 'Patrona de Ecuador.'),
('Inmaculada Concepción de Caacupé', 12, 8, 'PY', 'patron_country', ARRAY['pureza', 'protección'], 'Patrona de Paraguay.'),
('Virgen de Guadalupe', 12, 12, 'MX', 'patron_country', ARRAY['protección', 'indigenismo', 'américa'], 'Patrona de México y Emperatriz de las Américas. Apareció a San Juan Diego en 1531.');

-- FASE 5: Seed Data - Santos Universales
INSERT INTO public.calendar_saints (name, feast_month, feast_day, country_code, category, tags, description) VALUES
('San José', 3, 19, NULL, 'universal_helper', ARRAY['familia', 'padres', 'trabajo', 'iglesia'], 'Esposo de María y padre adoptivo de Jesús. Patrono de la Iglesia Universal, los trabajadores y las familias.'),
('San Expedito', 4, 19, NULL, 'universal_helper', ARRAY['urgente', 'causas_justas', 'conversión'], 'Mártir romano invocado para causas urgentes.'),
('San Jorge', 4, 23, NULL, 'universal_helper', ARRAY['protección', 'mal', 'valentía'], 'Mártir y soldado romano. Patrono de los soldados.'),
('San Peregrino Laziosi', 5, 1, NULL, 'universal_helper', ARRAY['salud', 'cáncer', 'enfermos'], 'Patrono de los enfermos de cáncer.'),
('Santa Rita de Casia', 5, 22, NULL, 'universal_helper', ARRAY['imposibles', 'matrimonio', 'perdón'], 'Patrona de las causas imposibles y desesperadas.'),
('San Antonio de Padua', 6, 13, NULL, 'universal_helper', ARRAY['pareja', 'objetos_perdidos', 'pobres'], 'Doctor de la Iglesia. Invocado para encontrar objetos perdidos.'),
('San Benito de Nursia', 7, 11, NULL, 'universal_helper', ARRAY['exorcismo', 'protección', 'monjes'], 'Padre del monacato occidental. Su medalla es poderosa contra el mal.'),
('San Cayetano', 8, 7, NULL, 'universal_helper', ARRAY['trabajo', 'dinero', 'providencia'], 'Patrono del pan y del trabajo.'),
('San Miguel Arcángel', 9, 29, NULL, 'universal_helper', ARRAY['protección', 'batalla_espiritual', 'exorcismo'], 'Príncipe de la milicia celestial. Defensor contra el mal.'),
('San Judas Tadeo', 10, 28, NULL, 'universal_helper', ARRAY['casos_difíciles', 'desesperados', 'trabajo'], 'Apóstol de Cristo. Patrono de las causas difíciles y desesperadas.');