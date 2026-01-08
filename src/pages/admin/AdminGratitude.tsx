import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  Heart, 
  Volume2, 
  RefreshCw, 
  Play,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface GenerationResult {
  numero: number;
  titulo: string;
  status: 'success' | 'error';
  audioUrl?: string;
  error?: string;
}

export const AdminGratitude = () => {
  const [totalSessions, setTotalSessions] = useState(0);
  const [withAudio, setWithAudio] = useState(0);
  const [withoutAudio, setWithoutAudio] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [results, setResults] = useState<GenerationResult[]>([]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { count: total } = await supabase
        .from('gratitude_sessions')
        .select('*', { count: 'exact', head: true });

      const { count: noAudio } = await supabase
        .from('gratitude_sessions')
        .select('*', { count: 'exact', head: true })
        .is('audio_url', null);

      setTotalSessions(total || 0);
      setWithoutAudio(noAudio || 0);
      setWithAudio((total || 0) - (noAudio || 0));
    } catch (err) {
      console.error('Error fetching stats:', err);
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const generateAudios = async () => {
    setGenerating(true);
    setResults([]);
    setCurrentBatch(0);

    let hasMore = true;
    let batchNum = 0;
    const allResults: GenerationResult[] = [];

    try {
      while (hasMore) {
        batchNum++;
        setCurrentBatch(batchNum);

        const { data, error } = await supabase.functions.invoke('batch-gratitude-tts', {
          body: { limit: 3 }
        });

        if (error) throw error;

        if (data.results) {
          allResults.push(...data.results);
          setResults([...allResults]);
        }

        hasMore = data.hasMore;

        if (hasMore) {
          // Small delay between batches
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const successCount = allResults.filter(r => r.status === 'success').length;
      toast.success(`${successCount} audios generados exitosamente`);
      await fetchStats();
    } catch (err) {
      console.error('Error generating audios:', err);
      toast.error('Error al generar audios');
    } finally {
      setGenerating(false);
    }
  };

  const progressPercent = totalSessions > 0 ? (withAudio / totalSessions) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sesiones de Gratitud</h1>
          <p className="text-muted-foreground">
            Gestión de las 256 sesiones del diario de gratitud
          </p>
        </div>
        <Button onClick={fetchStats} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Total Sesiones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-green-500" />
              Con Audio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{withAudio}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-orange-500" />
              Sin Audio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{withoutAudio}</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso de Generación de Audio</CardTitle>
          <CardDescription>
            {withAudio} de {totalSessions} sesiones tienen audio narrado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progressPercent} className="h-3" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{Math.round(progressPercent)}% completado</span>
            <span>{withoutAudio} restantes</span>
          </div>

          {withoutAudio > 0 && (
            <Button 
              onClick={generateAudios} 
              disabled={generating}
              className="w-full"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando lote {currentBatch}...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generar {withoutAudio} Audios
                </>
              )}
            </Button>
          )}

          {withoutAudio === 0 && totalSessions > 0 && (
            <div className="flex items-center justify-center gap-2 text-green-600 py-4">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Todos los audios han sido generados</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados de Generación</CardTitle>
            <CardDescription>
              {results.filter(r => r.status === 'success').length} éxitos, 
              {' '}{results.filter(r => r.status === 'error').length} errores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {results.map((result, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    result.status === 'success' 
                      ? 'bg-green-500/10 border border-green-500/20' 
                      : 'bg-red-500/10 border border-red-500/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.status === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium">Sesión {result.numero}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-md">
                        {result.titulo}
                      </div>
                    </div>
                  </div>
                  <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                    {result.status === 'success' ? 'Generado' : 'Error'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminGratitude;
