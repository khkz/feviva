import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type CommentEstado = 'borrador' | 'revisado' | 'publicado';

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  contenido: string;
  estado: CommentEstado;
  created_at: string;
  updated_at: string;
  profiles?: {
    nombre: string;
    email: string;
  };
  posts?: {
    tipo: string;
    contenido: string;
  };
}

export function useCommentModeration() {
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['admin-comments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          profiles (nombre, email),
          posts (tipo, contenido)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as Comment[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, estado }: { id: string; estado: CommentEstado }) => {
      const { error } = await supabase
        .from('post_comments')
        .update({ estado })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      toast.success('Comentario actualizado');
    },
    onError: () => {
      toast.error('Error al actualizar el comentario');
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('post_comments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      toast.success('Comentario eliminado');
    },
    onError: () => {
      toast.error('Error al eliminar el comentario');
    },
  });

  return {
    comments,
    isLoading,
    updateStatus,
    deleteComment,
  };
}
