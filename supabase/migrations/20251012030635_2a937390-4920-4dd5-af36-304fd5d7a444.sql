-- Create user_stats table
CREATE TABLE public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  nivel INTEGER NOT NULL DEFAULT 1,
  puntos_totales INTEGER NOT NULL DEFAULT 0,
  debates_completados INTEGER NOT NULL DEFAULT 0,
  lecciones_completadas INTEGER NOT NULL DEFAULT 0,
  tarjetas_estudiadas INTEGER NOT NULL DEFAULT 0,
  racha_actual_dias INTEGER NOT NULL DEFAULT 0,
  racha_maxima_dias INTEGER NOT NULL DEFAULT 0,
  ultima_actividad DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  icono TEXT NOT NULL,
  categoria TEXT NOT NULL,
  puntos_requeridos INTEGER,
  debates_requeridos INTEGER,
  lecciones_requeridas INTEGER,
  racha_requerida INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  desbloqueado_en TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_stats
CREATE POLICY "Users can view their own stats"
ON public.user_stats
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
ON public.user_stats
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
ON public.user_stats
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for achievements
CREATE POLICY "Anyone can view achievements"
ON public.achievements
FOR SELECT
TO authenticated
USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
ON public.user_achievements
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
ON public.user_achievements
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Function to update user stats timestamp
CREATE OR REPLACE FUNCTION public.update_user_stats_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for user_stats
CREATE TRIGGER update_user_stats_updated_at_trigger
BEFORE UPDATE ON public.user_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_user_stats_updated_at();

-- Function to calculate level from points
CREATE OR REPLACE FUNCTION public.calculate_level(puntos INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Level 1: 0-99 puntos
  -- Level 2: 100-299 puntos
  -- Level 3: 300-599 puntos
  -- Level 4: 600-999 puntos
  -- Level 5+: 1000+ puntos (cada 500 puntos adicionales)
  IF puntos < 100 THEN
    RETURN 1;
  ELSIF puntos < 300 THEN
    RETURN 2;
  ELSIF puntos < 600 THEN
    RETURN 3;
  ELSIF puntos < 1000 THEN
    RETURN 4;
  ELSE
    RETURN 5 + ((puntos - 1000) / 500);
  END IF;
END;
$$;

-- Insert initial achievements
INSERT INTO public.achievements (codigo, nombre, descripcion, icono, categoria, debates_requeridos) VALUES
('primer_debate', 'Primer Paso', 'Completa tu primer debate', '🎯', 'debates', 1),
('debate_10', 'Aprendiz', 'Completa 10 debates', '📚', 'debates', 10),
('debate_50', 'Veterano', 'Completa 50 debates', '🎖️', 'debates', 50),
('debate_100', 'Maestro del Diálogo', 'Completa 100 debates', '👑', 'debates', 100);

INSERT INTO public.achievements (codigo, nombre, descripcion, icono, categoria, lecciones_requeridas) VALUES
('primera_leccion', 'Estudiante Nuevo', 'Completa tu primera lección', '📖', 'lecciones', 1),
('leccion_10', 'Buscador de Verdad', 'Completa 10 lecciones', '🔍', 'lecciones', 10),
('leccion_25', 'Teólogo Amateur', 'Completa 25 lecciones', '⛪', 'lecciones', 25);

INSERT INTO public.achievements (codigo, nombre, descripcion, icono, categoria, racha_requerida) VALUES
('racha_7', 'Semana de Fe', 'Mantén una racha de 7 días', '🔥', 'racha', 7),
('racha_30', 'Mes Fiel', 'Mantén una racha de 30 días', '⭐', 'racha', 30),
('racha_100', 'Centinela Incansable', 'Mantén una racha de 100 días', '💎', 'racha', 100);

INSERT INTO public.achievements (codigo, nombre, descripcion, icono, categoria, puntos_requeridos) VALUES
('puntos_500', 'Ascendiendo', 'Alcanza 500 puntos totales', '🚀', 'puntos', 500),
('puntos_1000', 'Estrella Brillante', 'Alcanza 1000 puntos totales', '✨', 'puntos', 1000),
('puntos_5000', 'Leyenda', 'Alcanza 5000 puntos totales', '🏆', 'puntos', 5000);