import { useState, useEffect } from 'react';
import { Plus, GraduationCap, Users, Clock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  titulo: string;
  descripcion: string | null;
  imagen_url: string | null;
  nivel: string;
  categoria: string;
  duracion_total_min: number;
  publicado: boolean;
  created_at: string;
}

const levelColors = {
  principiante: 'bg-green-500/10 text-green-500',
  intermedio: 'bg-yellow-500/10 text-yellow-500',
  avanzado: 'bg-red-500/10 text-red-500'
};

export const AdminCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('orden');

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const togglePublish = async (course: Course) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ publicado: !course.publicado })
        .eq('id', course.id);

      if (error) throw error;

      setCourses(prev => prev.map(c => 
        c.id === course.id ? { ...c, publicado: !c.publicado } : c
      ));

      toast({
        title: "Éxito",
        description: `Curso ${course.publicado ? 'despublicado' : 'publicado'} correctamente`
      });
    } catch (error) {
      console.error('Error toggling publish:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el curso",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Cursos</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[250px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cursos</h1>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Curso
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{courses.length}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">
              {courses.filter(c => c.publicado).length}
            </p>
            <p className="text-sm text-muted-foreground">Publicados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">
              {courses.filter(c => !c.publicado).length}
            </p>
            <p className="text-sm text-muted-foreground">Borradores</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">
              {Math.round(courses.reduce((acc, c) => acc + c.duracion_total_min, 0) / 60)}h
            </p>
            <p className="text-sm text-muted-foreground">Contenido Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No hay cursos creados</p>
            <Button className="mt-4" disabled>
              <Plus className="h-4 w-4 mr-2" />
              Crear primer curso
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center relative">
                {course.imagen_url ? (
                  <img 
                    src={course.imagen_url} 
                    alt={course.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <GraduationCap className="h-12 w-12 text-muted-foreground" />
                )}
                <Badge 
                  className={`absolute top-2 right-2 ${levelColors[course.nivel as keyof typeof levelColors]}`}
                >
                  {course.nivel}
                </Badge>
              </div>
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold line-clamp-1">{course.titulo}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.descripcion || 'Sin descripción'}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.duracion_total_min}min
                  </span>
                  <Badge variant="outline">{course.categoria}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={course.publicado ? "secondary" : "default"}
                    onClick={() => togglePublish(course)}
                    className="flex-1"
                  >
                    {course.publicado ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        Despublicar
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        Publicar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
