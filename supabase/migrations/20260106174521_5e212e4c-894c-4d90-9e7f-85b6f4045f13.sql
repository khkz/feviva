-- Eliminar políticas RLS actuales que causan recursividad
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;

-- Política: Usuarios pueden ver sus propios roles
CREATE POLICY "Users can view their own roles"
ON user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Política: Admins pueden gestionar todos los roles (usando has_role para evitar recursividad)
CREATE POLICY "Admins can manage all roles"
ON user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));