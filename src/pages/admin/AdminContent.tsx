import { useState, useEffect } from 'react';
import { Moon, Church, BookOpen, Volume2, Image, RefreshCw, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useProcessingJobs } from '@/hooks/useProcessingJobs';
import { JobProgressPanel } from '@/components/processing/JobProgressPanel';

// Available voices for gpt-4o-mini-tts
const VOICES = [
  { value: 'shimmer', label: 'Shimmer', description: 'Cálida, suave (ideal para sueño)' },
  { value: 'nova', label: 'Nova', description: 'Clara, expresiva' },
  { value: 'sage', label: 'Sage', description: 'Contemplativa, sabia (ideal para lecciones)' },
  { value: 'alloy', label: 'Alloy', description: 'Neutral, versátil' },
  { value: 'echo', label: 'Echo', description: 'Profunda, resonante' },
  { value: 'fable', label: 'Fable', description: 'Narrativa, expresiva' },
  { value: 'onyx', label: 'Onyx', description: 'Grave, autoritaria' },
  { value: 'coral', label: 'Coral', description: 'Brillante, amigable' },
  { value: 'ash', label: 'Ash', description: 'Suave, tranquila' },
  { value: 'ballad', label: 'Ballad', description: 'Melódica, emotiva' },
  { value: 'verse', label: 'Verse', description: 'Artística, dramática' },
];

interface ContentItem {
  id: string;
  titulo: string;
  audio_url?: string | null;
  imagen_url?: string | null;
  contenido_enriquecido?: string | null;
  created_at: string;
}

