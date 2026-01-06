-- Add notification preferences to user_novena_progress
ALTER TABLE public.user_novena_progress 
ADD COLUMN IF NOT EXISTS recordatorio_activo BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hora_recordatorio TIME DEFAULT '20:00:00';

-- Create notification preferences table for general settings
CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  notificaciones_habilitadas BOOLEAN DEFAULT true,
  hora_preferida TIME DEFAULT '20:00:00',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their notification preferences" 
ON public.user_notification_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their notification preferences" 
ON public.user_notification_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their notification preferences" 
ON public.user_notification_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);