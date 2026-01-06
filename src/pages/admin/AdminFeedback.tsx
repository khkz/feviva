import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Check, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FeedbackItem {
  id: string;
  user_id: string;
  content_type: string;
  content_id: string;
  rating: number;
  comentario: string | null;
  leido: boolean;
  created_at: string;
  user_name?: string;
}

const contentTypeLabels: Record<string, string> = {
  sleep_story: 'Historia de Sueño',
  novena: 'Novena',
  lesson: 'Lección',
  oracion: 'Oración',
  movie: 'Película',
  course: 'Curso'
};

export const AdminFeedback = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { toast } = useToast();

  const fetchFeedback = async () => {
    try {
      let query = supabase
        .from('content_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'positive') {
        query = query.eq('rating', 5);
      } else if (filter === 'negative') {
        query = query.eq('rating', 1);
      } else if (filter === 'unread') {
        query = query.eq('leido', false);
      }

      if (typeFilter !== 'all') {
        query = query.eq('content_type', typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch user names
      const userIds = [...new Set(data?.map(f => f.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nombre')
        .in('id', userIds);

      const feedbackWithNames = data?.map(f => ({
        ...f,
        user_name: profiles?.find(p => p.id === f.user_id)?.nombre || 'Usuario'
      })) || [];

      setFeedback(feedbackWithNames);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el feedback",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [filter, typeFilter]);

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('content_feedback')
        .update({ leido: true })
        .eq('id', id);
      
      setFeedback(prev => prev.map(f => 
        f.id === id ? { ...f, leido: true } : f
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const stats = {
    total: feedback.length,
    positive: feedback.filter(f => f.rating === 5).length,
    negative: feedback.filter(f => f.rating === 1).length,
    unread: feedback.filter(f => !f.leido).length
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Feedback</h1>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Feedback de Usuarios</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer" onClick={() => setFilter('all')}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => setFilter('positive')}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{stats.positive}</p>
            <p className="text-sm text-muted-foreground">Positivos</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => setFilter('negative')}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{stats.negative}</p>
            <p className="text-sm text-muted-foreground">Negativos</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => setFilter('unread')}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{stats.unread}</p>
            <p className="text-sm text-muted-foreground">Sin leer</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Tipo de contenido" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="sleep_story">Historias de Sueño</SelectItem>
            <SelectItem value="novena">Novenas</SelectItem>
            <SelectItem value="lesson">Lecciones</SelectItem>
            <SelectItem value="oracion">Oraciones</SelectItem>
            <SelectItem value="movie">Películas</SelectItem>
            <SelectItem value="course">Cursos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {feedback.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No hay feedback que mostrar
            </CardContent>
          </Card>
        ) : (
          feedback.map((item) => (
            <Card 
              key={item.id} 
              className={cn(!item.leido && "border-l-4 border-l-primary")}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={cn(
                      "p-2 rounded-full shrink-0",
                      item.rating === 5 ? "bg-green-500/10" : "bg-red-500/10"
                    )}>
                      {item.rating === 5 ? (
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <ThumbsDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{item.user_name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {contentTypeLabels[item.content_type] || item.content_type}
                        </Badge>
                        {!item.leido && (
                          <Badge className="bg-primary/10 text-primary text-xs">Nuevo</Badge>
                        )}
                      </div>
                      {item.comentario && (
                        <p className="text-sm text-muted-foreground flex items-start gap-1">
                          <MessageSquare className="h-4 w-4 shrink-0 mt-0.5" />
                          {item.comentario}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!item.leido && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => markAsRead(item.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
