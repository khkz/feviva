import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  MessageSquare, 
  Moon, 
  Flame, 
  Star, 
  Calendar,
  Trophy,
  Target,
  Clock,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface UserActivityModalProps {
  userId: string | null;
  userName: string;
  onClose: () => void;
}

interface UserStats {
  puntos_totales: number;
  nivel: number;
  debates_completados: number;
  lecciones_completadas: number;
  racha_actual_dias: number;
  racha_maxima_dias: number;
  ultima_actividad: string | null;
}

interface ActivityItem {
  type: string;
  title: string;
  date: string;
  icon: React.ReactNode;
  color: string;
}

export const UserActivityModal = ({ userId, userName, onClose }: UserActivityModalProps) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [bibleProgress, setBibleProgress] = useState({ daysCompleted: 0, currentDay: 0 });
  const [rosarioCount, setRosarioCount] = useState(0);
  const [novenasCount, setNovenasCount] = useState({ active: 0, completed: 0 });
  const [sleepCount, setSleepCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [gratitudeCount, setGratitudeCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [weeklyData, setWeeklyData] = useState<{ day: string; activities: number }[]>([]);

  useEffect(() => {
    if (userId) {
      fetchAllData();
    }
  }, [userId]);

  const fetchAllData = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      // Fetch user stats
      const { data: statsData } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      setStats(statsData);

      // Fetch Bible progress
      const { data: bibleData } = await supabase
        .from('user_bible_progress')
        .select('dia_actual, dias_completados')
        .eq('user_id', userId)
        .single();
      
      if (bibleData) {
        const completedDays = Array.isArray(bibleData.dias_completados) 
          ? bibleData.dias_completados.length 
          : 0;
        setBibleProgress({ 
          daysCompleted: completedDays, 
          currentDay: bibleData.dia_actual 
        });
      }

      // Fetch Rosario count
      const { count: rosarioData } = await supabase
        .from('user_rosario_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('completado', true);
      
      setRosarioCount(rosarioData || 0);

      // Fetch Novenas
      const { data: novenasData } = await supabase
        .from('user_novena_progress')
        .select('completada')
        .eq('user_id', userId);
      
      if (novenasData) {
        const completed = novenasData.filter(n => n.completada).length;
        const active = novenasData.filter(n => !n.completada).length;
        setNovenasCount({ active, completed });
      }

      // Fetch Sleep stories
      const { count: sleepData } = await supabase
        .from('user_sleep_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      setSleepCount(sleepData || 0);

      // Fetch Feedback count
      const { count: feedbackData } = await supabase
        .from('content_feedback')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      setFeedbackCount(feedbackData || 0);

      // Fetch Gratitude entries
      const { count: gratitudeData } = await supabase
        .from('gratitude_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      setGratitudeCount(gratitudeData || 0);

      // Fetch recent activity for timeline
      await fetchRecentActivity(userId);
      
      // Calculate weekly activity
      await calculateWeeklyActivity(userId);

    } catch (error) {
      console.error('Error fetching user activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async (userId: string) => {
    const activities: ActivityItem[] = [];

    // Get recent debates
    const { data: debates } = await supabase
      .from('debates')
      .select('tema, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);

    debates?.forEach(d => {
      activities.push({
        type: 'debate',
        title: `Debate: ${d.tema}`,
        date: d.created_at || '',
        icon: <MessageSquare className="h-4 w-4" />,
        color: 'bg-blue-500/10 text-blue-500'
      });
    });

    // Get recent rosarios
    const { data: rosarios } = await supabase
      .from('user_rosario_progress')
      .select('misterio_tipo, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);

    rosarios?.forEach(r => {
      activities.push({
        type: 'rosario',
        title: `Rosario: ${r.misterio_tipo}`,
        date: r.created_at,
        icon: <Star className="h-4 w-4" />,
        color: 'bg-purple-500/10 text-purple-500'
      });
    });

    // Get recent gratitude entries
    const { data: gratitude } = await supabase
      .from('gratitude_entries')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);

    gratitude?.forEach(g => {
      activities.push({
        type: 'gratitude',
        title: 'Entrada de gratitud',
        date: g.created_at,
        icon: <Flame className="h-4 w-4" />,
        color: 'bg-orange-500/10 text-orange-500'
      });
    });

    // Sort by date
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setRecentActivity(activities.slice(0, 10));
  };

  const calculateWeeklyActivity = async (userId: string) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const today = new Date();
    const weekData: { day: string; activities: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Count activities for this day across tables
      let count = 0;

      const { count: debateCount } = await supabase
        .from('debates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', dateStr)
        .lt('created_at', new Date(date.getTime() + 86400000).toISOString().split('T')[0]);
      
      const { count: rosarioCount } = await supabase
        .from('user_rosario_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('fecha', dateStr);

      const { count: gratitudeCount } = await supabase
        .from('gratitude_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('fecha', dateStr);

      count = (debateCount || 0) + (rosarioCount || 0) + (gratitudeCount || 0);

      weekData.push({
        day: days[date.getDay()],
        activities: count
      });
    }

    setWeeklyData(weekData);
  };

  const getLevelBadge = (level: number) => {
    if (level >= 10) return 'Maestro';
    if (level >= 7) return 'Avanzado';
    if (level >= 4) return 'Intermedio';
    return 'Principiante';
  };

  if (!userId) return null;

  return (
    <Dialog open={!!userId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Actividad de {userName}</span>
            {stats && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Nivel {stats.nivel} - {getLevelBadge(stats.nivel)}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="activity">Actividad</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[60vh] mt-4">
              <TabsContent value="overview" className="space-y-4 m-0">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Trophy className="h-6 w-6 mx-auto text-yellow-500 mb-2" />
                      <p className="text-2xl font-bold">{stats?.puntos_totales || 0}</p>
                      <p className="text-xs text-muted-foreground">Puntos</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Flame className="h-6 w-6 mx-auto text-orange-500 mb-2" />
                      <p className="text-2xl font-bold">{stats?.racha_actual_dias || 0}</p>
                      <p className="text-xs text-muted-foreground">Racha actual</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <MessageSquare className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                      <p className="text-2xl font-bold">{stats?.debates_completados || 0}</p>
                      <p className="text-xs text-muted-foreground">Debates</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <BookOpen className="h-6 w-6 mx-auto text-green-500 mb-2" />
                      <p className="text-2xl font-bold">{stats?.lecciones_completadas || 0}</p>
                      <p className="text-xs text-muted-foreground">Lecciones</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Weekly Activity Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Actividad semanal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={weeklyData}>
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="activities" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Last Activity */}
                {stats?.ultima_actividad && (
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Última actividad</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(stats.ultima_actividad).toLocaleString('es-ES')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-4 m-0">
                {/* Activity Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <BookOpen className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Plan Bíblico</p>
                          <p className="text-sm text-muted-foreground">
                            Día {bibleProgress.currentDay} • {bibleProgress.daysCompleted} días completados
                          </p>
                        </div>
                      </div>
                      <Progress 
                        value={(bibleProgress.currentDay / 365) * 100} 
                        className="mt-3 h-2" 
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                          <Star className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-medium">Rosarios</p>
                          <p className="text-sm text-muted-foreground">
                            {rosarioCount} completados
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Calendar className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium">Novenas</p>
                          <p className="text-sm text-muted-foreground">
                            {novenasCount.active} activas • {novenasCount.completed} completadas
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10">
                          <Moon className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div>
                          <p className="font-medium">Historias para Dormir</p>
                          <p className="text-sm text-muted-foreground">
                            {sleepCount} escuchadas
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/10">
                          <Flame className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                          <p className="font-medium">Gratitud</p>
                          <p className="text-sm text-muted-foreground">
                            {gratitudeCount} entradas
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-500/10">
                          <Target className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div>
                          <p className="font-medium">Feedback</p>
                          <p className="text-sm text-muted-foreground">
                            {feedbackCount} valoraciones dadas
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Max Streak */}
                <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-500/10">
                        <Flame className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium">Racha máxima</p>
                        <p className="text-sm text-muted-foreground">
                          El mejor registro del usuario
                        </p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{stats?.racha_maxima_dias || 0} días</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="m-0">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Actividad reciente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentActivity.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No hay actividad registrada
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${activity.color}`}>
                              {activity.icon}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{activity.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(activity.date).toLocaleString('es-ES')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
