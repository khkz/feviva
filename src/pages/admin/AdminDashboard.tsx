import { 
  Users, 
  BookOpen, 
  Moon, 
  Church, 
  HandHeart,
  Film,
  GraduationCap,
  ThumbsUp,
  ThumbsDown,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Radio
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/admin/StatCard';
import { useAdminStats } from '@/hooks/useAdminStats';
import { Skeleton } from '@/components/ui/skeleton';

export const AdminDashboard = () => {
  const { stats, loading } = useAdminStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-[100px]" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const feedbackPercentage = stats.feedback.total > 0
    ? Math.round((stats.feedback.positive / stats.feedback.total) * 100)
    : 0;

  const contentStats = [
    { 
      title: 'Historias de Sueño', 
      total: stats.content.sleepStories.total,
      ready: stats.content.sleepStories.withAudio,
      icon: Moon,
      label: 'con audio'
    },
    { 
      title: 'Novenas', 
      total: stats.content.novenas.total,
      ready: stats.content.novenas.withImages,
      icon: Church,
      label: 'con imagen'
    },
    { 
      title: 'Lecciones', 
      total: stats.content.lessons.total,
      ready: stats.content.lessons.enriched,
      icon: BookOpen,
      label: 'enriquecidas'
    },
    { 
      title: 'Oraciones', 
      total: stats.content.oraciones.total,
      ready: stats.content.oraciones.withAudio,
      icon: HandHeart,
      label: 'con audio'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Badge variant="outline" className="text-xs">
          Actualizado ahora
        </Badge>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Usuarios" 
          value={stats.users.total}
          subtitle={`${stats.users.thisWeek} nuevos esta semana`}
          icon={Users}
        />
        <StatCard 
          title="Usuarios Activos" 
          value={stats.users.active}
          subtitle="Últimos 7 días"
          icon={Users}
        />
        <StatCard 
          title="Cursos" 
          value={stats.content.courses.total}
          subtitle={`${stats.content.courses.published} publicados`}
          icon={GraduationCap}
        />
        <StatCard 
          title="Películas" 
          value={stats.content.movies.total}
          subtitle={`${stats.content.movies.published} publicadas`}
          icon={Film}
        />
      </div>

      {/* Content Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estado del Contenido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contentStats.map((item) => (
              <div key={item.title} className="space-y-2">
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{item.title}</span>
                </div>
                <Progress 
                  value={item.total > 0 ? (item.ready / item.total) * 100 : 0} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {item.ready}/{item.total} {item.label}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Processing & Feedback */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Processing Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Cola de Procesamiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Pendientes</span>
              </div>
              <Badge variant="secondary">{stats.processing.pending}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-blue-500 animate-spin" />
                <span className="text-sm">Procesando</span>
              </div>
              <Badge variant="secondary">{stats.processing.processing}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Completados</span>
              </div>
              <Badge variant="secondary">{stats.processing.completed}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Errores</span>
              </div>
              <Badge variant="destructive">{stats.processing.errors}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ThumbsUp className="h-4 w-4" />
              Feedback de Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-bold">{feedbackPercentage}%</p>
              <p className="text-sm text-muted-foreground">Satisfacción</p>
            </div>
            <Progress value={feedbackPercentage} className="h-2" />
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4 text-green-500" />
                <span>{stats.feedback.positive}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsDown className="h-4 w-4 text-red-500" />
                <span>{stats.feedback.negative}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {stats.feedback.total} respuestas totales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Live Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Radio className="h-4 w-4" />
            Sesiones en Vivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-8">
            <div>
              <p className="text-2xl font-bold">{stats.liveSessions.scheduled}</p>
              <p className="text-sm text-muted-foreground">Programadas</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.liveSessions.completed}</p>
              <p className="text-sm text-muted-foreground">Completadas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
