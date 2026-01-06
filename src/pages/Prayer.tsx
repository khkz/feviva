import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useUserStats } from "@/hooks/useUserStats";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Plus, 
  Heart, 
  HandHeart, 
  BookOpen, 
  Loader2,
  CheckCircle2,
  Trash2
} from "lucide-react";

interface PrayerEntry {
  id: string;
  tipo: string;
  contenido: string;
  versiculo_relacionado: string | null;
  respondida: boolean;
  fecha_respuesta: string | null;
  notas_respuesta: string | null;
  created_at: string;
}

const Prayer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addPoints } = useUserStats();
  
  const [prayers, setPrayers] = useState<PrayerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form states
  const [newPrayerType, setNewPrayerType] = useState<'oracion_libre' | 'peticion' | 'agradecimiento'>('oracion_libre');
  const [newPrayerContent, setNewPrayerContent] = useState('');
  const [newPrayerVerse, setNewPrayerVerse] = useState('');

  useEffect(() => {
    fetchPrayers();
  }, []);

  const fetchPrayers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('prayer_journal')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrayers(data || []);
    } catch (error) {
      console.error('Error fetching prayers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newPrayerContent.trim()) {
      toast({
        title: "Contenido requerido",
        description: "Por favor escribe tu oración o petición.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      const { error } = await supabase
        .from('prayer_journal')
        .insert({
          user_id: user.id,
          tipo: newPrayerType,
          contenido: newPrayerContent,
          versiculo_relacionado: newPrayerVerse || null
        });

      if (error) throw error;

      await addPoints(5, 'Oración registrada');
      
      toast({
        title: "Oración guardada",
        description: "+5 puntos",
      });

      setNewPrayerContent('');
      setNewPrayerVerse('');
      fetchPrayers();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la oración.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAnswered = async (prayer: PrayerEntry) => {
    try {
      const { error } = await supabase
        .from('prayer_journal')
        .update({
          respondida: !prayer.respondida,
          fecha_respuesta: !prayer.respondida ? new Date().toISOString().split('T')[0] : null
        })
        .eq('id', prayer.id);

      if (error) throw error;

      if (!prayer.respondida) {
        await addPoints(10, 'Petición respondida');
        toast({
          title: "¡Gloria a Dios!",
          description: "+10 puntos por registrar una respuesta de oración",
        });
      }

      fetchPrayers();
    } catch (error) {
      console.error('Error updating prayer:', error);
    }
  };

  const deletePrayer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('prayer_journal')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchPrayers();
    } catch (error) {
      console.error('Error deleting prayer:', error);
    }
  };

  const getTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'oracion_libre': return 'Oración';
      case 'peticion': return 'Petición';
      case 'agradecimiento': return 'Agradecimiento';
      case 'lectio_divina': return 'Lectio Divina';
      default: return tipo;
    }
  };

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'oracion_libre': return 'bg-primary/10 text-primary';
      case 'peticion': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'agradecimiento': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'lectio_divina': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const filteredPrayers = (tipo?: string) => {
    if (!tipo) return prayers;
    return prayers.filter(p => p.tipo === tipo);
  };

  const peticionesRespondidas = prayers.filter(p => p.tipo === 'peticion' && p.respondida).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <h1 className="font-semibold">Oración y Diario</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-primary">{prayers.length}</p>
              <p className="text-xs text-muted-foreground">Total oraciones</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{filteredPrayers('peticion').length}</p>
              <p className="text-xs text-muted-foreground">Peticiones</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-green-600">{peticionesRespondidas}</p>
              <p className="text-xs text-muted-foreground">Respondidas</p>
            </CardContent>
          </Card>
        </div>

        {/* New Prayer Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nueva entrada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {(['oracion_libre', 'peticion', 'agradecimiento'] as const).map((tipo) => (
                <Button
                  key={tipo}
                  variant={newPrayerType === tipo ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNewPrayerType(tipo)}
                >
                  {tipo === 'oracion_libre' && <Heart className="h-4 w-4 mr-1" />}
                  {tipo === 'peticion' && <HandHeart className="h-4 w-4 mr-1" />}
                  {tipo === 'agradecimiento' && <CheckCircle2 className="h-4 w-4 mr-1" />}
                  {getTypeLabel(tipo)}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Tu oración</Label>
              <Textarea
                value={newPrayerContent}
                onChange={(e) => setNewPrayerContent(e.target.value)}
                placeholder={
                  newPrayerType === 'peticion' 
                    ? "¿Qué le pides a Dios?" 
                    : newPrayerType === 'agradecimiento'
                    ? "¿Por qué das gracias?"
                    : "Escribe tu oración libremente..."
                }
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Versículo relacionado (opcional)</Label>
              <Input
                value={newPrayerVerse}
                onChange={(e) => setNewPrayerVerse(e.target.value)}
                placeholder="Ej: Filipenses 4:6"
              />
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={submitting}
              className="w-full"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Guardar oración
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Prayer List */}
        <Tabs defaultValue="todas">
          <TabsList className="w-full">
            <TabsTrigger value="todas" className="flex-1">Todas</TabsTrigger>
            <TabsTrigger value="peticiones" className="flex-1">Peticiones</TabsTrigger>
            <TabsTrigger value="agradecimientos" className="flex-1">Gracias</TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="mt-4">
            <PrayerList 
              prayers={prayers} 
              loading={loading}
              onToggleAnswered={toggleAnswered}
              onDelete={deletePrayer}
              getTypeLabel={getTypeLabel}
              getTypeColor={getTypeColor}
            />
          </TabsContent>

          <TabsContent value="peticiones" className="mt-4">
            <PrayerList 
              prayers={filteredPrayers('peticion')} 
              loading={loading}
              onToggleAnswered={toggleAnswered}
              onDelete={deletePrayer}
              getTypeLabel={getTypeLabel}
              getTypeColor={getTypeColor}
              showAnsweredToggle
            />
          </TabsContent>

          <TabsContent value="agradecimientos" className="mt-4">
            <PrayerList 
              prayers={filteredPrayers('agradecimiento')} 
              loading={loading}
              onToggleAnswered={toggleAnswered}
              onDelete={deletePrayer}
              getTypeLabel={getTypeLabel}
              getTypeColor={getTypeColor}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

