import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProcessingJobs, ProcessingJob } from "@/hooks/useProcessingJobs";
import { Loader2, RefreshCw, Trash2, RotateCcw, Play, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobProgressPanelProps {
  jobType: string;
  title?: string;
  showDetails?: boolean;
  className?: string;
}

const statusConfig: Record<string, {
  label: string;
  icon: typeof Clock;
  color: string;
  animate?: boolean;
}> = {
  pending: {
    label: "Pendiente",
    icon: Clock,
    color: "bg-muted text-muted-foreground",
  },
  processing: {
    label: "Procesando",
    icon: Loader2,
    color: "bg-primary/20 text-primary",
    animate: true,
  },
  completed: {
    label: "Completado",
    icon: CheckCircle,
    color: "bg-green-500/20 text-green-600",
  },
  error: {
    label: "Error",
    icon: XCircle,
    color: "bg-destructive/20 text-destructive",
  },
};

export const JobProgressPanel = ({
  jobType,
  title = "Progreso de Procesamiento",
  showDetails = true,
  className,
}: JobProgressPanelProps) => {
  const {
    jobs,
    stats,
    loading,
    triggerProcessing,
    retryFailed,
    clearCompleted,
    refetch,
  } = useProcessingJobs({ jobType });

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (stats.total === 0) {
    return null;
  }

  const progressPercent = stats.total > 0 
    ? ((stats.completed + stats.error) / stats.total) * 100 
    : 0;

  const isProcessing = stats.processing > 0;
  const hasPending = stats.pending > 0;
  const hasErrors = stats.error > 0;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              className="h-8 w-8"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Barra de progreso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {stats.completed} de {stats.total} completados
            </span>
            <span className="font-medium">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Estadísticas rápidas */}
        <div className="flex flex-wrap gap-2">
          {stats.pending > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              {stats.pending} pendientes
            </Badge>
          )}
          {stats.processing > 0 && (
            <Badge className="gap-1 bg-primary/20 text-primary border-primary/30">
              <Loader2 className="h-3 w-3 animate-spin" />
              {stats.processing} procesando
            </Badge>
          )}
          {stats.completed > 0 && (
            <Badge variant="secondary" className="gap-1 bg-green-500/20 text-green-600 border-green-500/30">
              <CheckCircle className="h-3 w-3" />
              {stats.completed} completados
            </Badge>
          )}
          {stats.error > 0 && (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="h-3 w-3" />
              {stats.error} errores
            </Badge>
          )}
        </div>

        {/* Acciones */}
        <div className="flex flex-wrap gap-2">
          {hasPending && !isProcessing && (
            <Button
              size="sm"
              onClick={() => triggerProcessing(1)}
              className="gap-1"
            >
              <Play className="h-3 w-3" />
              Procesar siguiente
            </Button>
          )}
          {hasErrors && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => retryFailed()}
              className="gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Reintentar fallidos
            </Button>
          )}
          {stats.completed > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => clearCompleted()}
              className="gap-1 text-muted-foreground"
            >
              <Trash2 className="h-3 w-3" />
              Limpiar completados
            </Button>
          )}
        </div>

        {/* Lista de jobs (detalle) */}
        {showDetails && jobs.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {jobs
              .filter(job => job.status !== 'completed')
              .slice(0, 10)
              .map((job) => (
                <JobItem key={job.id} job={job} />
              ))}
          </div>
        )}

        {/* Métricas adicionales */}
        {stats.successRate !== null && (
          <div className="pt-2 border-t text-xs text-muted-foreground flex justify-between">
            <span>Tasa de éxito: {stats.successRate.toFixed(1)}%</span>
            {stats.avgProcessingTime && (
              <span>Tiempo promedio: {(stats.avgProcessingTime / 1000).toFixed(1)}s</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const JobItem = ({ job }: { job: ProcessingJob }) => {
  const config = statusConfig[job.status];
  const Icon = config.icon;

  return (
    <div className={cn(
      "flex items-center gap-3 p-2 rounded-lg text-sm",
      config.color
    )}>
      <Icon className={cn("h-4 w-4 flex-shrink-0", config.animate && "animate-spin")} />
      <div className="flex-1 min-w-0">
        <p className="truncate font-medium">
          {job.target_title || job.target_id.slice(0, 8)}
        </p>
        {job.error_message && (
          <p className="text-xs text-destructive truncate flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {job.error_message}
          </p>
        )}
      </div>
      {job.attempts > 1 && (
        <Badge variant="outline" className="text-xs">
          Intento {job.attempts}/{job.max_attempts}
        </Badge>
      )}
    </div>
  );
};

export default JobProgressPanel;
