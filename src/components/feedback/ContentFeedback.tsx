import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useContentFeedback } from '@/hooks/useContentFeedback';
import { cn } from '@/lib/utils';

interface ContentFeedbackProps {
  contentType: string;
  contentId: string;
  showComment?: boolean;
  className?: string;
}

export const ContentFeedback = ({ 
  contentType, 
  contentId, 
  showComment = false,
  className 
}: ContentFeedbackProps) => {
  const { feedback, loading, submitting, submitFeedback } = useContentFeedback(contentType, contentId);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState('');

  if (loading) return null;

  const handleRating = async (rating: number) => {
    if (showComment && rating === 1 && !showCommentInput) {
      setShowCommentInput(true);
      return;
    }
    await submitFeedback(rating, comment || undefined);
    setShowCommentInput(false);
    setComment('');
  };

  const handleCommentSubmit = async () => {
    await submitFeedback(1, comment);
    setShowCommentInput(false);
    setComment('');
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground mr-2">¿Te gustó?</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRating(5)}
          disabled={submitting}
          className={cn(
            "h-8 w-8 p-0",
            feedback.rating === 5 && "bg-green-500/20 text-green-500"
          )}
        >
          <ThumbsUp className={cn("h-4 w-4", feedback.rating === 5 && "fill-current")} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRating(1)}
          disabled={submitting}
          className={cn(
            "h-8 w-8 p-0",
            feedback.rating === 1 && "bg-red-500/20 text-red-500"
          )}
        >
          <ThumbsDown className={cn("h-4 w-4", feedback.rating === 1 && "fill-current")} />
        </Button>
        {showComment && !showCommentInput && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCommentInput(true)}
            className="h-8 w-8 p-0"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showCommentInput && (
        <div className="flex flex-col gap-2 mt-2">
          <Textarea
            placeholder="¿Qué podríamos mejorar?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleCommentSubmit}
              disabled={submitting}
            >
              Enviar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowCommentInput(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
