-- ===========================================
-- FASE 1: Función de seguridad para verificar roles
-- ===========================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ===========================================
-- FASE 2: Sistema de Medios Unificado
-- ===========================================

CREATE TABLE public.media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('video', 'movie', 'audio', 'image', 'document')),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  duracion_segundos INT,
  size_bytes BIGINT,
  formato TEXT,
  metadata JSONB DEFAULT '{}',
  estado content_estado DEFAULT 'borrador',
  subido_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published media"
  ON public.media_library FOR SELECT
  USING (estado = 'publicado' OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can manage media"
  ON public.media_library FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE INDEX idx_media_tipo ON public.media_library(tipo);
CREATE INDEX idx_media_estado ON public.media_library(estado);

-- ===========================================
-- FASE 3: Sistema de Cursos/Entrenamientos
-- ===========================================

CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  imagen_url TEXT,
  nivel TEXT DEFAULT 'principiante' CHECK (nivel IN ('principiante', 'intermedio', 'avanzado')),
  categoria TEXT NOT NULL,
  instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  duracion_total_min INT DEFAULT 0,
  precio DECIMAL(10,2) DEFAULT 0,
  publicado BOOLEAN DEFAULT false,
  orden INT DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published courses"
  ON public.courses FOR SELECT
  USING (publicado = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage courses"
  ON public.courses FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR instructor_id = auth.uid());

CREATE TABLE public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  orden INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view modules of published courses"
  ON public.course_modules FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.courses c 
    WHERE c.id = course_id AND (c.publicado = true OR public.has_role(auth.uid(), 'admin'))
  ));

CREATE POLICY "Admins can manage modules"
  ON public.course_modules FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE,
  tipo TEXT DEFAULT 'video' CHECK (tipo IN ('video', 'text', 'quiz', 'practice', 'live')),
  titulo TEXT NOT NULL,
  contenido TEXT,
  media_id UUID REFERENCES public.media_library(id) ON DELETE SET NULL,
  duracion_min INT DEFAULT 0,
  quiz_data JSONB,
  orden INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lessons of published courses"
  ON public.course_lessons FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.course_modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = module_id AND (c.publicado = true OR public.has_role(auth.uid(), 'admin'))
  ));

CREATE POLICY "Admins can manage lessons"
  ON public.course_lessons FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.user_course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lessons_completed UUID[] DEFAULT '{}',
  progreso_porcentaje INT DEFAULT 0,
  certificado_emitido BOOLEAN DEFAULT false,
  fecha_inicio TIMESTAMPTZ DEFAULT now(),
  fecha_completado TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
  ON public.user_course_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own progress"
  ON public.user_course_progress FOR ALL
  USING (auth.uid() = user_id);

-- ===========================================
-- FASE 4: Sesiones en Vivo
-- ===========================================

CREATE TABLE public.live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duracion_estimada_min INT DEFAULT 60,
  estado TEXT DEFAULT 'scheduled' CHECK (estado IN ('scheduled', 'live', 'ended', 'cancelled')),
  recording_url TEXT,
  max_participants INT DEFAULT 100,
  categoria TEXT,
  precio DECIMAL(10,2) DEFAULT 0,
  imagen_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scheduled/live sessions"
  ON public.live_sessions FOR SELECT
  USING (estado IN ('scheduled', 'live', 'ended') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage sessions"
  ON public.live_sessions FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR instructor_id = auth.uid());

CREATE TABLE public.live_session_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asistio BOOLEAN DEFAULT false,
  registered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, user_id)
);

ALTER TABLE public.live_session_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own registrations"
  ON public.live_session_registrations FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can register themselves"
  ON public.live_session_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations"
  ON public.live_session_registrations FOR UPDATE
  USING (auth.uid() = user_id);

-- ===========================================
-- FASE 5: Películas Religiosas
-- ===========================================

CREATE TABLE public.movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  sinopsis TEXT,
  media_id UUID REFERENCES public.media_library(id) ON DELETE SET NULL,
  trailer_url TEXT,
  director TEXT,
  anio INT,
  duracion_min INT,
  categoria TEXT,
  clasificacion TEXT,
  imagen_poster TEXT,
  imagen_banner TEXT,
  destacada BOOLEAN DEFAULT false,
  publicada BOOLEAN DEFAULT false,
  orden INT DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published movies"
  ON public.movies FOR SELECT
  USING (publicada = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage movies"
  ON public.movies FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.user_movie_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  tiempo_visto_seg INT DEFAULT 0,
  completada BOOLEAN DEFAULT false,
  last_watched TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

ALTER TABLE public.user_movie_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own movie history"
  ON public.user_movie_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own movie history"
  ON public.user_movie_history FOR ALL
  USING (auth.uid() = user_id);

-- ===========================================
-- FASE 6: Sistema de Feedback (Pulgar arriba/abajo)
-- ===========================================

CREATE TABLE public.content_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  rating INT NOT NULL CHECK (rating IN (1, 5)),
  comentario TEXT,
  leido BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

ALTER TABLE public.content_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feedback"
  ON public.content_feedback FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can submit feedback"
  ON public.content_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their feedback"
  ON public.content_feedback FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all feedback"
  ON public.content_feedback FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_feedback_content ON public.content_feedback(content_type, content_id);
CREATE INDEX idx_feedback_rating ON public.content_feedback(rating);

-- ===========================================
-- FASE 7: Logs de Administración
-- ===========================================

CREATE TABLE public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view logs"
  ON public.admin_activity_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create logs"
  ON public.admin_activity_logs FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_admin_logs_admin ON public.admin_activity_logs(admin_id);
CREATE INDEX idx_admin_logs_date ON public.admin_activity_logs(created_at DESC);

-- ===========================================
-- FASE 8: Historial Unificado de Contenido
-- ===========================================

CREATE TABLE public.user_content_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  tiempo_total_seg INT DEFAULT 0,
  visitas INT DEFAULT 1,
  completado BOOLEAN DEFAULT false,
  first_accessed TIMESTAMPTZ DEFAULT now(),
  last_accessed TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

ALTER TABLE public.user_content_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own history"
  ON public.user_content_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own history"
  ON public.user_content_history FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_content_history_user ON public.user_content_history(user_id);
CREATE INDEX idx_content_history_type ON public.user_content_history(content_type);