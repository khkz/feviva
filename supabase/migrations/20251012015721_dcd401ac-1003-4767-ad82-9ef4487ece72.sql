-- Create enum types
CREATE TYPE public.app_role AS ENUM ('user', 'moderator', 'revisor_teologico', 'admin', 'lider_iglesia');
CREATE TYPE public.perfil_doctrinal AS ENUM ('catolico', 'evangelico', 'pentecostal', 'no_denominacional', 'otro');
CREATE TYPE public.edad_segmento AS ENUM ('18-25', '26-35', '36-50', '51+');
CREATE TYPE public.habit_type AS ENUM ('oracion', 'gratitud', 'servicio', 'lectura_biblica', 'descanso');
CREATE TYPE public.post_type AS ENUM ('testimonio', 'peticion_oracion', 'reflexion');
CREATE TYPE public.content_estado AS ENUM ('borrador', 'revisado', 'publicado');

-- User Roles Table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Profiles Table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  email text,
  perfil_doctrinal perfil_doctrinal DEFAULT 'evangelico',
  edad_segmento edad_segmento,
  pais text,
  iglesia text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nombre', new.email),
    new.email
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Debates Table
CREATE TABLE public.debates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tema text NOT NULL,
  personaje text NOT NULL,
  transcript jsonb DEFAULT '[]'::jsonb,
  puntaje_fe int CHECK (puntaje_fe >= 0 AND puntaje_fe <= 10),
  puntaje_razon int CHECK (puntaje_razon >= 0 AND puntaje_razon <= 10),
  puntaje_amor int CHECK (puntaje_amor >= 0 AND puntaje_amor <= 10),
  feedback text,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.debates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own debates"
  ON public.debates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own debates"
  ON public.debates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debates"
  ON public.debates FOR UPDATE
  USING (auth.uid() = user_id);

-- Argument Cards Table
CREATE TABLE public.argument_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tema text NOT NULL,
  perfil_doctrinal perfil_doctrinal,
  resumen_30s text NOT NULL,
  resumen_2min text NOT NULL,
  resumen_5min text NOT NULL,
  premisas jsonb DEFAULT '[]'::jsonb,
  evidencia jsonb DEFAULT '[]'::jsonb,
  citas_biblicas jsonb DEFAULT '[]'::jsonb,
  puentes_empaticos jsonb DEFAULT '[]'::jsonb,
  errores_comunes jsonb DEFAULT '[]'::jsonb,
  recursos_sugeridos jsonb DEFAULT '[]'::jsonb,
  estado content_estado DEFAULT 'borrador',
  autor_id uuid REFERENCES public.profiles(id),
  revisor_id uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.argument_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published cards"
  ON public.argument_cards FOR SELECT
  USING (estado = 'publicado' OR auth.uid() = autor_id);

CREATE POLICY "Authors can create cards"
  ON public.argument_cards FOR INSERT
  WITH CHECK (auth.uid() = autor_id);

CREATE POLICY "Authors can update their own cards"
  ON public.argument_cards FOR UPDATE
  USING (auth.uid() = autor_id OR auth.uid() = revisor_id);

-- Habits Table
CREATE TABLE public.habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tipo habit_type NOT NULL,
  meta_semanal int DEFAULT 7,
  racha_actual int DEFAULT 0,
  racha_maxima int DEFAULT 0,
  ultima_actividad date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own habits"
  ON public.habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own habits"
  ON public.habits FOR ALL
  USING (auth.uid() = user_id);

-- Habit Logs Table
CREATE TABLE public.habit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  completado boolean DEFAULT true,
  notas text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(habit_id, fecha)
);

ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own habit logs"
  ON public.habit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.habits
      WHERE id = habit_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own habit logs"
  ON public.habit_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.habits
      WHERE id = habit_id AND user_id = auth.uid()
    )
  );

-- Community Posts Table
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tipo post_type NOT NULL,
  contenido text NOT NULL,
  estado content_estado DEFAULT 'publicado',
  likes_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published posts"
  ON public.posts FOR SELECT
  USING (estado = 'publicado');

CREATE POLICY "Users can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_debates_user_id ON public.debates(user_id);
CREATE INDEX idx_debates_created_at ON public.debates(created_at DESC);
CREATE INDEX idx_argument_cards_tema ON public.argument_cards(tema);
CREATE INDEX idx_argument_cards_estado ON public.argument_cards(estado);
CREATE INDEX idx_habits_user_id ON public.habits(user_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_tipo ON public.posts(tipo);