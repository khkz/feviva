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
  const [regenerating, setRegenerating] = useState<'sleep' | 'lessons' | null>(null);
  const [showRegenDialog, setShowRegenDialog] = useState(false);
  const [regenType, setRegenType] = useState<'sleep' | 'lessons'>('sleep');
  const [selectedVoice, setSelectedVoice] = useState('shimmer');
  const [regenCount, setRegenCount] = useState(5);
  const { toast } = useToast();
  const { queueJobs, triggerProcessing } = useProcessingJobs();

  const fetchContent = async () => {
    try {
      const [storiesRes, novenasRes, lessonsRes] = await Promise.all([
        supabase.from('sleep_stories').select('id, titulo, audio_url, created_at').order('orden'),
        supabase.from('novenas').select('id, titulo, imagen_url, created_at').order('orden'),
        supabase.from('library_lessons').select('id, titulo, contenido_enriquecido, audio_url, created_at').order('orden')
      ]);

      setSleepStories(storiesRes.data || []);
      setNovenas(novenasRes.data || []);
      setLessons(lessonsRes.data?.map(l => ({ ...l, titulo: l.titulo })) || []);
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
    setRegenerating(regenType);
    
    try {
      const functionName = regenType === 'sleep' ? 'batch-sleep-tts' : 'batch-lesson-tts';
      const items = regenType === 'sleep' ? sleepStories : lessons;
      const totalToProcess = Math.min(regenCount, items.length);
      
      toast({
        title: "Regenerando Audio Premium",
        description: `Procesando ${totalToProcess} ${regenType === 'sleep' ? 'historias' : 'lecciones'} con voz ${selectedVoice}...`,
      });

      let processed = 0;

      while (processed < totalToProcess) {
        const batchSize = Math.min(2, totalToProcess - processed);
        
        const { data, error } = await supabase.functions.invoke(functionName, {
          body: { 
            limit: batchSize,
            forceRegenerate: true,
            voice: selectedVoice
          }
        });

        if (error) throw error;

        processed += data.processed || 0;

        toast({
          title: "Progreso",
          description: `${processed}/${totalToProcess} procesados con voz ${selectedVoice}`,
        });

        // Small delay between batches
        if (processed < totalToProcess) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      toast({
        title: "¡Completado!",
        description: `${processed} archivos regenerados con voz ${selectedVoice}`,
      });

      // Refresh content list
      await fetchContent();

    } catch (error) {
      console.error('Error regenerating premium audio:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al regenerar audio",
        variant: "destructive"
      });
    } finally {
      setRegenerating(null);
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

  const renderContentTable = (
    items: ContentItem[], 
    type: 'audio' | 'image' | 'enriched',
    field: 'audio_url' | 'imagen_url' | 'contenido_enriquecido'
  ) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Fecha</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
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
            <TableCell className="text-muted-foreground">
              {new Date(item.created_at).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
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
                disabled={regenerating === 'sleep'}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                {regenerating === 'sleep' ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Regenerar Premium
              </Button>
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              {renderContentTable(sleepStories, 'audio', 'audio_url')}
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
                disabled={regenerating === 'lessons'}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                {regenerating === 'lessons' ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Regenerar Premium
              </Button>
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              {renderContentTable(lessons, 'audio', 'audio_url')}
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
    </div>
  );
};
