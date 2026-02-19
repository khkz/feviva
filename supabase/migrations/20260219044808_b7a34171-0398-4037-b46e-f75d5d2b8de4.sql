
-- Create usage_quotas table for daily AI usage tracking
CREATE TABLE public.usage_quotas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  ai_generations integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.usage_quotas ENABLE ROW LEVEL SECURITY;

-- Users can read their own quotas
CREATE POLICY "Users can view their own quotas"
  ON public.usage_quotas FOR SELECT
  USING (auth.uid() = user_id);

-- Service role (edge functions) will handle inserts/updates via service_role key
-- No user-facing INSERT/UPDATE/DELETE policies needed
