import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useUserStats } from "@/hooks/useUserStats";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Plus, 
  MessageSquare, 
  Users,
  TrendingUp,
  Loader2,
  Flame,
  UserPlus
} from "lucide-react";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

interface EvangelizationLog {
  id: string;
  fecha: string;
  tipo: string;
  descripcion: string;
  persona_nombre: string | null;
  resultado: string | null;
  seguimiento_necesario: boolean;
  created_at: string;
}

const Mission = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addPoints } = useUserStats();
  
  const [logs, setLogs] = useState<EvangelizationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Form states
  const [tipo, setTipo] = useState('conversacion');
  const [descripcion, setDescripcion] = useState('');
  const [personaNombre, setPersonaNombre] = useState('');
  const [resultado, setResultado] = useState('neutral');
  const [seguimientoNecesario, setSeguimientoNecesario] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('evangelization_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('fecha', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!descripcion.trim()) {
      toast({
        title: "Descripción requerida",
        description: "Por favor describe tu experiencia de evangelización.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      const { error } = await supabase
        .from('evangelization_logs')
        .insert({
          user_id: user.id,
          fecha: new Date().toISOString().split('T')[0],
          tipo,
          descripcion,
          persona_nombre: personaNombre || null,
          resultado,
          seguimiento_necesario: seguimientoNecesario
        });

      if (error) throw error;

      await addPoints(25, 'Evangelización registrada');
      
      toast({
        title: "¡Registrado!",
        description: "+25 puntos. ¡Gracias por compartir tu fe!",
      });

      // Reset form
      setDescripcion('');
      setPersonaNombre('');
      setResultado('neutral');
      setSeguimientoNecesario(false);
      setShowForm(false);
      fetchLogs();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el registro.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate stats
  const totalLogs = logs.length;
  const thisMonthLogs = logs.filter(l => {
    const logDate = new Date(l.fecha);
    const now = new Date();
    return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
  }).length;
  const needsFollowUp = logs.filter(l => l.seguimiento_necesario).length;
  
  // Calculate streak
  const calculateStreak = () => {
    if (logs.length === 0) return 0;
    
    const sortedDates = [...new Set(logs.map(l => l.fecha))].sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
    
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = today;
    
    for (const date of sortedDates) {
      if (date === currentDate) {
        streak++;
        const prevDate = new Date(currentDate);
        prevDate.setDate(prevDate.getDate() - 1);
        currentDate = prevDate.toISOString().split('T')[0];
      } else if (date < currentDate) {
        break;
      }
    }
    
    return streak;
  };
  
  const streak = calculateStreak();

  const getTipoLabel = (t: string) => {
    switch (t) {
      case 'conversacion': return 'Conversación';
      case 'invitacion': return 'Invitación';
      case 'testimonio': return 'Testimonio';
      case 'servicio': return 'Servicio';
      default: return t;
    }
  };

  const getResultadoColor = (r: string | null) => {
    switch (r) {
      case 'positivo': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'neutral': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      case 'dificil': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <DesktopSidebar />
      <div className="flex-1 lg:ml-64 pb-20 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="lg:hidden">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <h1 className="font-semibold">Misión y Evangelización</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-background">
            <CardContent className="pt-4 text-center">
              <Flame className="h-6 w-6 mx-auto mb-1 text-orange-500" />
              <p className="text-2xl font-bold text-primary">{streak}</p>
              <p className="text-xs text-muted-foreground">Días de racha</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <MessageSquare className="h-6 w-6 mx-auto mb-1 text-blue-500" />
              <p className="text-2xl font-bold">{thisMonthLogs}</p>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-1 text-green-500" />
              <p className="text-2xl font-bold">{totalLogs}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <UserPlus className="h-6 w-6 mx-auto mb-1 text-purple-500" />
              <p className="text-2xl font-bold">{needsFollowUp}</p>
              <p className="text-xs text-muted-foreground">Seguimiento</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            Registrar conversación
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/coach')}
          >
            Practicar con Coach
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Nueva experiencia de evangelización
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de interacción</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conversacion">Conversación de fe</SelectItem>
                    <SelectItem value="invitacion">Invitación a la iglesia</SelectItem>
                    <SelectItem value="testimonio">Compartir testimonio</SelectItem>
                    <SelectItem value="servicio">Acto de servicio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>¿Qué pasó?</Label>
                <Textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe brevemente tu experiencia..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre de la persona (opcional)</Label>
                  <Input
                    value={personaNombre}
                    onChange={(e) => setPersonaNombre(e.target.value)}
                    placeholder="Ej: Juan"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Resultado</Label>
                  <Select value={resultado} onValueChange={setResultado}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positivo">Positivo 😊</SelectItem>
                      <SelectItem value="neutral">Neutral 😐</SelectItem>
                      <SelectItem value="dificil">Difícil 😔</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="seguimiento">¿Necesita seguimiento?</Label>
                <Switch
                  id="seguimiento"
                  checked={seguimientoNecesario}
                  onCheckedChange={setSeguimientoNecesario}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Logs List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Historial de evangelización
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay registros aún</p>
                <p className="text-sm">¡Empieza a compartir tu fe!</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3 pr-4">
                  {logs.map((log) => (
                    <Card key={log.id} className={log.seguimiento_necesario ? 'border-purple-200 dark:border-purple-800' : ''}>
                      <CardContent className="pt-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{getTipoLabel(log.tipo)}</Badge>
                            <Badge className={getResultadoColor(log.resultado)}>
                              {log.resultado === 'positivo' ? '😊' : log.resultado === 'dificil' ? '😔' : '😐'}
                            </Badge>
                            {log.seguimiento_necesario && (
                              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                Seguimiento
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.fecha).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        
                        {log.persona_nombre && (
                          <p className="text-sm font-medium text-primary">
                            👤 {log.persona_nombre}
                          </p>
                        )}
                        
                        <p className="text-sm text-foreground">{log.descripcion}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <CardTitle className="text-lg">💡 Guías rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-background/80 p-3 rounded-lg">
              <p className="font-medium text-sm mb-1">Iniciar una conversación</p>
              <p className="text-xs text-muted-foreground">
                "¿Puedo preguntarte algo personal? ¿Qué opinas sobre la vida después de la muerte?"
              </p>
            </div>
            <div className="bg-background/80 p-3 rounded-lg">
              <p className="font-medium text-sm mb-1">Cuando no saben responder</p>
              <p className="text-xs text-muted-foreground">
                "Es una pregunta importante. ¿Te gustaría explorarla juntos?"
              </p>
            </div>
            <div className="bg-background/80 p-3 rounded-lg">
              <p className="font-medium text-sm mb-1">Ante el rechazo</p>
              <p className="text-xs text-muted-foreground">
                "Entiendo y respeto tu posición. Si algún día quieres hablar, aquí estaré."
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      <BottomNavigation />
      </div>
    </div>
  );
};

export default Mission;
