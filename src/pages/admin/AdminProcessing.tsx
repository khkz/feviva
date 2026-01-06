import { JobProgressPanel } from '@/components/processing/JobProgressPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProcessingJobs } from '@/hooks/useProcessingJobs';
import { Badge } from '@/components/ui/badge';
import { Moon, Church, BookOpen, Settings } from 'lucide-react';

export const AdminProcessing = () => {
  const { stats } = useProcessingJobs({ autoRefresh: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cola de Procesamiento</h1>
        {stats && (
          <Badge variant="outline">
            {stats.pending} pendientes • {stats.processing} procesando
          </Badge>
        )}
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats?.total || 0}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">{stats?.pending || 0}</p>
            <p className="text-sm text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{stats?.completed || 0}</p>
            <p className="text-sm text-muted-foreground">Completados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{stats?.error || 0}</p>
            <p className="text-sm text-muted-foreground">Errores</p>
          </CardContent>
        </Card>
      </div>

      {/* Metrics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Métricas</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-8">
            <div>
              <p className="text-2xl font-bold">{stats.successRate}%</p>
              <p className="text-sm text-muted-foreground">Tasa de Éxito</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats.avgProcessingTime ? `${(stats.avgProcessingTime / 1000).toFixed(1)}s` : '-'}
              </p>
              <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jobs by Type */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Todos
          </TabsTrigger>
          <TabsTrigger value="sleep_tts" className="flex items-center gap-1">
            <Moon className="h-4 w-4" />
            Sueño TTS
          </TabsTrigger>
          <TabsTrigger value="novena_image" className="flex items-center gap-1">
            <Church className="h-4 w-4" />
            Novena Img
          </TabsTrigger>
          <TabsTrigger value="lesson_tts" className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            Lección TTS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <JobProgressPanel jobType="" title="Todos los Jobs" showDetails className="mt-4" />
        </TabsContent>
        <TabsContent value="sleep_tts">
          <JobProgressPanel jobType="sleep_tts" title="Audio Historias de Sueño" showDetails className="mt-4" />
        </TabsContent>
        <TabsContent value="novena_image">
          <JobProgressPanel jobType="novena_image" title="Imágenes de Novenas" showDetails className="mt-4" />
        </TabsContent>
        <TabsContent value="lesson_tts">
          <JobProgressPanel jobType="lesson_tts" title="Audio de Lecciones" showDetails className="mt-4" />
        </TabsContent>
      </Tabs>
    </div>
  );
};
