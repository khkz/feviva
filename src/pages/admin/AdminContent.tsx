import { useState, useEffect } from 'react';
import { Moon, Church, BookOpen, HandHeart, Volume2, Image, RefreshCw } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useProcessingJobs } from '@/hooks/useProcessingJobs';

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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Historias de Sueño</h2>
              <p className="text-sm text-muted-foreground">
                {sleepStories.filter(s => s.audio_url).length}/{sleepStories.length} con audio
              </p>
            </div>
            <Button 
              onClick={() => queueAudioGeneration('sleep_tts', sleepStories)}
              size="sm"
              variant="outline"
            >
              <Volume2 className="h-4 w-4 mr-2" />
              Generar Audio Faltante
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              {renderContentTable(sleepStories, 'audio', 'audio_url')}
            </CardContent>
          </Card>
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Lecciones</h2>
              <p className="text-sm text-muted-foreground">
                {lessons.filter(l => l.audio_url).length}/{lessons.length} con audio
              </p>
            </div>
            <Button 
              onClick={() => queueAudioGeneration('lesson_tts', lessons)}
              size="sm"
              variant="outline"
            >
              <Volume2 className="h-4 w-4 mr-2" />
              Generar Audio Faltante
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              {renderContentTable(lessons, 'audio', 'audio_url')}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};
