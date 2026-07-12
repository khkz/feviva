import { useState, useEffect } from 'react';
import { Video, Image, Music, FileText, Upload, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminEmptyContent } from '@/components/admin/AdminEmptyContent';

interface MediaItem {
  id: string;
  tipo: string;
  titulo: string;
  url: string;
  thumbnail_url: string | null;
  duracion_segundos: number | null;
  size_bytes: number | null;
  formato: string | null;
  estado: string;
  created_at: string;
}

const typeIcons = {
  video: Video,
  image: Image,
  audio: Music,
  document: FileText,
  movie: Video
};

export const AdminMedia = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchMedia = async () => {
    try {
      let query = supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeTab !== 'all') {
        query = query.eq('tipo', activeTab);
      }

      const { data, error } = await query;
      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [activeTab]);

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '-';
    const mb = bytes / (1024 * 1024);
    return mb > 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Biblioteca de Medios</h1>
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-[200px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Biblioteca de Medios</h1>
        <Button disabled>
          <Upload className="h-4 w-4 mr-2" />
          Subir Media
        </Button>
      </div>

      {activeTab === 'all' && media.length === 0 && (
        <AdminEmptyContent
          title="Sin contenido — Biblioteca de Medios vacía"
          hint="Aún no hay medios subidos. Este módulo permanece oculto o silencioso en la app pública hasta que agregues contenido."
        />
      )}



      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="video">Videos</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="image">Imágenes</TabsTrigger>
          <TabsTrigger value="document">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {media.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No hay media en esta categoría
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {media.map((item) => {
                const Icon = typeIcons[item.tipo as keyof typeof typeIcons] || FileText;
                
                return (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted flex items-center justify-center relative">
                      {item.thumbnail_url ? (
                        <img 
                          src={item.thumbnail_url} 
                          alt={item.titulo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Icon className="h-12 w-12 text-muted-foreground" />
                      )}
                      <Badge 
                        className="absolute top-2 right-2"
                        variant={item.estado === 'publicado' ? 'default' : 'secondary'}
                      >
                        {item.estado}
                      </Badge>
                    </div>
                    <CardContent className="p-3 space-y-2">
                      <p className="font-medium truncate">{item.titulo}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{item.formato || item.tipo}</span>
                        <span>{formatSize(item.size_bytes)}</span>
                        {item.duracion_segundos && (
                          <span>{formatDuration(item.duracion_segundos)}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
