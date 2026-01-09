import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Pause,
  RefreshCw, 
  Volume2, 
  VolumeX,
  Loader2,
  CheckCircle2,
  XCircle,
  BookHeart,
  Mic
} from 'lucide-react';

const AVAILABLE_VOICES = [
  { id: 'onyx', name: 'Onyx', gender: 'Masculina', description: 'Voz más grave y profunda' },
  { id: 'echo', name: 'Echo', gender: 'Masculina', description: 'Voz grave, clara y formal' },
  { id: 'fable', name: 'Fable', gender: 'Masculina', description: 'Voz cálida, narrativa' },
  { id: 'alloy', name: 'Alloy', gender: 'Neutral', description: 'Voz balanceada, versátil' },
  { id: 'nova', name: 'Nova', gender: 'Femenina', description: 'Voz cálida y expresiva' },
  { id: 'shimmer', name: 'Shimmer', gender: 'Femenina', description: 'Voz suave y clara' },
];

interface Oracion {
  id: string;
  nombre: string;
  categoria: string;
  audio_url: string | null;
  es_fundamental: boolean | null;
}

export default function AdminOraciones() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>(() => {
    return localStorage.getItem('admin_oraciones_voice') || 'onyx';
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem('admin_oraciones_voice', selectedVoice);
  }, [selectedVoice]);

  // Fetch all oraciones
  const { data: oraciones, isLoading } = useQuery({
    queryKey: ['admin-oraciones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('oraciones')
        .select('id, nombre, categoria, audio_url, es_fundamental')
        .order('orden', { ascending: true });
      
      if (error) throw error;
      return data as Oracion[];
    }
  });

  // Regenerate single audio
  const regenerateSingle = useMutation({
    mutationFn: async (oracionId: string) => {
      setRegeneratingId(oracionId);
      const { data, error } = await supabase.functions.invoke('regenerate-oracion-audio', {
        body: { oracionId, voice: selectedVoice }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-oraciones'] });
      toast({
        title: 'Audio regenerado',
        description: `Se ha regenerado el audio con voz "${selectedVoice}".`
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    },
    onSettled: () => {
      setRegeneratingId(null);
    }
  });

  // Regenerate all audios
  const regenerateAll = useMutation({
    mutationFn: async () => {
      const total = oraciones?.length || 0;
      setBatchProgress({ current: 0, total });
      
      const { data, error } = await supabase.functions.invoke('regenerate-oracion-audio', {
        body: { voice: selectedVoice }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-oraciones'] });
      toast({
        title: 'Audios regenerados',
        description: `Se procesaron ${data.processed} oraciones con voz "${selectedVoice}": ${data.successCount} exitosas, ${data.errorCount} errores.`
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    },
    onSettled: () => {
      setBatchProgress(null);
    }
  });

  const playAudio = (audioUrl: string, oracionId: string) => {
    if (playingId === oracionId) {
      // Stop current
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      // Play new
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audio.onended = () => setPlayingId(null);
      audio.play();
      audioRef.current = audio;
      setPlayingId(oracionId);
    }
  };

  const stopAudio = () => {
    audioRef.current?.pause();
    setPlayingId(null);
  };

  const withAudio = oraciones?.filter(o => o.audio_url) || [];
  const withoutAudio = oraciones?.filter(o => !o.audio_url) || [];
  const selectedVoiceInfo = AVAILABLE_VOICES.find(v => v.id === selectedVoice);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookHeart className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Gestión de Oraciones</h1>
            <p className="text-sm text-muted-foreground">Administrar audios de oraciones</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Voice Selector */}
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_VOICES.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{voice.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({voice.gender})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-oraciones'] })}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button 
            onClick={() => regenerateAll.mutate()}
            disabled={regenerateAll.isPending || !!regeneratingId}
            className="bg-primary"
          >
            {regenerateAll.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Regenerar Todos con "{selectedVoiceInfo?.name}"
          </Button>
        </div>
      </div>

      {/* Batch Progress */}
      {batchProgress && (
        <Card className="border-primary/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Regenerando audios con voz "{selectedVoiceInfo?.name}"...</p>
                <Progress 
                  value={(batchProgress.current / batchProgress.total) * 100} 
                  className="mt-2"
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {batchProgress.current} / {batchProgress.total}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Con Audio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{withAudio.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sin Audio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">{withoutAudio.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Voz Seleccionada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold capitalize">{selectedVoice}</span>
              <Badge variant="secondary" className="ml-1">{selectedVoiceInfo?.gender}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{selectedVoiceInfo?.description}</p>
          </CardContent>
        </Card>
      </div>

      {/* Oraciones List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Oraciones</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-2">
              {oraciones?.map((oracion) => (
                <div
                  key={oracion.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{oracion.nombre}</span>
                        {oracion.es_fundamental && (
                          <Badge variant="default" className="shrink-0">Fundamental</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{oracion.categoria}</span>
                    </div>
                    
                    {oracion.audio_url ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 shrink-0">
                        <Volume2 className="h-3 w-3 mr-1" />
                        Audio
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30 shrink-0">
                        <VolumeX className="h-3 w-3 mr-1" />
                        Sin audio
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {/* Play Button */}
                    {oracion.audio_url && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => playAudio(oracion.audio_url!, oracion.id)}
                        className="h-8 w-8"
                      >
                        {playingId === oracion.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    )}

                    {/* Regenerate Button */}
                    <Button
                      size="sm"
                      variant={oracion.audio_url ? "outline" : "default"}
                      onClick={() => regenerateSingle.mutate(oracion.id)}
                      disabled={regeneratingId === oracion.id || regenerateAll.isPending}
                      className="shrink-0"
                    >
                      {regeneratingId === oracion.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-1" />
                          {oracion.audio_url ? 'Regen' : 'Generar'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Stop audio when unmounting */}
      {playingId && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button 
            onClick={stopAudio}
            variant="secondary"
            className="shadow-lg"
          >
            <Pause className="h-4 w-4 mr-2" />
            Detener audio
          </Button>
        </div>
      )}
    </div>
  );
}
