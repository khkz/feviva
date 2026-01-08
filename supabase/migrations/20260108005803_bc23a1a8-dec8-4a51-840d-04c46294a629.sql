-- Insert streak achievements for each spiritual practice
-- Rosario achievements
INSERT INTO public.achievements (codigo, nombre, descripcion, icono, categoria, racha_requerida)
VALUES 
  ('rosario_streak_7', 'Rosario Constante', '7 días consecutivos rezando el Rosario', '🌹', 'racha_rosario', 7),
  ('rosario_streak_21', 'Devoto del Rosario', '21 días consecutivos rezando el Rosario', '📿', 'racha_rosario', 21),
  ('rosario_streak_40', 'Maestro del Rosario', '40 días consecutivos rezando el Rosario', '👑', 'racha_rosario', 40);

-- Examen de Conciencia achievements
INSERT INTO public.achievements (codigo, nombre, descripcion, icono, categoria, racha_requerida)
VALUES 
  ('examen_streak_7', 'Reflexión Diaria', '7 días consecutivos de Examen de Conciencia', '🌙', 'racha_examen', 7),
  ('examen_streak_21', 'Alma en Paz', '21 días consecutivos de Examen de Conciencia', '✨', 'racha_examen', 21),
  ('examen_streak_40', 'Conciencia Iluminada', '40 días consecutivos de Examen de Conciencia', '🕯️', 'racha_examen', 40);

-- Laudes achievements
INSERT INTO public.achievements (codigo, nombre, descripcion, icono, categoria, racha_requerida)
VALUES 
  ('laudes_streak_7', 'Amanecer con Dios', '7 días consecutivos de Laudes', '☀️', 'racha_laudes', 7),
  ('laudes_streak_21', 'Madrugador Fiel', '21 días consecutivos de Laudes', '🌅', 'racha_laudes', 21),
  ('laudes_streak_40', 'Aurora Espiritual', '40 días consecutivos de Laudes', '🌄', 'racha_laudes', 40);

-- Biblia achievements
INSERT INTO public.achievements (codigo, nombre, descripcion, icono, categoria, racha_requerida)
VALUES 
  ('biblia_streak_7', 'Lector de la Palabra', '7 días consecutivos de lectura bíblica', '📖', 'racha_biblia', 7),
  ('biblia_streak_21', 'Estudiante de las Escrituras', '21 días consecutivos de lectura bíblica', '📚', 'racha_biblia', 21),
  ('biblia_streak_40', 'Sabio Bíblico', '40 días consecutivos de lectura bíblica', '🏆', 'racha_biblia', 40);

-- Gratitud achievements
INSERT INTO public.achievements (codigo, nombre, descripcion, icono, categoria, racha_requerida)
VALUES 
  ('gratitud_streak_7', 'Corazón Agradecido', '7 días consecutivos de gratitud', '❤️', 'racha_gratitud', 7),
  ('gratitud_streak_21', 'Espíritu de Alabanza', '21 días consecutivos de gratitud', '💖', 'racha_gratitud', 21),
  ('gratitud_streak_40', 'Alma Agradecida', '40 días consecutivos de gratitud', '💝', 'racha_gratitud', 40);