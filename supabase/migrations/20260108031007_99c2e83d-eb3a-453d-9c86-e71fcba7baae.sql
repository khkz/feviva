-- Create apostle_path_progress table
CREATE TABLE public.apostle_path_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  etapa_actual INTEGER NOT NULL DEFAULT 1,
  cimientos_completado BOOLEAN NOT NULL DEFAULT false,
  defensor_completado BOOLEAN NOT NULL DEFAULT false,
  debatidor_completado BOOLEAN NOT NULL DEFAULT false,
  misionero_completado BOOLEAN NOT NULL DEFAULT false,
  apostol_completado BOOLEAN NOT NULL DEFAULT false,
  fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  fecha_ultima_actividad TIMESTAMP WITH TIME ZONE,
  puntos_ruta INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create apostle_path_activities table
CREATE TABLE public.apostle_path_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  etapa INTEGER NOT NULL,
  actividad_tipo TEXT NOT NULL,
  actividad_id TEXT NOT NULL,
  completado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  puntos_ganados INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  UNIQUE(user_id, etapa, actividad_tipo, actividad_id)
);

-- Enable RLS
ALTER TABLE public.apostle_path_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apostle_path_activities ENABLE ROW LEVEL SECURITY;

-- RLS policies for apostle_path_progress
CREATE POLICY "Users can view their own path progress"
ON public.apostle_path_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own path progress"
ON public.apostle_path_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own path progress"
ON public.apostle_path_progress FOR UPDATE
USING (auth.uid() = user_id);

-- RLS policies for apostle_path_activities
CREATE POLICY "Users can view their own path activities"
ON public.apostle_path_activities FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own path activities"
ON public.apostle_path_activities FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Insert achievements for the apostle path
INSERT INTO public.achievements (codigo, nombre, descripcion, icono, categoria) VALUES
('ruta_cimientos', 'Cimiento Puesto', 'Completaste la etapa Cimientos de la Ruta del Apóstol', '🪨', 'ruta'),
('ruta_defensor', 'Defensor de la Fe', 'Completaste la etapa Defensor de la Ruta del Apóstol', '🛡️', 'ruta'),
('ruta_debatidor', 'Debatidor Preparado', 'Completaste la etapa Debatidor de la Ruta del Apóstol', '⚔️', 'ruta'),
('ruta_misionero', 'Misionero Activo', 'Completaste la etapa Misionero de la Ruta del Apóstol', '🧭', 'ruta'),
('ruta_apostol', 'Apóstol de Cristo', 'Completaste toda la Ruta del Apóstol', '👑', 'ruta');

-- Create trigger for updated_at
CREATE TRIGGER update_apostle_path_progress_updated_at
BEFORE UPDATE ON public.apostle_path_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_user_stats_updated_at();