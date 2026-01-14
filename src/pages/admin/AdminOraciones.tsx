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
import { useProcessingJobs } from '@/hooks/useProcessingJobs';
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
  Mic,
  Sparkles
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
    return localStorage.getItem('admin_oraciones_voice') || 'echo';
  });
  const [isPremiumMode, setIsPremiumMode] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Processing jobs integration
  const { 
    jobs, 
    stats, 
    queueJobs, 
    triggerProcessing, 
    refetch: refetchJobs 
  } = useProcessingJobs({ 
    jobType: 'oracion_tts_premium',
    autoRefresh: true,
    refreshInterval: 3000
  });

  const activeJobs = jobs.filter(j => j.status === 'pending' || j.status === 'processing');
  const isProcessing = activeJobs.length > 0;

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

  // Regenerate single audio (legacy - non-premium)
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

  // Regenerate all audios (legacy - non-premium)
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

  // Queue all for premium processing
  const queueAllPremium = async () => {
    if (!oraciones?.length) return;
    
    try {
      const items = oraciones.map(o => ({
        id: o.id,
        title: o.nombre,
        table: 'oraciones',
        metadata: { voice: selectedVoice }
      }));
      
      const count = await queueJobs('oracion_tts_premium', items);
      
      toast({
        title: '✨ Jobs encolados',
        description: `${count} oraciones en cola para audio premium con voz "${selectedVoice}".`
      });
      
      // Start processing
      await triggerProcessing();
      
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al encolar jobs',
        variant: 'destructive'
      });
    }
  };

  // Queue single for premium
  const queueSinglePremium = async (oracion: Oracion) => {
    try {
      await queueJobs('oracion_tts_premium', [{
        id: oracion.id,
        title: oracion.nombre,
        table: 'oraciones',
        metadata: { voice: selectedVoice }
      }]);
      
      toast({
        title: '✨ Encolado',
        description: `"${oracion.nombre}" en cola para audio premium.`
      });
      
      await triggerProcessing();
      
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al encolar',
        variant: 'destructive'
      });
    }
  };

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
            <p className="text-sm text-muted-foreground">Administrar audios de oraciones (modo premium)</p>
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
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['admin-oraciones'] });
              refetchJobs();
            }}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          
          {/* Premium Button */}
          <Button 
            onClick={queueAllPremium}
            disabled={isProcessing || !oraciones?.length}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            ✨ Regenerar Premium ({selectedVoiceInfo?.name})
          </Button>
        </div>
      </div>

      {/* Processing Progress */}
      {isProcessing && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">✨ Procesando audio premium con voz "{selectedVoiceInfo?.name}"...</p>
                <Progress 
                  value={stats.total > 0 ? ((stats.total - activeJobs.length) / stats.total) * 100 : 0} 
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {activeJobs.length} pendientes • {stats.successRate.toFixed(0)}% éxito
                </p>
              </div>
              <span className="text-sm text-muted-foreground">
                {stats.total - activeJobs.length} / {stats.total}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legacy Batch Progress */}
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
      <div className="grid gap-4 md:grid-cols-4">
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
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">
              <Sparkles className="h-4 w-4 inline mr-1" />
              Jobs Premium
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{activeJobs.length}</span>
              <span className="text-sm text-muted-foreground">pendientes</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Modelo: gpt-4o-mini-tts
            </p>
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
              {oraciones?.map((oracion) => {
                const isQueued = activeJobs.some(j => j.target_id === oracion.id);
                
                return (
                  <div
                    key={oracion.id}
                    className={`flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${
                      isQueued ? 'border-amber-500/50 bg-amber-500/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{oracion.nombre}</span>
                          {oracion.es_fundamental && (
                            <Badge variant="default" className="shrink-0">Fundamental</Badge>
                          )}
                          {isQueued && (
                            <Badge variant="outline" className="shrink-0 border-amber-500 text-amber-600">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Procesando
                            </Badge>
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

                      {/* Premium Regenerate Button */}
                      <Button
                        size="sm"
                        variant={oracion.audio_url ? "outline" : "default"}
                        onClick={() => queueSinglePremium(oracion)}
                        disabled={isQueued || isProcessing}
                        className={`shrink-0 ${!oracion.audio_url ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0' : ''}`}
                      >
                        {isQueued ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-1" />
                            {oracion.audio_url ? 'Regen' : 'Generar'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
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