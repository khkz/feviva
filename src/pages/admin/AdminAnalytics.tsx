import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [contentStats, setContentStats] = useState<any[]>([]);
  const [feedbackByType, setFeedbackByType] = useState<any[]>([]);
  const [userActivity, setUserActivity] = useState<any[]>([]);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [contentError, setContentError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Content stats — usamos head:true para traer SOLO el count exacto,
        // así no pesa la fila entera y no depende de que el SELECT devuelva
        // datos. Logueamos cada error individual para no fallar en silencio.
        const tables = [
          { key: 'sleep_stories', label: 'Historias' },
          { key: 'novenas', label: 'Novenas' },
          { key: 'library_lessons', label: 'Lecciones' },
          { key: 'oraciones', label: 'Oraciones' },
          { key: 'courses', label: 'Cursos' },
          { key: 'movies', label: 'Películas' },
          { key: 'calendar_saints', label: 'Santos' },
        ] as const;

        const counts = await Promise.all(
          tables.map(async (t) => {
            const { count, error } = await supabase
              .from(t.key as any)
              .select('*', { count: 'exact', head: true });
            if (error) {
              console.error(`[analytics] count ${t.key} failed:`, error);
              return { name: t.label, value: 0, error: error.message };
            }
            return { name: t.label, value: count ?? 0 };
          }),
        );

        const withErrors = counts.filter((c) => (c as any).error);
        if (withErrors.length && counts.every((c) => c.value === 0)) {
          setContentError('No se pudo cargar el contenido (revisa permisos de RLS).');
        }
        setContentStats(counts.map(({ name, value }) => ({ name, value })));


        // Feedback by type
        const { data: feedback } = await supabase
          .from('content_feedback')
          .select('content_type, rating');

        const feedbackMap: Record<string, { positive: number; negative: number }> = {};
        feedback?.forEach(f => {
          if (!feedbackMap[f.content_type]) {
            feedbackMap[f.content_type] = { positive: 0, negative: 0 };
          }
          if (f.rating === 5) feedbackMap[f.content_type].positive++;
          else feedbackMap[f.content_type].negative++;
        });

        setFeedbackByType(Object.entries(feedbackMap).map(([type, data]) => ({
          name: type.replace('_', ' '),
          positive: data.positive,
          negative: data.negative
        })));

        // User activity (last 7 days)
        const { data: stats } = await supabase
          .from('user_stats')
          .select('ultima_actividad');

        const activityMap: Record<string, number> = {};
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const key = date.toISOString().split('T')[0];
          activityMap[key] = 0;
        }

        stats?.forEach(s => {
          if (s.ultima_actividad) {
            const key = s.ultima_actividad;
            if (activityMap[key] !== undefined) {
              activityMap[key]++;
            }
          }
        });

        setUserActivity(Object.entries(activityMap).map(([date, count]) => ({
          date: new Date(date).toLocaleDateString('es', { weekday: 'short' }),
          usuarios: count
        })));

        // User growth (by month)
        const { data: profiles } = await supabase
          .from('profiles')
          .select('created_at');

        const growthMap: Record<string, number> = {};
        profiles?.forEach(p => {
          const month = new Date(p.created_at).toLocaleDateString('es', { month: 'short', year: '2-digit' });
          growthMap[month] = (growthMap[month] || 0) + 1;
        });

        setUserGrowth(Object.entries(growthMap).map(([month, count]) => ({
          month,
          usuarios: count
        })));

      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[300px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Contenido</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Contenido</CardTitle>
            </CardHeader>
            <CardContent>
              {contentError ? (
                <p className="text-sm text-destructive py-12 text-center">{contentError}</p>
              ) : contentStats.filter(s => s.value > 0).length === 0 ? (
                <p className="text-sm text-muted-foreground py-12 text-center">
                  Aún no hay contenido para graficar.
                </p>
              ) : (

                <div style={{ width: '100%', height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={contentStats.filter(s => s.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        isAnimationActive={false}
                      >
                        {contentStats.filter(s => s.value > 0).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Actividad Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="usuarios" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crecimiento de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="usuarios" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feedback por Tipo de Contenido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={feedbackByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="positive" fill="#10b981" name="Positivo" />
                    <Bar dataKey="negative" fill="#ef4444" name="Negativo" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
