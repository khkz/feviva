import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  Heart, 
  Volume2, 
  RefreshCw, 
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface GenerationResult {
  numero: number;
  titulo: string;
  status: 'success' | 'error';
  audioUrl?: string;
  error?: string;
}

interface ContentResult {
  numero: number;
  titulo: string;
  status: 'success' | 'error';
  error?: string;
}

export const AdminGratitude = () => {
  // Audio stats
  const [totalSessions, setTotalSessions] = useState(0);
  const [withAudio, setWithAudio] = useState(0);
  const [withoutAudio, setWithoutAudio] = useState(0);
  
  // Content regeneration stats
  const [regeneratedContent, setRegeneratedContent] = useState(0);
  const [originalContent, setOriginalContent] = useState(0);
  
  const [loading, setLoading] = useState(true);
  
  // Audio generation state
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [currentAudioBatch, setCurrentAudioBatch] = useState(0);
  const [audioResults, setAudioResults] = useState<GenerationResult[]>([]);
  
  // Content regeneration state
  const [regeneratingContent, setRegeneratingContent] = useState(false);
  const [currentContentBatch, setCurrentContentBatch] = useState(0);
  const [contentResults, setContentResults] = useState<ContentResult[]>([]);

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

      const { count: regenerated } = await supabase
        .from('gratitude_sessions')
        .select('*', { count: 'exact', head: true })
        .not('regenerated_at', 'is', null);

      setTotalSessions(total || 0);
      setWithoutAudio(noAudio || 0);
      setWithAudio((total || 0) - (noAudio || 0));
      setRegeneratedContent(regenerated || 0);
      setOriginalContent((total || 0) - (regenerated || 0));
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
    setGeneratingAudio(true);
    setAudioResults([]);
    setCurrentAudioBatch(0);

    let hasMore = true;
    let batchNum = 0;
    const allResults: GenerationResult[] = [];

    try {
      while (hasMore) {
        batchNum++;
        setCurrentAudioBatch(batchNum);

        const { data, error } = await supabase.functions.invoke('batch-gratitude-tts', {
          body: { limit: 3 }
        });

        if (error) throw error;

        if (data.results) {
          allResults.push(...data.results);
          setAudioResults([...allResults]);
        }

        hasMore = data.hasMore;

        if (hasMore) {
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
      setGeneratingAudio(false);
    }
  };

  const regenerateContent = async () => {
    setRegeneratingContent(true);
    setContentResults([]);
    setCurrentContentBatch(0);

    let hasMore = true;
    let batchNum = 0;
    const allResults: ContentResult[] = [];

    try {
      while (hasMore) {
        batchNum++;
        setCurrentContentBatch(batchNum);

        const { data, error } = await supabase.functions.invoke('regenerate-gratitude-content', {
          body: { batchSize: 5 }
        });

        if (error) throw error;

        if (data.results) {
          allResults.push(...data.results);
          setContentResults([...allResults]);
        }

        hasMore = data.hasMore;

        if (hasMore) {
          // Longer delay to avoid rate limits with Gemini
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      const successCount = allResults.filter(r => r.status === 'success').length;
      toast.success(`${successCount} reflexiones regeneradas con Gemini 3 Pro`);
      await fetchStats();
    } catch (err) {
      console.error('Error regenerating content:', err);
      toast.error('Error al regenerar contenido');
    } finally {
      setRegeneratingContent(false);
    }
  };

  const audioProgressPercent = totalSessions > 0 ? (withAudio / totalSessions) * 100 : 0;
  const contentProgressPercent = totalSessions > 0 ? (regeneratedContent / totalSessions) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sesiones de Gratitud</h1>
          <p className="text-muted-foreground">
            Gestión de las {totalSessions} sesiones del diario de gratitud
          </p>
        </div>
        <Button onClick={fetchStats} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Total
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
              <Sparkles className="h-4 w-4 text-purple-500" />
              IA Generada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{regeneratedContent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-500" />
              Original
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{originalContent}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Audio and Content */}
      <Tabs defaultValue="content" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Regenerar Contenido
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Generar Audio
          </TabsTrigger>
        </TabsList>

        {/* Content Regeneration Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Regenerar con Gemini 3 Pro
              </CardTitle>
              <CardDescription>
                Genera nuevas reflexiones bíblicas usando inteligencia artificial.
                Las descripciones originales se guardan como backup.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={contentProgressPercent} className="h-3" />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{Math.round(contentProgressPercent)}% regenerado</span>
                <span>{originalContent} pendientes</span>
              </div>

              {originalContent > 0 && (
                <Button 
                  onClick={regenerateContent} 
                  disabled={regeneratingContent}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {regeneratingContent ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Regenerando lote {currentContentBatch}...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Regenerar {originalContent} Reflexiones
                    </>
                  )}
                </Button>
              )}

              {originalContent === 0 && totalSessions > 0 && (
                <div className="flex items-center justify-center gap-2 text-purple-600 py-4">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Todo el contenido ha sido regenerado</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Results */}
          {contentResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resultados de Regeneración</CardTitle>
                <CardDescription>
                  {contentResults.filter(r => r.status === 'success').length} éxitos, 
                  {' '}{contentResults.filter(r => r.status === 'error').length} errores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {contentResults.map((result, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        result.status === 'success' 
                          ? 'bg-purple-500/10 border border-purple-500/20' 
                          : 'bg-red-500/10 border border-red-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {result.status === 'success' ? (
                          <CheckCircle2 className="h-4 w-4 text-purple-500" />
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
                        {result.status === 'success' ? 'Regenerado' : 'Error'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Audio Generation Tab */}
        <TabsContent value="audio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-green-500" />
                Generar Audio con OpenAI TTS
              </CardTitle>
              <CardDescription>
                Genera narraciones de audio para cada sesión de gratitud.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={audioProgressPercent} className="h-3" />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{Math.round(audioProgressPercent)}% completado</span>
                <span>{withoutAudio} restantes</span>
              </div>

              {withoutAudio > 0 && (
                <Button 
                  onClick={generateAudios} 
                  disabled={generatingAudio}
                  className="w-full"
                >
                  {generatingAudio ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generando lote {currentAudioBatch}...
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

          {/* Audio Results */}
          {audioResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resultados de Generación</CardTitle>
                <CardDescription>
                  {audioResults.filter(r => r.status === 'success').length} éxitos, 
                  {' '}{audioResults.filter(r => r.status === 'error').length} errores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {audioResults.map((result, idx) => (
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminGratitude;
