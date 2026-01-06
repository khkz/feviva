import { useState, useEffect, useMemo } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Check, Filter, TrendingUp, TrendingDown, BarChart3, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, Legend } from 'recharts';

interface FeedbackItem {
  id: string;
  user_id: string;
  content_type: string;
  content_id: string;
  rating: number;
  comentario: string | null;
  leido: boolean;
  created_at: string;
  user_name?: string;
}

const contentTypeLabels: Record<string, string> = {
  sleep_story: 'Historia de Sueño',
  novena: 'Novena',
  lesson: 'Lección',
  oracion: 'Oración',
  movie: 'Película',
  course: 'Curso'
};

const contentTypeColors: Record<string, string> = {
  sleep_story: 'hsl(var(--chart-1))',
  novena: 'hsl(var(--chart-2))',
  lesson: 'hsl(var(--chart-3))',
  oracion: 'hsl(var(--chart-4))',
  movie: 'hsl(var(--chart-5))',
  course: 'hsl(var(--primary))'
};

const chartConfig = {
  positive: {
    label: "Positivos",
    color: "hsl(142, 76%, 36%)",
  },
  negative: {
    label: "Negativos",
    color: "hsl(0, 84%, 60%)",
  },
  sleep_story: {
    label: "Historias de Sueño",
    color: "hsl(var(--chart-1))",
  },
  novena: {
    label: "Novenas",
    color: "hsl(var(--chart-2))",
  },
  lesson: {
    label: "Lecciones",
    color: "hsl(var(--chart-3))",
  },
  oracion: {
    label: "Oraciones",
    color: "hsl(var(--chart-4))",
  },
  movie: {
    label: "Películas",
    color: "hsl(var(--chart-5))",
  },
  course: {
    label: "Cursos",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export const AdminFeedback = () => {
  const [allFeedback, setAllFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const { toast } = useToast();

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('content_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user names
      const userIds = [...new Set(data?.map(f => f.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nombre')
        .in('id', userIds);

      const feedbackWithNames = data?.map(f => ({
        ...f,
        user_name: profiles?.find(p => p.id === f.user_id)?.nombre || 'Usuario'
      })) || [];

      setAllFeedback(feedbackWithNames);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el feedback",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  // Filter feedback based on current filters
  const filteredFeedback = useMemo(() => {
    let result = [...allFeedback];

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const daysAgo = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      result = result.filter(f => new Date(f.created_at) >= cutoffDate);
    }

    // Rating filter
    if (filter === 'positive') {
      result = result.filter(f => f.rating === 5);
    } else if (filter === 'negative') {
      result = result.filter(f => f.rating === 1);
    } else if (filter === 'unread') {
      result = result.filter(f => !f.leido);
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(f => f.content_type === typeFilter);
    }

    return result;
  }, [allFeedback, filter, typeFilter, dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredFeedback.length;
    const positive = filteredFeedback.filter(f => f.rating === 5).length;
    const negative = filteredFeedback.filter(f => f.rating === 1).length;
    const unread = filteredFeedback.filter(f => !f.leido).length;
    const satisfactionRate = total > 0 ? Math.round((positive / total) * 100) : 0;

    return { total, positive, negative, unread, satisfactionRate };
  }, [filteredFeedback]);

  // Statistics by content type
  const statsByType = useMemo(() => {
    const types = Object.keys(contentTypeLabels);
    return types.map(type => {
      const typeFeedback = filteredFeedback.filter(f => f.content_type === type);
      const positive = typeFeedback.filter(f => f.rating === 5).length;
      const negative = typeFeedback.filter(f => f.rating === 1).length;
      const total = typeFeedback.length;
      const satisfaction = total > 0 ? Math.round((positive / total) * 100) : 0;

      return {
        type,
        name: contentTypeLabels[type],
        total,
        positive,
        negative,
        satisfaction,
        fill: contentTypeColors[type]
      };
    }).filter(s => s.total > 0);
  }, [filteredFeedback]);

  // Trend data (last 7 days)
  const trendData = useMemo(() => {
    const days: Record<string, { date: string; positive: number; negative: number }> = {};
    const now = new Date();
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split('T')[0];
      days[key] = { 
        date: date.toLocaleDateString('es', { weekday: 'short', day: 'numeric' }), 
        positive: 0, 
        negative: 0 
      };
    }

    // Count feedback by day
    allFeedback.forEach(f => {
      const date = f.created_at.split('T')[0];
      if (days[date]) {
        if (f.rating === 5) {
          days[date].positive++;
        } else {
          days[date].negative++;
        }
      }
    });

    return Object.values(days);
  }, [allFeedback]);

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('content_feedback')
        .update({ leido: true })
        .eq('id', id);
      
      setAllFeedback(prev => prev.map(f => 
        f.id === id ? { ...f, leido: true } : f
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = filteredFeedback.filter(f => !f.leido).map(f => f.id);
    if (unreadIds.length === 0) return;

    try {
      await supabase
        .from('content_feedback')
        .update({ leido: true })
        .in('id', unreadIds);
      
      setAllFeedback(prev => prev.map(f => 
        unreadIds.includes(f.id) ? { ...f, leido: true } : f
      ));

      toast({
        title: "Marcados como leídos",
        description: `${unreadIds.length} elementos marcados`
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Feedback</h1>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Feedback de Usuarios</h1>
        {stats.unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <Check className="h-4 w-4 mr-2" />
            Marcar todo como leído
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className={cn("cursor-pointer transition-colors", filter === 'all' && "ring-2 ring-primary")} onClick={() => setFilter('all')}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className={cn("cursor-pointer transition-colors", filter === 'positive' && "ring-2 ring-primary")} onClick={() => setFilter('positive')}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <p className="text-2xl font-bold text-green-500">{stats.positive}</p>
            </div>
            <p className="text-sm text-muted-foreground">Positivos</p>
          </CardContent>
        </Card>
        <Card className={cn("cursor-pointer transition-colors", filter === 'negative' && "ring-2 ring-primary")} onClick={() => setFilter('negative')}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <p className="text-2xl font-bold text-red-500">{stats.negative}</p>
            </div>
            <p className="text-sm text-muted-foreground">Negativos</p>
          </CardContent>
        </Card>
        <Card className={cn("cursor-pointer transition-colors", filter === 'unread' && "ring-2 ring-primary")} onClick={() => setFilter('unread')}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{stats.unread}</p>
            <p className="text-sm text-muted-foreground">Sin leer</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.satisfactionRate}%</p>
            <p className="text-sm text-muted-foreground">Satisfacción</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipo de contenido" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="sleep_story">Historias de Sueño</SelectItem>
                <SelectItem value="novena">Novenas</SelectItem>
                <SelectItem value="lesson">Lecciones</SelectItem>
                <SelectItem value="oracion">Oraciones</SelectItem>
                <SelectItem value="movie">Películas</SelectItem>
                <SelectItem value="course">Cursos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo el tiempo</SelectItem>
                <SelectItem value="7d">Últimos 7 días</SelectItem>
                <SelectItem value="30d">Últimos 30 días</SelectItem>
                <SelectItem value="90d">Últimos 90 días</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Feedback List */}
          <div className="space-y-4">
            {filteredFeedback.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No hay feedback que mostrar
                </CardContent>
              </Card>
            ) : (
              filteredFeedback.map((item) => (
                <Card 
                  key={item.id} 
                  className={cn(!item.leido && "border-l-4 border-l-primary")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={cn(
                          "p-2 rounded-full shrink-0",
                          item.rating === 5 ? "bg-green-500/10" : "bg-red-500/10"
                        )}>
                          {item.rating === 5 ? (
                            <ThumbsUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <ThumbsDown className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{item.user_name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {contentTypeLabels[item.content_type] || item.content_type}
                            </Badge>
                            {!item.leido && (
                              <Badge className="bg-primary/10 text-primary text-xs">Nuevo</Badge>
                            )}
                          </div>
                          {item.comentario && (
                            <p className="text-sm text-muted-foreground flex items-start gap-1">
                              <MessageSquare className="h-4 w-4 shrink-0 mt-0.5" />
                              {item.comentario}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {!item.leido && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => markAsRead(item.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Feedback by Content Type - Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Feedback por Tipo de Contenido
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsByType.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <BarChart data={statsByType} layout="vertical">
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="positive" name="Positivos" fill="hsl(142, 76%, 36%)" stackId="a" />
                      <Bar dataKey="negative" name="Negativos" fill="hsl(0, 84%, 60%)" stackId="a" />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No hay datos suficientes
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                {statsByType.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <PieChart>
                      <Pie
                        data={statsByType}
                        dataKey="total"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {statsByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No hay datos suficientes
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Satisfaction by Type Table */}
          <Card>
            <CardHeader>
              <CardTitle>Satisfacción por Tipo de Contenido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statsByType.length > 0 ? (
                  statsByType.map((item) => (
                    <div key={item.type} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <span className="text-muted-foreground">{item.total} total</span>
                        <span className="text-green-500">{item.positive} 👍</span>
                        <span className="text-red-500">{item.negative} 👎</span>
                        <Badge variant={item.satisfaction >= 70 ? "default" : item.satisfaction >= 50 ? "secondary" : "destructive"}>
                          {item.satisfaction}% satisfacción
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No hay datos suficientes
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {/* Trend Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tendencia de Feedback (Últimos 7 días)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <LineChart data={trendData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="positive" 
                    name="Positivos"
                    stroke="hsl(142, 76%, 36%)" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(142, 76%, 36%)" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="negative" 
                    name="Negativos"
                    stroke="hsl(0, 84%, 60%)" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(0, 84%, 60%)" }}
                  />
                  <Legend />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Daily Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen Diario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {trendData.map((day, i) => {
                  const total = day.positive + day.negative;
                  const satisfaction = total > 0 ? Math.round((day.positive / total) * 100) : 0;
                  return (
                    <div key={i} className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">{day.date}</p>
                      <p className="text-lg font-bold">{total}</p>
                      {total > 0 && (
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            satisfaction >= 70 ? "text-green-500 border-green-500/30" : 
                            satisfaction >= 50 ? "text-yellow-500 border-yellow-500/30" : 
                            "text-red-500 border-red-500/30"
                          )}
                        >
                          {satisfaction}%
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
