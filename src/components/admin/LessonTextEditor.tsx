import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Eye,
  Edit,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  Save,
  X,
  BookOpen,
  ShieldCheck,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface LessonForEdit {
  id: string;
  titulo: string;
  categoria: string;
  contenido: string;
  contenido_enriquecido: string | null;
  audio_url: string | null;
  resumen_audio: string | null;
  estado_verificacion: string;
  verificado_at: string | null;
  verificado_por: string | null;
}

interface LessonTextEditorProps {
  lessons: LessonForEdit[];
  onRefresh: () => void;
}

export const LessonTextEditor = ({ lessons, onRefresh }: LessonTextEditorProps) => {
  const [selectedLesson, setSelectedLesson] = useState<LessonForEdit | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredLessons = lessons.filter(l => {
    if (searchQuery && !l.titulo.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterStatus === 'sin_verificar' && l.estado_verificacion !== 'sin_verificar') return false;
    if (filterStatus === 'verificado' && l.estado_verificacion !== 'verificado') return false;
    if (filterStatus === 'desincronizado' && l.estado_verificacion !== 'desincronizado_audio') return false;
    if (filterStatus === 'sin_contenido' && l.contenido_enriquecido) return false;
    return true;
  });

  const getStatusBadge = (lesson: LessonForEdit) => {
    const hasAudio = !!lesson.audio_url;
    const hasEnriched = !!lesson.contenido_enriquecido;

    if (lesson.estado_verificacion === 'verificado') {
      return (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
          <ShieldCheck className="h-3 w-3 mr-1" />
          Verificado
        </Badge>
      );
    }
    if (lesson.estado_verificacion === 'desincronizado_audio') {
      return (
        <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/30">
          <VolumeX className="h-3 w-3 mr-1" />
          Audio desincronizado
        </Badge>
      );
    }
    if (hasEnriched) {
      return (
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
          <ShieldAlert className="h-3 w-3 mr-1" />
          Pendiente revisión
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">Sin contenido</Badge>
    );
  };

  const getAudioSyncBadge = (lesson: LessonForEdit) => {
    if (!lesson.audio_url) return <Badge variant="outline" className="text-muted-foreground"><VolumeX className="h-3 w-3 mr-1" />Sin audio</Badge>;
    if (lesson.estado_verificacion === 'desincronizado_audio') {
      return <Badge className="bg-red-500/10 text-red-600 border-red-500/30"><AlertTriangle className="h-3 w-3 mr-1" />Audio = texto viejo</Badge>;
    }
    return <Badge variant="outline" className="text-green-600 border-green-600/30"><Volume2 className="h-3 w-3 mr-1" />Audio OK</Badge>;
  };

  const openPreview = (lesson: LessonForEdit) => {
    setSelectedLesson(lesson);
    setEditMode(false);
    setEditedContent(lesson.contenido_enriquecido || lesson.contenido);
  };

  const startEdit = () => {
    if (!selectedLesson) return;
    setEditedContent(selectedLesson.contenido_enriquecido || selectedLesson.contenido);
    setEditMode(true);
  };

  const saveContent = async () => {
    if (!selectedLesson) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('library_lessons')
        .update({
          contenido_enriquecido: editedContent,
          estado_verificacion: selectedLesson.audio_url ? 'desincronizado_audio' : 'sin_verificar',
        })
        .eq('id', selectedLesson.id);

      if (error) throw error;

      toast.success('Contenido guardado. Marcado como desincronizado si tiene audio.');
      setEditMode(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const markAsVerified = async (lessonId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('library_lessons')
        .update({
          estado_verificacion: 'verificado',
          verificado_por: user?.id,
          verificado_at: new Date().toISOString(),
        })
        .eq('id', lessonId);

      if (error) throw error;

      toast.success('Lección marcada como verificada por humano');
      onRefresh();
      if (selectedLesson?.id === lessonId) {
        setSelectedLesson(prev => prev ? { ...prev, estado_verificacion: 'verificado', verificado_at: new Date().toISOString() } : null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al verificar');
    }
  };

  // Stats
  const stats = {
    total: lessons.length,
    verificados: lessons.filter(l => l.estado_verificacion === 'verificado').length,
    pendientes: lessons.filter(l => l.estado_verificacion === 'sin_verificar' && l.contenido_enriquecido).length,
    desincronizados: lessons.filter(l => l.audio_url && l.contenido_enriquecido && l.estado_verificacion !== 'verificado').length,
    sinContenido: lessons.filter(l => !l.contenido_enriquecido).length,
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="cursor-pointer" onClick={() => setFilterStatus('all')}>
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => setFilterStatus('verificado')}>
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-green-600">{stats.verificados}</p>
            <p className="text-xs text-muted-foreground">✅ Verificados</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => setFilterStatus('sin_verificar')}>
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-amber-600">{stats.pendientes}</p>
            <p className="text-xs text-muted-foreground">⏳ Pendientes</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => setFilterStatus('desincronizado')}>
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-red-600">{stats.desincronizados}</p>
            <p className="text-xs text-muted-foreground">🔇 Desincronizados</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => setFilterStatus('sin_contenido')}>
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-muted-foreground">{stats.sinContenido}</p>
            <p className="text-xs text-muted-foreground">📝 Sin contenido</p>
          </CardContent>
        </Card>
      </div>

      {/* Warning banner */}
      {stats.desincronizados > 0 && (
        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardContent className="p-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-orange-700">
                {stats.desincronizados} lecciones tienen texto nuevo pero audio viejo
              </p>
              <p className="text-xs text-muted-foreground">
                Los audios fueron generados con el texto anterior. El audio NO se puede regenerar automáticamente.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar lección..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Lessons list */}
      <div className="space-y-2">
        {filteredLessons.map((lesson) => (
          <Card key={lesson.id} className="hover:bg-accent/50 transition-colors">
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-sm truncate">{lesson.titulo}</h3>
                    <Badge variant="outline" className="text-xs shrink-0">{lesson.categoria}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {getStatusBadge(lesson)}
                    {getAudioSyncBadge(lesson)}
                  </div>
                  {lesson.contenido_enriquecido && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {lesson.contenido_enriquecido.replace(/<[^>]*>/g, '').substring(0, 120)}...
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openPreview(lesson)} title="Ver texto">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {lesson.estado_verificacion !== 'verificado' && lesson.contenido_enriquecido && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsVerified(lesson.id)}
                      title="Marcar como verificado"
                      className="text-green-600 hover:text-green-700"
                    >
                      <ShieldCheck className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview/Edit Dialog */}
      <Dialog open={!!selectedLesson} onOpenChange={(open) => { if (!open) { setSelectedLesson(null); setEditMode(false); } }}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {selectedLesson?.titulo}
            </DialogTitle>
            {selectedLesson && (
              <div className="flex items-center gap-2 flex-wrap">
                {getStatusBadge(selectedLesson)}
                {getAudioSyncBadge(selectedLesson)}
                {selectedLesson.verificado_at && (
                  <span className="text-xs text-muted-foreground">
                    Verificado: {new Date(selectedLesson.verificado_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}
          </DialogHeader>

          {editMode ? (
            <div className="space-y-3">
              <div className="bg-amber-500/5 border border-amber-500/20 rounded p-2 text-xs text-amber-700">
                ⚠️ Si esta lección tiene audio, al guardar se marcará como "Audio desincronizado" porque el audio fue generado con el texto anterior.
              </div>
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[400px] font-mono text-xs"
                placeholder="Contenido HTML de la lección..."
              />
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh]">
              {selectedLesson?.contenido_enriquecido ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none p-4"
                  dangerouslySetInnerHTML={{ __html: selectedLesson.contenido_enriquecido }}
                />
              ) : selectedLesson?.contenido ? (
                <div className="p-4 text-sm whitespace-pre-wrap">{selectedLesson.contenido}</div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">Sin contenido enriquecido</div>
              )}
            </ScrollArea>
          )}

          <DialogFooter className="flex-wrap gap-2">
            {editMode ? (
              <>
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  <X className="h-4 w-4 mr-1" /> Cancelar
                </Button>
                <Button onClick={saveContent} disabled={saving}>
                  <Save className="h-4 w-4 mr-1" /> {saving ? 'Guardando...' : 'Guardar'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={startEdit}>
                  <Edit className="h-4 w-4 mr-1" /> Editar HTML
                </Button>
                {selectedLesson && selectedLesson.estado_verificacion !== 'verificado' && selectedLesson.contenido_enriquecido && (
                  <Button onClick={() => markAsVerified(selectedLesson.id)} className="bg-green-600 hover:bg-green-700">
                    <ShieldCheck className="h-4 w-4 mr-1" /> Marcar verificado
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
