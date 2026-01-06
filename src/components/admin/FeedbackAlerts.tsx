import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, Check, Settings, History } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AlertConfig {
  id: string;
  content_type: string;
  threshold_percentage: number;
  time_window_hours: number;
  min_feedback_count: number;
  enabled: boolean;
}

interface AlertStatus {
  config_id: string;
  content_type: string;
  negative_count: number;
  total_count: number;
  negative_percentage: number;
  threshold_exceeded: boolean;
}

interface AlertHistoryItem {
  id: string;
  content_type: string;
  negative_count: number;
  total_count: number;
  negative_percentage: number;
  triggered_at: string;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
}

const contentTypeLabels: Record<string, string> = {
  sleep_story: 'Historias para Dormir',
  novena: 'Novenas',
  lesson: 'Lecciones',
};

export function FeedbackAlerts() {
  const [configs, setConfigs] = useState<AlertConfig[]>([]);
  const [alertStatus, setAlertStatus] = useState<AlertStatus[]>([]);
  const [history, setHistory] = useState<AlertHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch configurations
      const { data: configData, error: configError } = await supabase
        .from('feedback_alerts')
        .select('*')
        .order('content_type');

      if (configError) throw configError;
      setConfigs(configData || []);

      // Fetch current alert status
      const { data: statusData, error: statusError } = await supabase
        .rpc('check_feedback_alerts');

      if (statusError) throw statusError;
      setAlertStatus(statusData || []);

      // Fetch alert history
      const { data: historyData, error: historyError } = await supabase
        .from('feedback_alert_history')
        .select('*')
        .order('triggered_at', { ascending: false })
        .limit(50);

      if (historyError) throw historyError;
      setHistory(historyData || []);

      // Check for active alerts and record them
      const activeAlerts = (statusData || []).filter((s: AlertStatus) => s.threshold_exceeded);
      for (const alert of activeAlerts) {
        // Check if this alert was already recorded recently (last hour)
        const recentAlert = (historyData || []).find(
          (h: AlertHistoryItem) => 
            h.content_type === alert.content_type && 
            new Date(h.triggered_at).getTime() > Date.now() - 3600000
        );

        if (!recentAlert) {
          await supabase.from('feedback_alert_history').insert({
            alert_config_id: alert.config_id,
            content_type: alert.content_type,
            negative_count: alert.negative_count,
            total_count: alert.total_count,
            negative_percentage: alert.negative_percentage,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching alert data:', error);
      toast.error('Error al cargar datos de alertas');
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (id: string, updates: Partial<AlertConfig>) => {
    try {
      const { error } = await supabase
        .from('feedback_alerts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      setConfigs(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      setEditingId(null);
      toast.success('Configuración actualizada');
    } catch (error) {
      console.error('Error updating config:', error);
      toast.error('Error al actualizar');
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('feedback_alert_history')
        .update({ 
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: user?.id 
        })
        .eq('id', alertId);

      if (error) throw error;
      
      setHistory(prev => prev.map(h => 
        h.id === alertId 
          ? { ...h, acknowledged_at: new Date().toISOString(), acknowledged_by: user?.id || null }
          : h
      ));
      toast.success('Alerta reconocida');
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast.error('Error al reconocer alerta');
    }
  };

  const activeAlerts = alertStatus.filter(s => s.threshold_exceeded);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Alerts Banner */}
      {activeAlerts.length > 0 && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {activeAlerts.length} Alerta{activeAlerts.length > 1 ? 's' : ''} Activa{activeAlerts.length > 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeAlerts.map(alert => (
                <div key={alert.config_id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div>
                    <span className="font-medium">{contentTypeLabels[alert.content_type] || alert.content_type}</span>
                    <span className="text-muted-foreground ml-2">
                      {alert.negative_percentage}% negativo ({alert.negative_count}/{alert.total_count})
                    </span>
                  </div>
                  <Badge variant="destructive">Umbral superado</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status" className="gap-2">
            <Bell className="h-4 w-4" />
            Estado Actual
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-2">
            <Settings className="h-4 w-4" />
            Configuración
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Estado de Feedback por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo de Contenido</TableHead>
                    <TableHead>Feedback Negativo</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Porcentaje</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alertStatus.map(status => {
                    const config = configs.find(c => c.id === status.config_id);
                    return (
                      <TableRow key={status.config_id}>
                        <TableCell className="font-medium">
                          {contentTypeLabels[status.content_type] || status.content_type}
                        </TableCell>
                        <TableCell>{status.negative_count}</TableCell>
                        <TableCell>{status.total_count}</TableCell>
                        <TableCell>
                          <span className={status.threshold_exceeded ? 'text-destructive font-bold' : ''}>
                            {status.negative_percentage}%
                          </span>
                          <span className="text-muted-foreground text-xs ml-1">
                            (umbral: {config?.threshold_percentage}%)
                          </span>
                        </TableCell>
                        <TableCell>
                          {status.threshold_exceeded ? (
                            <Badge variant="destructive">Alerta</Badge>
                          ) : (
                            <Badge variant="secondary">Normal</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Alertas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo de Contenido</TableHead>
                    <TableHead>Umbral (%)</TableHead>
                    <TableHead>Ventana (horas)</TableHead>
                    <TableHead>Mín. Feedback</TableHead>
                    <TableHead>Habilitado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.map(config => (
                    <TableRow key={config.id}>
                      <TableCell className="font-medium">
                        {contentTypeLabels[config.content_type] || config.content_type}
                      </TableCell>
                      <TableCell>
                        {editingId === config.id ? (
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            defaultValue={config.threshold_percentage}
                            className="w-20"
                            onBlur={(e) => updateConfig(config.id, { threshold_percentage: parseInt(e.target.value) })}
                          />
                        ) : (
                          <span>{config.threshold_percentage}%</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === config.id ? (
                          <Input
                            type="number"
                            min={1}
                            max={168}
                            defaultValue={config.time_window_hours}
                            className="w-20"
                            onBlur={(e) => updateConfig(config.id, { time_window_hours: parseInt(e.target.value) })}
                          />
                        ) : (
                          <span>{config.time_window_hours}h</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === config.id ? (
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            defaultValue={config.min_feedback_count}
                            className="w-20"
                            onBlur={(e) => updateConfig(config.id, { min_feedback_count: parseInt(e.target.value) })}
                          />
                        ) : (
                          <span>{config.min_feedback_count}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={config.enabled}
                          onCheckedChange={(checked) => updateConfig(config.id, { enabled: checked })}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(editingId === config.id ? null : config.id)}
                        >
                          {editingId === config.id ? 'Listo' : 'Editar'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Alertas</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No hay alertas registradas
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Negativo</TableHead>
                      <TableHead>Porcentaje</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {format(new Date(item.triggered_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </TableCell>
                        <TableCell className="font-medium">
                          {contentTypeLabels[item.content_type] || item.content_type}
                        </TableCell>
                        <TableCell>{item.negative_count}/{item.total_count}</TableCell>
                        <TableCell>{item.negative_percentage}%</TableCell>
                        <TableCell>
                          {item.acknowledged_at ? (
                            <Badge variant="secondary" className="gap-1">
                              <Check className="h-3 w-3" />
                              Reconocida
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Pendiente</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {!item.acknowledged_at && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => acknowledgeAlert(item.id)}
                            >
                              Reconocer
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
