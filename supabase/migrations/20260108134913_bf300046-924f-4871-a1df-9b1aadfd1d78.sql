-- Los moderadores pueden ver TODOS los posts (incluidos borradores)
CREATE POLICY "Moderators can view all posts"
ON public.posts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

-- Los moderadores pueden actualizar cualquier post (moderar)
CREATE POLICY "Moderators can update any post"
ON public.posts
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

-- Los moderadores pueden eliminar posts
CREATE POLICY "Moderators can delete any post"
ON public.posts
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));