import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Plus, Play, RefreshCw, Trash2, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProcessingJobs } from '@/hooks/useProcessingJobs';

export const AdminBiblePlan = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [diaInicio, setDiaInicio] = useState(11); // Empezar desde día 11 (ya hay 10)
  const [diaFin, setDiaFin] = useState(50);
  const [isQueuing, setIsQueuing] = useState(false);
  const [existingDays, setExistingDays] = useState<number[]>([]);
  const [loadingDays, setLoadingDays] = useState(false);
  
  const { jobs, stats, loading, triggerProcessing, retryFailed, clearCompleted } = useProcessingJobs({
    jobType: 'bible_day',
    autoRefresh: true,
    refreshInterval: 5000
  });

  // Cargar días existentes
  const loadExistingDays = async () => {
    setLoadingDays(true);
    const { data } = await supabase
      .from('bible_reading_plan')
      .select('dia')
      .order('dia');
    
    if (data) {
      setExistingDays(data.map(d => d.dia));
    }
    setLoadingDays(false);
  };

  // Encolar días para generar
  const queueDays = async () => {
    if (diaInicio > diaFin || diaInicio < 1 || diaFin > 365) {
      toast({
        title: 'Rango inválido',
        description: 'El rango debe estar entre 1 y 365',
        variant: 'destructive'
      });
      return;
    }

    setIsQueuing(true);
    
    try {
      // Obtener días existentes primero
      const { data: existing } = await supabase
        .from('bible_reading_plan')
        .select('dia');
      
      const existingDias = new Set(existing?.map(d => d.dia) || []);
      
      // Obtener días ya en cola
      const { data: queued } = await supabase
        .from('processing_jobs')
        .select('target_id')
        .eq('job_type', 'bible_day')
        .in('status', ['pending', 'processing']);
      
      const queuedDias = new Set(queued?.map(j => parseInt(j.target_id)) || []);
      
      // Preparar nuevos jobs
      const jobsToQueue = [];
      for (let dia = diaInicio; dia <= diaFin; dia++) {
        if (!existingDias.has(dia) && !queuedDias.has(dia)) {
          jobsToQueue.push({
            job_type: 'bible_day',
            target_table: 'bible_reading_plan',
            target_id: dia.toString(),
            target_title: `Día ${dia}`,
            status: 'pending',
            attempts: 0,
            max_attempts: 3
          });
        }
      }
      
      if (jobsToQueue.length === 0) {
        toast({
          title: 'Sin días nuevos',
          description: 'Todos los días en este rango ya existen o están en cola'
        });
        setIsQueuing(false);
        return;
      }
      
      // Insertar jobs
      const { error } = await supabase
        .from('processing_jobs')
        .insert(jobsToQueue);
      
      if (error) throw error;
      
      toast({
        title: '¡Días encolados!',
        description: `${jobsToQueue.length} días añadidos a la cola de procesamiento`
      });
      
      loadExistingDays();
      
    } catch (error) {
      console.error('Error encolando días:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron encolar los días',
        variant: 'destructive'
      });
    } finally {
      setIsQueuing(false);
    }
  };

  // Encolar todos los días faltantes
  const queueAllMissing = async () => {
    setDiaInicio(1);
    setDiaFin(365);
    await queueDays();
  };

  // Procesar siguiente lote
  const processNext = async (count: number = 5) => {
    try {
      await triggerProcessing(count);
      toast({
        title: 'Procesando',
        description: `Procesando ${count} días...`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo iniciar el procesamiento',
        variant: 'destructive'
      });
    }
  };

  useState(() => {
    loadExistingDays();
  });

  const completedDays = existingDays.length;
  const progressPercentage = (completedDays / 365) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Plan Bíblico 365</h1>
              <p className="text-sm text-muted-foreground">Generación de contenido</p>
            </div>
          </div>
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto space-y-6">
        {/* Progreso General */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Progreso del Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{completedDays}/365 días</span>
                <Badge variant={completedDays >= 365 ? 'default' : 'secondary'}>
                  {progressPercentage.toFixed(1)}%
                </Badge>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              
              {loadingDays && (
                <p className="text-sm text-muted-foreground">Cargando días existentes...</p>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadExistingDays}
                disabled={loadingDays}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingDays ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Encolar Días */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Encolar Días
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="diaInicio">Desde día</Label>
                  <Input
                    id="diaInicio"
                    type="number"
                    min={1}
                    max={365}
                    value={diaInicio}
                    onChange={(e) => setDiaInicio(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <Label htmlFor="diaFin">Hasta día</Label>
                  <Input
                    id="diaFin"
                    type="number"
                    min={1}
                    max={365}
                    value={diaFin}
                    onChange={(e) => setDiaFin(parseInt(e.target.value) || 365)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={queueDays} disabled={isQueuing}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isQueuing ? 'Encolando...' : `Encolar ${diaFin - diaInicio + 1} días`}
                </Button>
                <Button variant="outline" onClick={queueAllMissing} disabled={isQueuing}>
                  Encolar todos los faltantes
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Estado del Procesamiento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Procesamiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <p className="text-muted-foreground">Cargando estado...</p>
              ) : stats ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <Clock className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                      <p className="text-2xl font-bold">{stats.pending}</p>
                      <p className="text-xs text-muted-foreground">Pendientes</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <RefreshCw className="h-5 w-5 mx-auto mb-1 text-blue-500 animate-spin" />
                      <p className="text-2xl font-bold">{stats.processing}</p>
                      <p className="text-xs text-muted-foreground">Procesando</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <CheckCircle className="h-5 w-5 mx-auto mb-1 text-green-500" />
                      <p className="text-2xl font-bold">{stats.completed}</p>
                      <p className="text-xs text-muted-foreground">Completados</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <AlertCircle className="h-5 w-5 mx-auto mb-1 text-red-500" />
                      <p className="text-2xl font-bold">{stats.error}</p>
                      <p className="text-xs text-muted-foreground">Errores</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => processNext(1)} disabled={stats.pending === 0}>
                      <Play className="h-4 w-4 mr-2" />
                      Procesar 1
                    </Button>
                    <Button onClick={() => processNext(5)} disabled={stats.pending === 0}>
                      <Play className="h-4 w-4 mr-2" />
                      Procesar 5
                    </Button>
                    <Button onClick={() => processNext(10)} disabled={stats.pending === 0}>
                      <Play className="h-4 w-4 mr-2" />
                      Procesar 10
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => retryFailed()}
                      disabled={stats.error === 0}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reintentar fallidos
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => clearCompleted()}
                      disabled={stats.completed === 0}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Limpiar completados
                    </Button>
                  </div>

                  {stats.avgProcessingTime > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Tiempo promedio: {(stats.avgProcessingTime / 1000).toFixed(1)}s por día
                    </p>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">No hay datos de procesamiento</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Jobs Recientes */}
        {jobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Jobs Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {jobs.slice(0, 20).map((job) => (
                    <div 
                      key={job.id} 
                      className="flex items-center justify-between p-2 rounded-lg bg-muted"
                    >
                      <div className="flex items-center gap-2">
                        {job.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {job.status === 'processing' && <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />}
                        {job.status === 'pending' && <Clock className="h-4 w-4 text-yellow-500" />}
                        {job.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                        <span className="text-sm font-medium">{job.target_title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.processing_time_ms && (
                          <span className="text-xs text-muted-foreground">
                            {(job.processing_time_ms / 1000).toFixed(1)}s
                          </span>
                        )}
                        <Badge variant={
                          job.status === 'completed' ? 'default' :
                          job.status === 'error' ? 'destructive' :
                          job.status === 'processing' ? 'secondary' : 'outline'
                        }>
                          {job.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminBiblePlan;
