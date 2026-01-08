-- Create post_comments table
CREATE TABLE public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  contenido TEXT NOT NULL,
  estado content_estado NOT NULL DEFAULT 'publicado',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Users can view published comments on published posts
CREATE POLICY "Anyone can view published comments"
ON public.post_comments
FOR SELECT
USING (
  estado = 'publicado' AND 
  EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND estado = 'publicado')
);

-- Users can create comments on published posts
CREATE POLICY "Users can create comments"
ON public.post_comments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND estado = 'publicado')
);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
ON public.post_comments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
ON public.post_comments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Moderators can view all comments
CREATE POLICY "Moderators can view all comments"
ON public.post_comments
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'moderator') OR has_role(auth.uid(), 'admin'));

-- Moderators can update any comment (for moderation)
CREATE POLICY "Moderators can update any comment"
ON public.post_comments
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'moderator') OR has_role(auth.uid(), 'admin'));

-- Moderators can delete any comment
CREATE POLICY "Moderators can delete any comment"
ON public.post_comments
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'moderator') OR has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_post_comments_updated_at
BEFORE UPDATE ON public.post_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;