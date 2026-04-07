import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Play,
  Volume2,
  FileText
} from 'lucide-react';
import { format, subDays, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { DailyContentViewer } from '@/components/admin/DailyContentViewer';

interface DailyContentRecord {
  id: string;
  fecha: string;
  versiculo_referencia: string;
  versiculo_texto: string;
  reflexion_ia: string;
  tip_apologetico: string;
  oracion_laudes: string;
  oracion_completas: string;
  ensenanza_titulo: string | null;
  ensenanza_contenido: string | null;
  audio_versiculo_url: string | null;
  audio_ensenanza_url: string | null;
  audio_reflexion_url: string | null;
  audio_laudes_url: string | null;
  audio_completas_url: string | null;
  audio_tip_url: string | null;
  created_at: string | null;
}

interface ContentDay {
  date: string;
  content: DailyContentRecord | null;
  status: 'generated' | 'pending' | 'missing';
}

export const AdminDailyContent = () => {
  const [days, setDays] = useState<ContentDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [regeneratingAudio, setRegeneratingAudio] = useState(false);

  // Count days with missing audio
  const daysWithMissingAudio = days.filter(day => {
    if (!day.content) return false;
    return !day.content.audio_reflexion_url || 
           !day.content.audio_laudes_url || 
           !day.content.audio_completas_url || 
           !day.content.audio_tip_url;
  }).length;

  const regenerateMissingAudio = async () => {
    setRegeneratingAudio(true);
    try {
      const { data, error } = await supabase.functions.invoke('regenerate-daily-audio', {
        body: {}
      });

      if (error) throw error;

      toast.success(`${data.totalAudios} audios generados para ${data.processed} días`);
      await fetchContentHistory();
    } catch (err) {
      console.error('Error regenerating audio:', err);
      toast.error('Error al regenerar audios');
    } finally {
      setRegeneratingAudio(false);
    }
  };

  const fetchContentHistory = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const dates: string[] = [];
      
      // Last 7 days + today + next 3 days
      for (let i = 7; i >= -3; i--) {
        const date = i >= 0 ? subDays(today, i) : addDays(today, Math.abs(i));
        dates.push(format(date, 'yyyy-MM-dd'));
      }

      const { data, error } = await supabase
        .from('daily_content')
        .select('*')
        .in('fecha', dates)
        .order('fecha', { ascending: false });

      if (error) throw error;

      const contentMap = new Map<string, DailyContentRecord>();
      (data || []).forEach((record) => {
        contentMap.set(record.fecha, record as DailyContentRecord);
      });

      const todayStr = format(today, 'yyyy-MM-dd');
      const contentDays: ContentDay[] = dates.map(date => {
        const content = contentMap.get(date) || null;
        let status: 'generated' | 'pending' | 'missing';
        
        if (content) {
          status = 'generated';
        } else if (date >= todayStr) {
          status = 'pending';
        } else {
          status = 'missing';
        }
        
        return { date, content, status };
      });

      setDays(contentDays);
    } catch (err) {
      console.error('Error fetching content history:', err);
      toast.error('Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async (date: string) => {
    setGenerating(date);
    try {
      const { data, error } = await supabase.functions.invoke('generate-daily-content', {
        body: { fecha: date }
      });

      if (error) throw error;

      toast.success(`Contenido generado para ${format(new Date(date), 'dd MMM yyyy', { locale: es })}`);
      await fetchContentHistory();
    } catch (err) {
      console.error('Error generating content:', err);
      toast.error('Error al generar contenido');
    } finally {
      setGenerating(null);
    }
  };

  useEffect(() => {
    fetchContentHistory();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'generated':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Generado</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendiente</Badge>;
      case 'missing':
        return <Badge variant="destructive">Faltante</Badge>;
      default:
        return null;
    }
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Contenido Diario</h1>
          <p className="text-muted-foreground">
            Monitor del cron job y generación de contenido diario
          </p>
        </div>
        <div className="flex items-center gap-2">
          {daysWithMissingAudio > 0 && (
            <Button 
              onClick={regenerateMissingAudio} 
              variant="default" 
              size="sm"
              disabled={regeneratingAudio}
            >
              {regeneratingAudio ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Volume2 className="h-4 w-4 mr-2" />
              )}
              Regenerar Audios ({daysWithMissingAudio})
            </Button>
          )}
          <Button onClick={fetchContentHistory} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Cron Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Estado del Cron Job
          </CardTitle>
          <CardDescription>
            El contenido se genera automáticamente a las 00:05 UTC cada día
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-accent/50">
              <div className="text-sm text-muted-foreground">Programación</div>
              <div className="text-lg font-semibold">00:05 UTC diario</div>
            </div>
            <div className="p-4 rounded-lg bg-accent/50">
              <div className="text-sm text-muted-foreground">Nombre del Job</div>
              <div className="text-lg font-semibold font-mono text-xs md:text-sm">generate-daily-content-midnight</div>
            </div>
            <div className="p-4 rounded-lg bg-accent/50">
              <div className="text-sm text-muted-foreground">Función Edge</div>
              <div className="text-lg font-semibold font-mono text-xs md:text-sm">generate-daily-content</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historial de Contenido (Últimos 7 días + Próximos 3)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {days.map((day) => (
                <div 
                  key={day.date} 
                  className={`p-4 rounded-lg border ${
                    day.date === todayStr ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">
                          {format(new Date(day.date), "EEEE, d 'de' MMMM", { locale: es })}
                        </span>
                        {day.date === todayStr && (
                          <Badge variant="outline" className="text-xs">Hoy</Badge>
                        )}
                        {getStatusBadge(day.status)}
                      </div>
                      
                      {day.content && (
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <FileText className="h-3 w-3" />
                            <span className="truncate max-w-md">
                              {day.content.versiculo_referencia}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {day.content.audio_versiculo_url && (
                              <Badge variant="outline" className="text-green-600 border-green-600/30">
                                <Volume2 className="h-3 w-3 mr-1" />
                                Versículo
                              </Badge>
                            )}
                            {day.content.audio_reflexion_url && (
                              <Badge variant="outline" className="text-green-600 border-green-600/30">
                                <Volume2 className="h-3 w-3 mr-1" />
                                Reflexión
                              </Badge>
                            )}
                            {day.content.audio_laudes_url && (
                              <Badge variant="outline" className="text-green-600 border-green-600/30">
                                <Volume2 className="h-3 w-3 mr-1" />
                                Laudes
                              </Badge>
                            )}
                            {day.content.audio_completas_url && (
                              <Badge variant="outline" className="text-green-600 border-green-600/30">
                                <Volume2 className="h-3 w-3 mr-1" />
                                Completas
                              </Badge>
                            )}
                            {day.content.audio_tip_url && (
                              <Badge variant="outline" className="text-green-600 border-green-600/30">
                                <Volume2 className="h-3 w-3 mr-1" />
                                Tip
                              </Badge>
                            )}
                            {day.content.audio_ensenanza_url && (
                              <Badge variant="outline" className="text-green-600 border-green-600/30">
                                <Volume2 className="h-3 w-3 mr-1" />
                                Enseñanza
                              </Badge>
                            )}
                          </div>
                          {day.content.created_at && (
                            <div className="text-xs text-muted-foreground">
                              Generado: {format(new Date(day.content.created_at), 'HH:mm:ss')}
                            </div>
                          )}
                          <DailyContentViewer 
                            content={day.content}
                            dateLabel={format(new Date(day.date), "d 'de' MMMM", { locale: es })}
                          />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {day.status === 'generated' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : day.status === 'missing' ? (
                        <>
                          <XCircle className="h-5 w-5 text-destructive" />
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => generateContent(day.date)}
                            disabled={generating === day.date}
                          >
                            {generating === day.date ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-1" />
                                Generar
                              </>
                            )}
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => generateContent(day.date)}
                          disabled={generating === day.date}
                        >
                          {generating === day.date ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-1" />
                              Pre-generar
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDailyContent;
