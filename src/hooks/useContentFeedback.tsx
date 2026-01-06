import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FeedbackData {
  rating: number | null;
  comentario: string | null;
}

export const useContentFeedback = (contentType: string, contentId: string) => {
  const [feedback, setFeedback] = useState<FeedbackData>({ rating: null, comentario: null });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchFeedback = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('content_feedback')
        .select('rating, comentario')
        .eq('user_id', user.id)
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .maybeSingle();

      if (data) {
        setFeedback({ rating: data.rating, comentario: data.comentario });
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  }, [contentType, contentId]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const submitFeedback = async (rating: number, comentario?: string) => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para dar feedback",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase
        .from('content_feedback')
        .upsert({
          user_id: user.id,
          content_type: contentType,
          content_id: contentId,
          rating,
          comentario: comentario || null
        }, {
          onConflict: 'user_id,content_type,content_id'
        });

      if (error) throw error;

      setFeedback({ rating, comentario: comentario || null });
      toast({
        title: "¡Gracias!",
        description: "Tu feedback ha sido registrado"
      });
      return true;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar tu feedback",
        variant: "destructive"
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { feedback, loading, submitting, submitFeedback };
};
