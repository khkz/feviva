import { useState, useEffect } from 'react';
import { Plus, Film, Clock, Star, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface Movie {
  id: string;
  titulo: string;
  descripcion: string | null;
  sinopsis: string | null;
  director: string | null;
  anio: number | null;
  duracion_min: number | null;
  categoria: string | null;
  clasificacion: string | null;
  imagen_poster: string | null;
  destacada: boolean;
  publicada: boolean;
  created_at: string;
}

export const AdminMovies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMovies = async () => {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('orden');

      if (error) throw error;
      setMovies(data || []);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const togglePublish = async (movie: Movie) => {
    try {
      const { error } = await supabase
        .from('movies')
        .update({ publicada: !movie.publicada })
        .eq('id', movie.id);

      if (error) throw error;

      setMovies(prev => prev.map(m => 
        m.id === movie.id ? { ...m, publicada: !m.publicada } : m
      ));

      toast({
        title: "Éxito",
        description: `Película ${movie.publicada ? 'despublicada' : 'publicada'} correctamente`
      });
    } catch (error) {
      console.error('Error toggling publish:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la película",
        variant: "destructive"
      });
    }
  };

  const toggleFeatured = async (movie: Movie) => {
    try {
      const { error } = await supabase
        .from('movies')
        .update({ destacada: !movie.destacada })
        .eq('id', movie.id);

      if (error) throw error;

      setMovies(prev => prev.map(m => 
        m.id === movie.id ? { ...m, destacada: !m.destacada } : m
      ));

      toast({
        title: "Éxito",
        description: `Película ${movie.destacada ? 'quitada de' : 'añadida a'} destacadas`
      });
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Películas</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Películas</h1>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Película
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{movies.length}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">
              {movies.filter(m => m.publicada).length}
            </p>
            <p className="text-sm text-muted-foreground">Publicadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">
              {movies.filter(m => m.destacada).length}
            </p>
            <p className="text-sm text-muted-foreground">Destacadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">
              {Math.round(movies.reduce((acc, m) => acc + (m.duracion_min || 0), 0) / 60)}h
            </p>
            <p className="text-sm text-muted-foreground">Contenido Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Movies Grid */}
      {movies.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Film className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No hay películas</p>
            <Button className="mt-4" disabled>
              <Plus className="h-4 w-4 mr-2" />
              Añadir primera película
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map((movie) => (
            <Card key={movie.id} className="overflow-hidden group">
              <div className="aspect-[2/3] bg-muted flex items-center justify-center relative">
                {movie.imagen_poster ? (
                  <img 
                    src={movie.imagen_poster} 
                    alt={movie.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Film className="h-12 w-12 text-muted-foreground" />
                )}
                {movie.destacada && (
                  <Badge className="absolute top-2 left-2 bg-yellow-500">
                    <Star className="h-3 w-3 fill-current" />
                  </Badge>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant={movie.publicada ? "secondary" : "default"}
                    onClick={() => togglePublish(movie)}
                  >
                    {movie.publicada ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant={movie.destacada ? "secondary" : "outline"}
                    onClick={() => toggleFeatured(movie)}
                  >
                    <Star className={`h-4 w-4 ${movie.destacada ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3 space-y-1">
                <p className="font-medium text-sm line-clamp-1">{movie.titulo}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {movie.anio && <span>{movie.anio}</span>}
                  {movie.duracion_min && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {movie.duracion_min}min
                    </span>
                  )}
                </div>
                {movie.clasificacion && (
                  <Badge variant="outline" className="text-xs">
                    {movie.clasificacion}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
