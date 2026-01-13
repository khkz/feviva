-- Añadir columnas para verificación con Gemini 3 Pro en library_lessons
ALTER TABLE library_lessons 
ADD COLUMN IF NOT EXISTS verificado_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verificacion_data JSONB,
ADD COLUMN IF NOT EXISTS resumen_audio TEXT;