export const AdminContent = () => {
  const [sleepStories, setSleepStories] = useState<ContentItem[]>([]);
  const [novenas, setNovenas] = useState<ContentItem[]>([]);
  const [lessons, setLessons] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegenDialog, setShowRegenDialog] = useState(false);
  const [regenType, setRegenType] = useState<'sleep' | 'lessons'>('sleep');
  const [selectedVoice, setSelectedVoice] = useState('shimmer');
  const [regenCount, setRegenCount] = useState(5);
  const [markPremiumDialog, setMarkPremiumDialog] = useState<{ open: boolean; item: ContentItem | null; type: 'sleep' | 'lesson' }>({ open: false, item: null, type: 'lesson' });
  const [markPremiumVoice, setMarkPremiumVoice] = useState('sage');
  const [activeJobType, setActiveJobType] = useState<string | null>(null);
  const [premiumProcessedIds, setPremiumProcessedIds] = useState<Map<string, { voice: string; date: string }>>(new Map());
  const { toast } = useToast();
  
  // Hook para jobs generales
  const { queueJobs, triggerProcessing, stats } = useProcessingJobs();
  
  // Hook para jobs premium (sleep o lessons)
  const sleepPremiumJobs = useProcessingJobs({ jobType: 'sleep_tts_premium' });
  const lessonPremiumJobs = useProcessingJobs({ jobType: 'lesson_tts_premium' });

  const fetchContent = async () => {
    try {
      const [storiesRes, novenasRes, lessonsRes, premiumJobsRes] = await Promise.all([
        supabase.from('sleep_stories').select('id, titulo, audio_url, created_at').order('orden'),
        supabase.from('novenas').select('id, titulo, imagen_url, created_at').order('orden'),
        supabase.from('library_lessons').select('id, titulo, contenido_enriquecido, audio_url, created_at').order('orden'),
        // Obtener jobs premium completados para saber cuáles ya tienen audio premium
        supabase.from('processing_jobs')
          .select('target_id, result_data, completed_at')
          .in('job_type', ['sleep_tts_premium', 'lesson_tts_premium'])
          .eq('status', 'completed')
          .not('result_data', 'is', null)
      ]);

      setSleepStories(storiesRes.data || []);
      setNovenas(novenasRes.data || []);
      setLessons(lessonsRes.data?.map(l => ({ ...l, titulo: l.titulo })) || []);
      
      // Mapear IDs a datos premium
      const premiumMap = new Map<string, { voice: string; date: string }>();
      (premiumJobsRes.data || []).forEach((job) => {
        const resultData = job.result_data as Record<string, unknown> | null;
        if (resultData && resultData.premium) {
          premiumMap.set(job.target_id, {
            voice: (resultData.voice as string) || 'unknown',
            date: job.completed_at || ''
          });
        }
      });
      setPremiumProcessedIds(premiumMap);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const queueAudioGeneration = async (type: 'sleep_tts' | 'lesson_tts', items: ContentItem[]) => {
    const itemsWithoutAudio = items.filter(i => !i.audio_url);
    if (itemsWithoutAudio.length === 0) {
      toast({ title: "Info", description: "Todo el contenido ya tiene audio" });
      return;
    }

    const jobItems = itemsWithoutAudio.map(item => ({
      id: item.id,
      title: item.titulo,
      table: type === 'sleep_tts' ? 'sleep_stories' : 'library_lessons'
    }));

    await queueJobs(type, jobItems);
    await triggerProcessing();
    toast({ 
      title: "Éxito", 
      description: `${jobItems.length} trabajos de audio encolados` 
    });
  };

  const openRegenDialog = (type: 'sleep' | 'lessons') => {
    setRegenType(type);
    setSelectedVoice(type === 'sleep' ? 'shimmer' : 'sage');
    const items = type === 'sleep' ? sleepStories : lessons;
    setRegenCount(Math.min(5, items.length));
    setShowRegenDialog(true);
  };

  const regeneratePremiumAudio = async () => {
    setShowRegenDialog(false);
    
    try {
      const items = regenType === 'sleep' ? sleepStories : lessons;
      const totalToProcess = Math.min(regenCount, items.length);
      const jobType = regenType === 'sleep' ? 'sleep_tts_premium' : 'lesson_tts_premium';
      const tableName = regenType === 'sleep' ? 'sleep_stories' : 'library_lessons';
      
      // Preparar items con metadata (voz seleccionada)
      const jobItems = items.slice(0, totalToProcess).map(item => ({
        id: item.id,
        title: item.titulo,
        table: tableName,
        metadata: { voice: selectedVoice, premium: true }
      }));

      // Encolar jobs
      await queueJobs(jobType, jobItems);
      
      // Establecer el tipo de job activo para mostrar el panel de progreso
      setActiveJobType(jobType);
      
      toast({
        title: "Jobs en cola",
        description: `${totalToProcess} ${regenType === 'sleep' ? 'historias' : 'lecciones'} encoladas con voz ${selectedVoice}. Activa auto-procesar para iniciar.`,
      });

    } catch (error) {
      console.error('Error queuing premium audio:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al encolar audio",
        variant: "destructive"
      });
    }
  };

  const queueImageGeneration = async () => {
    const novenasWithoutImage = novenas.filter(n => !n.imagen_url);
    if (novenasWithoutImage.length === 0) {
      toast({ title: "Info", description: "Todas las novenas ya tienen imagen" });
      return;
    }

    const jobItems = novenasWithoutImage.map(novena => ({
      id: novena.id,
      title: novena.titulo,
      table: 'novenas'
    }));

    await queueJobs('novena_image', jobItems);
    await triggerProcessing();
    toast({ 
      title: "Éxito", 
      description: `${jobItems.length} trabajos de imagen encolados` 
    });
  };

  const markAsPremium = async () => {
    if (!markPremiumDialog.item) return;
    
    const { item, type } = markPremiumDialog;
    const jobType = type === 'sleep' ? 'sleep_tts_premium' : 'lesson_tts_premium';
    const targetTable = type === 'sleep' ? 'sleep_stories' : 'library_lessons';

    try {
      const { error } = await supabase.from('processing_jobs').insert({
        job_type: jobType,
        target_id: item.id,
        target_table: targetTable,
        target_title: item.titulo,
        status: 'completed',
        result_data: { premium: true, voice: markPremiumVoice, retroactive: true },
        completed_at: new Date().toISOString(),
        attempts: 1
      });

      if (error) throw error;

      // Update local state
      setPremiumProcessedIds(prev => {
        const newMap = new Map(prev);
        newMap.set(item.id, { voice: markPremiumVoice, date: new Date().toISOString() });
        return newMap;
      });

      toast({
        title: "Éxito",
        description: `"${item.titulo}" marcado como premium (${markPremiumVoice})`
      });
      
      setMarkPremiumDialog({ open: false, item: null, type: 'lesson' });
    } catch (error) {
      console.error('Error marking as premium:', error);
      toast({
        title: "Error",
        description: "No se pudo marcar como premium",
        variant: "destructive"
      });
    }
  };

  const renderContentTable = (
    items: ContentItem[], 
    type: 'audio' | 'image' | 'enriched',
    field: 'audio_url' | 'imagen_url' | 'contenido_enriquecido',
    contentType?: 'sleep' | 'lesson'
  ) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Premium</TableHead>
          <TableHead>Fecha</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const premiumInfo = premiumProcessedIds.get(item.id);
          const hasAudio = !!item[field];
          const canMarkPremium = type === 'audio' && hasAudio && !premiumInfo && contentType;
          
          return (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.titulo}</TableCell>
              <TableCell>
                {item[field] ? (
                  <Badge className="bg-green-500/10 text-green-500">
                    {type === 'audio' && <Volume2 className="h-3 w-3 mr-1" />}
                    {type === 'image' && <Image className="h-3 w-3 mr-1" />}
                    Listo
                  </Badge>
                ) : (
                  <Badge variant="secondary">Pendiente</Badge>
                )}
              </TableCell>
              <TableCell>
                {premiumInfo ? (
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {premiumInfo.voice}
                  </Badge>
                ) : canMarkPremium ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-amber-600"
                    onClick={() => setMarkPremiumDialog({ open: true, item, type: contentType })}
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Marcar
                  </Button>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {premiumInfo?.date 
                  ? new Date(premiumInfo.date).toLocaleDateString() 
                  : new Date(item.created_at).toLocaleDateString()
                }
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Contenido</h1>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contenido</h1>
        <Button onClick={() => triggerProcessing()} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Procesar Cola
        </Button>
      </div>

      <Tabs defaultValue="sleep">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="sleep" className="flex items-center gap-1">
            <Moon className="h-4 w-4" />
            <span className="hidden sm:inline">Sueño</span>
          </TabsTrigger>
          <TabsTrigger value="novenas" className="flex items-center gap-1">
            <Church className="h-4 w-4" />
            <span className="hidden sm:inline">Novenas</span>
          </TabsTrigger>
          <TabsTrigger value="lessons" className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Lecciones</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sleep" className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-semibold">Historias de Sueño</h2>
              <p className="text-sm text-muted-foreground">
                {sleepStories.filter(s => s.audio_url).length}/{sleepStories.length} con audio
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => queueAudioGeneration('sleep_tts', sleepStories)}
                size="sm"
                variant="outline"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Generar Faltante
              </Button>
              <Button 
                onClick={() => openRegenDialog('sleep')}
                size="sm"
                variant="default"
                disabled={sleepPremiumJobs.stats.pending > 0 || sleepPremiumJobs.stats.processing > 0}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                {sleepPremiumJobs.stats.processing > 0 ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Regenerar Premium
              </Button>
            </div>
          </div>
          
          {/* Panel de progreso para sleep premium */}
          {(sleepPremiumJobs.stats.total > 0) && (
            <JobProgressPanel 
              jobType="sleep_tts_premium"
              title="Audio Premium - Sueño"
              showDetails={true}
              className="border-amber-500/20"
            />
          )}
          <Card>
            <CardContent className="p-0">
              {renderContentTable(sleepStories, 'audio', 'audio_url', 'sleep')}
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 inline mr-1" />
            Premium usa gpt-4o-mini-tts con voz shimmer y estilo relajante
          </p>
        </TabsContent>

        <TabsContent value="novenas" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Novenas</h2>
              <p className="text-sm text-muted-foreground">
                {novenas.filter(n => n.imagen_url).length}/{novenas.length} con imagen
              </p>
            </div>
            <Button 
              onClick={queueImageGeneration}
              size="sm"
              variant="outline"
            >
              <Image className="h-4 w-4 mr-2" />
              Generar Imágenes Faltantes
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              {renderContentTable(novenas, 'image', 'imagen_url')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lessons" className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-semibold">Lecciones</h2>
              <p className="text-sm text-muted-foreground">
                {lessons.filter(l => l.audio_url).length}/{lessons.length} con audio
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => queueAudioGeneration('lesson_tts', lessons)}
                size="sm"
                variant="outline"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Generar Faltante
              </Button>
              <Button 
                onClick={() => openRegenDialog('lessons')}
                size="sm"
                variant="default"
                disabled={lessonPremiumJobs.stats.pending > 0 || lessonPremiumJobs.stats.processing > 0}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                {lessonPremiumJobs.stats.processing > 0 ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Regenerar Premium
              </Button>
            </div>
          </div>
          
          {/* Panel de progreso para lesson premium */}
          {(lessonPremiumJobs.stats.total > 0) && (
            <JobProgressPanel 
              jobType="lesson_tts_premium"
              title="Audio Premium - Lecciones"
              showDetails={true}
              className="border-amber-500/20"
            />
          )}
          
          <Card>
            <CardContent className="p-0">
              {renderContentTable(lessons, 'audio', 'audio_url', 'lesson')}
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 inline mr-1" />
            Premium usa gpt-4o-mini-tts con voz sage y estilo educativo
          </p>
        </TabsContent>

      </Tabs>

      {/* Dialog for regeneration options */}
      <Dialog open={showRegenDialog} onOpenChange={setShowRegenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Regenerar Audio Premium
            </DialogTitle>
            <DialogDescription>
              Configura las opciones para regenerar {regenType === 'sleep' ? 'historias de sueño' : 'lecciones'} con calidad premium.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="voice">Voz</Label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una voz" />
                </SelectTrigger>
                <SelectContent>
                  {VOICES.map((voice) => (
                    <SelectItem key={voice.value} value={voice.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{voice.label}</span>
                        <span className="text-xs text-muted-foreground">{voice.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="count">Cantidad a regenerar</Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={regenType === 'sleep' ? sleepStories.length : lessons.length}
                value={regenCount}
                onChange={(e) => setRegenCount(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <p className="text-xs text-muted-foreground">
                Máximo: {regenType === 'sleep' ? sleepStories.length : lessons.length} {regenType === 'sleep' ? 'historias' : 'lecciones'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegenDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={regeneratePremiumAudio}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Regenerar {regenCount}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for marking existing audio as premium */}
      <Dialog open={markPremiumDialog.open} onOpenChange={(open) => setMarkPremiumDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Marcar como Premium
            </DialogTitle>
            <DialogDescription>
              Registrar "{markPremiumDialog.item?.titulo}" como audio premium generado anteriormente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Voz utilizada</Label>
              <Select value={markPremiumVoice} onValueChange={setMarkPremiumVoice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VOICES.map(voice => (
                    <SelectItem key={voice.value} value={voice.value}>
                      <div className="flex flex-col">
                        <span>{voice.label}</span>
                        <span className="text-xs text-muted-foreground">{voice.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkPremiumDialog({ open: false, item: null, type: 'lesson' })}>
              Cancelar
            </Button>
            <Button 
              onClick={markAsPremium}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Marcar Premium
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
