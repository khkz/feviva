-- Sistema de referidos y recompensas
-- 1. Tabla de códigos de referido únicos por usuario
CREATE TABLE public.user_referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  code VARCHAR(12) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. Tabla de referidos completados (tracking de invitaciones)
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL UNIQUE, -- cada usuario solo puede ser referido una vez
  code_used VARCHAR(12) NOT NULL,
  points_awarded INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_referrer FOREIGN KEY (referrer_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_referred FOREIGN KEY (referred_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 3. Agregar columna referral_code a profiles para tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referred_by VARCHAR(12),
ADD COLUMN IF NOT EXISTS referral_points INTEGER DEFAULT 0;

-- 4. Enable RLS
ALTER TABLE public.user_referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies para user_referral_codes
CREATE POLICY "Users can view their own referral code"
ON public.user_referral_codes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral code"
ON public.user_referral_codes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Permitir lectura de códigos por cualquier usuario autenticado (para validar códigos)
CREATE POLICY "Authenticated users can lookup referral codes"
ON public.user_referral_codes
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 6. RLS Policies para referrals
CREATE POLICY "Users can view referrals where they are the referrer"
ON public.referrals
FOR SELECT
USING (auth.uid() = referrer_id);

CREATE POLICY "Authenticated users can create referrals"
ON public.referrals
FOR INSERT
WITH CHECK (auth.uid() = referred_id);

-- 7. Función para generar código único de referido
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS VARCHAR AS $$
DECLARE
  new_code VARCHAR(8);
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generar código alfanumérico de 8 caracteres
    new_code := UPPER(SUBSTRING(MD5(gen_random_uuid()::TEXT) FROM 1 FOR 8));
    
    -- Verificar si ya existe
    SELECT EXISTS(SELECT 1 FROM public.user_referral_codes WHERE code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. Función para obtener o crear código de referido del usuario
CREATE OR REPLACE FUNCTION public.get_or_create_referral_code(p_user_id UUID)
RETURNS VARCHAR AS $$
DECLARE
  existing_code VARCHAR(12);
  new_code VARCHAR(12);
BEGIN
  -- Buscar código existente
  SELECT code INTO existing_code 
  FROM public.user_referral_codes 
  WHERE user_id = p_user_id;
  
  IF existing_code IS NOT NULL THEN
    RETURN existing_code;
  END IF;
  
  -- Generar nuevo código
  new_code := generate_referral_code();
  
  -- Insertar código
  INSERT INTO public.user_referral_codes (user_id, code)
  VALUES (p_user_id, new_code);
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. Función para procesar un referido (otorgar puntos)
CREATE OR REPLACE FUNCTION public.process_referral(
  p_referred_id UUID,
  p_referral_code VARCHAR(12)
)
RETURNS JSON AS $$
DECLARE
  v_referrer_id UUID;
  v_points INTEGER := 100; -- Puntos por referido
BEGIN
  -- Verificar que el código existe y obtener el referrer
  SELECT user_id INTO v_referrer_id
  FROM public.user_referral_codes
  WHERE code = UPPER(p_referral_code);
  
  IF v_referrer_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Código no válido');
  END IF;
  
  -- No permitir auto-referidos
  IF v_referrer_id = p_referred_id THEN
    RETURN json_build_object('success', false, 'error', 'No puedes usar tu propio código');
  END IF;
  
  -- Verificar que el usuario no haya sido referido antes
  IF EXISTS(SELECT 1 FROM public.referrals WHERE referred_id = p_referred_id) THEN
    RETURN json_build_object('success', false, 'error', 'Ya has usado un código de referido');
  END IF;
  
  -- Registrar el referido
  INSERT INTO public.referrals (referrer_id, referred_id, code_used, points_awarded)
  VALUES (v_referrer_id, p_referred_id, UPPER(p_referral_code), v_points);
  
  -- Actualizar puntos del referrer
  UPDATE public.profiles
  SET referral_points = COALESCE(referral_points, 0) + v_points
  WHERE id = v_referrer_id;
  
  -- Actualizar user_stats del referrer
  UPDATE public.user_stats
  SET puntos_totales = puntos_totales + v_points
  WHERE user_id = v_referrer_id;
  
  -- Marcar que el usuario fue referido
  UPDATE public.profiles
  SET referred_by = UPPER(p_referral_code)
  WHERE id = p_referred_id;
  
  RETURN json_build_object(
    'success', true, 
    'points_awarded', v_points,
    'referrer_id', v_referrer_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 10. Vista para leaderboard de referidos
CREATE OR REPLACE VIEW public.referral_leaderboard AS
SELECT 
  p.id,
  p.nombre,
  p.avatar_url,
  COALESCE(p.referral_points, 0) as referral_points,
  COUNT(r.id) as total_referrals,
  RANK() OVER (ORDER BY COALESCE(p.referral_points, 0) DESC, COUNT(r.id) DESC) as rank
FROM public.profiles p
LEFT JOIN public.referrals r ON r.referrer_id = p.id
GROUP BY p.id, p.nombre, p.avatar_url, p.referral_points
HAVING COUNT(r.id) > 0 OR COALESCE(p.referral_points, 0) > 0
ORDER BY referral_points DESC, total_referrals DESC
LIMIT 100;

-- 11. Índices para performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(code_used);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.user_referral_codes(code);