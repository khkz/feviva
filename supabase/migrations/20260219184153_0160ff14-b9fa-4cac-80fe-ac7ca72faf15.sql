
-- Tabla de tipos de misterios del rosario
CREATE TABLE public.rosario_misterios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL, -- gozosos, dolorosos, gloriosos, luminosos
  nombre TEXT NOT NULL,
  dia TEXT NOT NULL,
  numero INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  fruto TEXT NOT NULL,
  meditacion TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tipo, numero)
);

-- Tabla de oraciones del rosario
CREATE TABLE public.rosario_oraciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clave TEXT NOT NULL UNIQUE, -- padreNuestro, aveMaria, gloria, salveRegina, credo
  nombre TEXT NOT NULL,
  texto TEXT NOT NULL,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS: lectura pública
ALTER TABLE public.rosario_misterios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rosario_oraciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rosario misterios" ON public.rosario_misterios FOR SELECT USING (true);
CREATE POLICY "Admins can manage rosario misterios" ON public.rosario_misterios FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view rosario oraciones" ON public.rosario_oraciones FOR SELECT USING (true);
CREATE POLICY "Admins can manage rosario oraciones" ON public.rosario_oraciones FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
