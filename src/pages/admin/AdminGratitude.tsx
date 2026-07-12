import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  FileText,
  Edit,
  ChevronDown
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

interface GratitudeSession {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
  descripcion_original: string | null;
  regenerated_at: string | null;
  audio_url: string | null;
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
  
  // Sessions list state
  const [sessions, setSessions] = useState<GratitudeSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [editingSession, setEditingSession] = useState<GratitudeSession | null>(null);
  const [editedDescription, setEditedDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [regeneratingIndividual, setRegeneratingIndividual] = useState(false);

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

  // Encolar TODO en la cola de processing_jobs; el cron (tick_process_jobs)
  // los procesa en background con el mismo pipeline nuevo (gpt-4o-mini-tts,
  // limpieza de HTML, chunking).
  const enqueueAllGratitudeTTS = async () => {
    try {
      const { data: sessions, error } = await supabase
        .from('gratitude_sessions')
        .select('id, numero, titulo')
        .is('audio_url', null)
        .order('numero');
      if (error) throw error;
      if (!sessions || sessions.length === 0) {
        toast.info('Todas las sesiones ya tienen audio');
        return;
      }
      const rows = sessions.map((s) => ({
        job_type: 'gratitude_tts',
        target_table: 'gratitude_sessions',
        target_id: s.id,
        target_title: `Gratitud #${s.numero}: ${s.titulo}`,
        status: 'pending',
        max_attempts: 3,
      }));
      const { error: insErr } = await supabase.from('processing_jobs').insert(rows);
      if (insErr) throw insErr;
      toast.success(`Encoladas ${rows.length} sesiones. El cron las procesa en segundo plano (~1/min).`);
      await fetchStats();
    } catch (err) {
      console.error(err);
      toast.error('Error encolando: ' + (err instanceof Error ? err.message : String(err)));
    }
  };


  const regenerateContent = async () => {
    setRegeneratingContent(true);

    try {
      const { data, error } = await supabase.functions.invoke('regenerate-gratitude-content', {
        body: { batchSize: 20 }
      });

      if (error) throw error;

      if (data.results) {
        // Append results instead of replacing
        setContentResults(prev => [...prev, ...data.results]);
      }

      const successCount = data.results?.filter((r: ContentResult) => r.status === 'success').length || 0;
      toast.success(`${successCount} reflexiones regeneradas. Quedan ${data.remaining} pendientes.`);
      await fetchStats();
    } catch (err) {
      console.error('Error regenerating content:', err);
      toast.error('Error al regenerar contenido');
    } finally {
      setRegeneratingContent(false);
    }
  };

  const clearContentResults = () => {
    setContentResults([]);
  };

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const { data, error } = await supabase
        .from('gratitude_sessions')
        .select('id, numero, titulo, descripcion, descripcion_original, regenerated_at, audio_url')
        .order('numero', { ascending: true });
      
      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      toast.error('Error al cargar sesiones');
    } finally {
      setLoadingSessions(false);
    }
  };

  const saveSession = async () => {
    if (!editingSession) return;
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('gratitude_sessions')
        .update({ 
          descripcion: editedDescription,
          regenerated_at: new Date().toISOString() 
        })
        .eq('id', editingSession.id);
      
      if (error) throw error;
      
      setSessions(prev => prev.map(s => 
        s.id === editingSession.id 
          ? { ...s, descripcion: editedDescription, regenerated_at: new Date().toISOString() }
          : s
      ));
      
      setEditingSession(null);
      toast.success('Sesión actualizada');
    } catch (err) {
      console.error('Error saving session:', err);
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const regenerateIndividualSession = async () => {
    if (!editingSession) return;
    setRegeneratingIndividual(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('regenerate-gratitude-content', {
        body: { sessionId: editingSession.id }
      });

      if (error) throw error;
      
      if (data.results?.[0]?.status === 'success') {
        // Get updated content
        const { data: updated } = await supabase
          .from('gratitude_sessions')
          .select('descripcion, regenerated_at')
          .eq('id', editingSession.id)
          .single();
        
        if (updated) {
          setEditedDescription(updated.descripcion);
          setEditingSession({
            ...editingSession,
            descripcion: updated.descripcion,
            regenerated_at: updated.regenerated_at
          });
          setSessions(prev => prev.map(s => 
            s.id === editingSession.id 
              ? { ...s, descripcion: updated.descripcion, regenerated_at: updated.regenerated_at }
              : s
          ));
        }
        toast.success('Contenido regenerado exitosamente');
      } else {
        toast.error(data.results?.[0]?.error || 'Error al regenerar');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al regenerar contenido');
    } finally {
      setRegeneratingIndividual(false);
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
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Ver Contenido
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Regenerar
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Audio
          </TabsTrigger>
        </TabsList>

        {/* List Sessions Tab */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Contenido de Sesiones
                </CardTitle>
                <CardDescription>
                  {sessions.length > 0 
                    ? `${sessions.length} sesiones | ${sessions.filter(s => s.regenerated_at).length} regeneradas con IA`
                    : 'Click en Cargar para ver las sesiones'}
                </CardDescription>
              </div>
              <Button onClick={fetchSessions} variant="outline" size="sm" disabled={loadingSessions}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingSessions ? 'animate-spin' : ''}`} />
                {sessions.length > 0 ? 'Actualizar' : 'Cargar'}
              </Button>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 && !loadingSessions ? (
                <div className="text-center py-8 text-muted-foreground">
                  Presiona "Cargar" para ver las sesiones de gratitud
                </div>
              ) : (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-3">
                    {sessions.map(session => (
                      <div 
                        key={session.id} 
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{session.numero}</Badge>
                            <span className="font-semibold">{session.titulo}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {session.regenerated_at && (
                              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                <Sparkles className="h-3 w-3 mr-1" />
                                IA
                              </Badge>
                            )}
                            {session.audio_url && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                <Volume2 className="h-3 w-3 mr-1" />
                                Audio
                              </Badge>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setEditingSession(session);
                                setEditedDescription(session.descripcion);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {session.descripcion}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
                      Procesando grupo de 20...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Regenerar próximas 20 ({originalContent} pendientes)
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
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Resultados de Regeneración</CardTitle>
                  <CardDescription>
                    {contentResults.filter(r => r.status === 'success').length} éxitos, 
                    {' '}{contentResults.filter(r => r.status === 'error').length} errores
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={clearContentResults}>
                  Limpiar
                </Button>
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

              {withoutAudio > 0 && (
                <Button
                  onClick={enqueueAllGratitudeTTS}
                  variant="secondary"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  🚀 Encolar TODAS ({withoutAudio}) en la cola del cron
                </Button>
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

      {/* Edit Session Dialog */}
      <Dialog open={!!editingSession} onOpenChange={() => setEditingSession(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge variant="outline">{editingSession?.numero}</Badge>
              {editingSession?.titulo}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Descripción / Reflexión</Label>
              <Textarea 
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
            </div>
            
            {editingSession?.descripcion_original && (
              <Collapsible>
                <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronDown className="h-4 w-4" />
                  Ver descripción original
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <p className="text-sm bg-muted p-3 rounded mt-2 whitespace-pre-wrap">
                    {editingSession.descripcion_original}
                  </p>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="secondary" 
              onClick={regenerateIndividualSession} 
              disabled={regeneratingIndividual || saving}
              className="bg-purple-100 hover:bg-purple-200 text-purple-700"
            >
              {regeneratingIndividual ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Regenerando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Regenerar con IA
                </>
              )}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditingSession(null)}>
                Cancelar
              </Button>
              <Button onClick={saveSession} disabled={saving || regeneratingIndividual}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar'
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGratitude;
