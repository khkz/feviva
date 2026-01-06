import { useState, useEffect } from 'react';
import { Plus, Radio, Calendar, Users, Clock, Play, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface LiveSession {
  id: string;
  titulo: string;
  descripcion: string | null;
  scheduled_at: string;
  duracion_estimada_min: number;
  estado: string;
  max_participants: number;
  categoria: string | null;
  imagen_url: string | null;
  registrations_count?: number;
}

const statusColors = {
  scheduled: 'bg-blue-500/10 text-blue-500',
  live: 'bg-green-500/10 text-green-500',
  ended: 'bg-gray-500/10 text-gray-500',
  cancelled: 'bg-red-500/10 text-red-500'
};

const statusLabels = {
  scheduled: 'Programada',
  live: 'En Vivo',
  ended: 'Finalizada',
  cancelled: 'Cancelada'
};

export const AdminLiveSessions = () => {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSessions = async () => {
    try {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('live_sessions')
        .select('*')
        .order('scheduled_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Get registration counts
      const { data: registrations } = await supabase
        .from('live_session_registrations')
        .select('session_id');

      const countMap: Record<string, number> = {};
      registrations?.forEach(r => {
        countMap[r.session_id] = (countMap[r.session_id] || 0) + 1;
      });

      const sessionsWithCounts = sessionsData?.map(s => ({
        ...s,
        registrations_count: countMap[s.id] || 0
      })) || [];

      setSessions(sessionsWithCounts);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const updateStatus = async (sessionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('live_sessions')
        .update({ estado: newStatus })
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, estado: newStatus } : s
      ));

      toast({
        title: "Éxito",
        description: `Sesión actualizada a ${statusLabels[newStatus as keyof typeof statusLabels]}`
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la sesión",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Sesiones en Vivo</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[150px]" />
          ))}
        </div>
      </div>
    );
  }

  const upcomingSessions = sessions.filter(s => s.estado === 'scheduled');
  const liveSessions = sessions.filter(s => s.estado === 'live');
  const pastSessions = sessions.filter(s => s.estado === 'ended' || s.estado === 'cancelled');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sesiones en Vivo</h1>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Sesión
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{sessions.length}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{upcomingSessions.length}</p>
            <p className="text-sm text-muted-foreground">Programadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{liveSessions.length}</p>
            <p className="text-sm text-muted-foreground">En Vivo</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-500">{pastSessions.length}</p>
            <p className="text-sm text-muted-foreground">Finalizadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Radio className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No hay sesiones programadas</p>
            <Button className="mt-4" disabled>
              <Plus className="h-4 w-4 mr-2" />
              Crear primera sesión
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center shrink-0">
                    {session.imagen_url ? (
                      <img 
                        src={session.imagen_url} 
                        alt={session.titulo}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Radio className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{session.titulo}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {session.descripcion || 'Sin descripción'}
                        </p>
                      </div>
                      <Badge className={statusColors[session.estado as keyof typeof statusColors]}>
                        {statusLabels[session.estado as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(session.scheduled_at).toLocaleDateString('es', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {session.duracion_estimada_min}min
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {session.registrations_count}/{session.max_participants}
                      </span>
                    </div>
                    {session.estado === 'scheduled' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateStatus(session.id, 'live')}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Iniciar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateStatus(session.id, 'cancelled')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    )}
                    {session.estado === 'live' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => updateStatus(session.id, 'ended')}
                      >
                        Finalizar Sesión
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
