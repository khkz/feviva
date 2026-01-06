-- Contenido diario generado por IA
CREATE TABLE public.daily_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE UNIQUE NOT NULL,
  versiculo_referencia TEXT NOT NULL,
  versiculo_texto TEXT NOT NULL,
  reflexion_ia TEXT NOT NULL,
  tip_apologetico TEXT NOT NULL,
  oracion_laudes TEXT NOT NULL,
  oracion_completas TEXT NOT NULL,
  ensenanza_titulo TEXT,
  ensenanza_contenido TEXT,
  audio_ensenanza_url TEXT,
  audio_versiculo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_content ENABLE ROW LEVEL SECURITY;

-- Everyone can read daily content
CREATE POLICY "Anyone can view daily content"
ON public.daily_content
FOR SELECT
USING (true);

-- Registro de rituales del usuario
CREATE TABLE public.user_rituals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  fecha DATE NOT NULL,
  ritual_matutino_completado BOOLEAN DEFAULT false,
  ritual_nocturno_completado BOOLEAN DEFAULT false,
  meta_evangelizacion TEXT,
  compartio_fe BOOLEAN DEFAULT false,
  notas_evangelizacion TEXT,
  diario_personal TEXT,
  examen_conciencia JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, fecha)
);

-- Enable RLS
ALTER TABLE public.user_rituals ENABLE ROW LEVEL SECURITY;

-- Users can view their own rituals
CREATE POLICY "Users can view their own rituals"
ON public.user_rituals
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own rituals
CREATE POLICY "Users can insert their own rituals"
ON public.user_rituals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own rituals
CREATE POLICY "Users can update their own rituals"
ON public.user_rituals
FOR UPDATE
USING (auth.uid() = user_id);

-- Diario de oración
CREATE TABLE public.prayer_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tipo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  versiculo_relacionado TEXT,
  respondida BOOLEAN DEFAULT false,
  fecha_respuesta DATE,
  notas_respuesta TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prayer_journal ENABLE ROW LEVEL SECURITY;

-- Users can view their own prayers
CREATE POLICY "Users can view their own prayers"
ON public.prayer_journal
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own prayers
CREATE POLICY "Users can insert their own prayers"
ON public.prayer_journal
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own prayers
CREATE POLICY "Users can update their own prayers"
ON public.prayer_journal
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own prayers
CREATE POLICY "Users can delete their own prayers"
ON public.prayer_journal
FOR DELETE
USING (auth.uid() = user_id);

-- Registro de evangelización
CREATE TABLE public.evangelization_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  fecha DATE NOT NULL,
  tipo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  persona_nombre TEXT,
  resultado TEXT,
  seguimiento_necesario BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.evangelization_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own evangelization logs
CREATE POLICY "Users can view their own evangelization logs"
ON public.evangelization_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own evangelization logs
CREATE POLICY "Users can insert their own evangelization logs"
ON public.evangelization_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own evangelization logs
CREATE POLICY "Users can update their own evangelization logs"
ON public.evangelization_logs
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own evangelization logs
CREATE POLICY "Users can delete their own evangelization logs"
ON public.evangelization_logs
FOR DELETE
USING (auth.uid() = user_id);

-- Storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) VALUES ('teachings-audio', 'teachings-audio', true);

-- Storage policies for audio bucket
CREATE POLICY "Anyone can view teaching audio"
ON storage.objects
FOR SELECT
USING (bucket_id = 'teachings-audio');

-- Service role can insert audio (edge functions)
CREATE POLICY "Service can upload audio"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'teachings-audio');

-- New achievements for rituals and evangelization
INSERT INTO public.achievements (codigo, nombre, descripcion, icono, categoria, puntos_requeridos, debates_requeridos, lecciones_requeridas, racha_requerida)
VALUES 
  ('ritual_matutino_7', 'Madrugador Fiel', 'Completa 7 rituales matutinos', '🌅', 'rituales', NULL, NULL, NULL, 7),
  ('ritual_nocturno_7', 'Descanso en Paz', 'Completa 7 rituales nocturnos', '🌙', 'rituales', NULL, NULL, NULL, 7),
  ('rituales_30', 'Disciplina Espiritual', 'Completa ambos rituales por 30 días', '⭐', 'rituales', NULL, NULL, NULL, 30),
  ('evangelizacion_1', 'Primer Paso', 'Registra tu primera conversación de fe', '👣', 'mision', NULL, NULL, NULL, NULL),
  ('evangelizacion_10', 'Sembrador', 'Registra 10 conversaciones de fe', '🌱', 'mision', NULL, NULL, NULL, NULL),
  ('evangelizacion_50', 'Pescador de Hombres', 'Registra 50 conversaciones de fe', '🎣', 'mision', NULL, NULL, NULL, NULL),
  ('oraciones_50', 'Guerrero de Oración', 'Registra 50 oraciones', '🙏', 'oracion', NULL, NULL, NULL, NULL),
  ('peticiones_10', 'Fe Probada', '10 peticiones respondidas', '✨', 'oracion', NULL, NULL, NULL, NULL),
  ('lectio_divina_7', 'Contemplativo', 'Completa 7 Lectio Divina', '📖', 'oracion', NULL, NULL, NULL, 7)
ON CONFLICT (codigo) DO NOTHING;