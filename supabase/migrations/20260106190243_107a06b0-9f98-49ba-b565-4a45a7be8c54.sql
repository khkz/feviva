-- Añadir columna de idioma a las tablas de contenido para soporte multilingüe futuro
ALTER TABLE library_lessons ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'es';
ALTER TABLE sleep_stories ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'es';
ALTER TABLE novenas ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'es';
ALTER TABLE oraciones ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'es';