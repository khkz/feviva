ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS ftue_completed_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.ftue_completed_at IS 'When the user completed the first-day experience; NULL means not yet completed.';