interface PrayerListProps {
  prayers: PrayerEntry[];
  loading: boolean;
  onToggleAnswered: (prayer: PrayerEntry) => void;
  onDelete: (id: string) => void;
  getTypeLabel: (tipo: string) => string;
  getTypeColor: (tipo: string) => string;
  showAnsweredToggle?: boolean;
}

const PrayerList = ({ 
  prayers, 
  loading, 
  onToggleAnswered, 
  onDelete,
  getTypeLabel, 
  getTypeColor,
  showAnsweredToggle 
}: PrayerListProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (prayers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No hay oraciones registradas</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-3 pr-4">
        {prayers.map((prayer) => (
          <Card key={prayer.id} className={prayer.respondida ? 'bg-green-50/50 dark:bg-green-950/20' : ''}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <Badge className={getTypeColor(prayer.tipo)}>
                  {getTypeLabel(prayer.tipo)}
                </Badge>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(prayer.created_at).toLocaleDateString('es-ES')}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onDelete(prayer.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-foreground">{prayer.contenido}</p>
              
              {prayer.versiculo_relacionado && (
                <p className="text-xs text-primary italic">
                  📖 {prayer.versiculo_relacionado}
                </p>
              )}
              
              {showAnsweredToggle && prayer.tipo === 'peticion' && (
                <div className="flex items-center gap-2 pt-2">
                  <Checkbox
                    id={`answered-${prayer.id}`}
                    checked={prayer.respondida}
                    onCheckedChange={() => onToggleAnswered(prayer)}
                  />
                  <Label 
                    htmlFor={`answered-${prayer.id}`}
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    {prayer.respondida ? '¡Respondida!' : 'Marcar como respondida'}
                  </Label>
                </div>
              )}
              
              {prayer.respondida && prayer.fecha_respuesta && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  ✓ Respondida el {new Date(prayer.fecha_respuesta).toLocaleDateString('es-ES')}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default Prayer;
