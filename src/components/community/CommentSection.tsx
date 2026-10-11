import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Send, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  contenido: string;
  estado: string;
  created_at: string;
  profiles?: {
    nombre: string;
  };
}

interface CommentSectionProps {
  postId: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function CommentSection({ postId, isOpen, onToggle }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadComments();

      // Subscribe to realtime changes
      const channel = supabase
        .channel(`comments-${postId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'post_comments',
            filter: `post_id=eq.${postId}`,
          },
          () => {
            loadComments();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, postId]);

  const loadComments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        profiles (nombre)
      `)
      .eq('post_id', postId)
      .eq('estado', 'publicado')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading comments:', error);
    } else {
      setComments((data as Comment[]) || []);
    }
    setLoading(false);
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Debes iniciar sesión para comentar');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: session.user.id,
        contenido: newComment.trim(),
      });

    if (error) {
      toast.error('Error al publicar comentario');
    } else {
      setNewComment('');
      toast.success('Comentario publicado');
    }
    setSubmitting(false);
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('post_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      toast.error('Error al eliminar comentario');
    } else {
      toast.success('Comentario eliminado');
    }
  };

  const commentCount = comments.length;

  return (
    <div className="space-y-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="gap-2 hover:bg-primary/10"
      >
        <MessageCircle className="w-4 h-4" />
        <span>{commentCount > 0 ? `${commentCount} comentario${commentCount > 1 ? 's' : ''}` : 'Comentar'}</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 overflow-hidden"
          >
            {/* Comment Input */}
            <div className="flex gap-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                rows={2}
                className="flex-1 resize-none bg-background/50"
              />
              <Button
                onClick={submitComment}
                disabled={!newComment.trim() || submitting}
                size="icon"
                className="shrink-0"
                aria-label="Publicar comentario"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Comments List */}
            {loading ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                Cargando comentarios...
              </div>
            ) : comments.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                Sé el primero en comentar
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-3 p-3 rounded-lg bg-muted/30"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {comment.profiles?.nombre?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {comment.profiles?.nombre || 'Usuario'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </span>
                        </div>
                        {currentUserId === comment.user_id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => deleteComment(comment.id)}
                            aria-label="Eliminar comentario"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm mt-1 whitespace-pre-wrap break-words">
                        {comment.contenido}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
