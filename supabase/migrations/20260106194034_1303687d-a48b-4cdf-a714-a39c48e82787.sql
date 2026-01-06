-- Create gratitude entries table
CREATE TABLE public.gratitude_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entrada_1 TEXT NOT NULL,
  entrada_2 TEXT,
  entrada_3 TEXT,
  reflexion_biblica TEXT,
  versiculo_sugerido TEXT,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gratitude_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own gratitude entries"
ON public.gratitude_entries
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gratitude entries"
ON public.gratitude_entries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gratitude entries"
ON public.gratitude_entries
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gratitude entries"
ON public.gratitude_entries
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_gratitude_entries_user_date ON public.gratitude_entries(user_id, fecha DESC);