-- Add fields to track traditional prayers vs AI-generated
ALTER TABLE oraciones ADD COLUMN IF NOT EXISTS fuente TEXT;
ALTER TABLE oraciones ADD COLUMN IF NOT EXISTS fuente_url TEXT;
ALTER TABLE oraciones ADD COLUMN IF NOT EXISTS es_tradicional BOOLEAN DEFAULT false;

-- Add index for filtering
CREATE INDEX IF NOT EXISTS idx_oraciones_es_tradicional ON oraciones(es_tradicional);

-- Update existing prayers to mark as AI-generated
UPDATE oraciones SET es_tradicional = false WHERE es_tradicional IS NULL;