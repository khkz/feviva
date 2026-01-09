import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Church,
  Image,
  BookOpen,
  Sparkles,
  RefreshCw,
  Search,
  Eye,
  Edit,
  ImagePlus,
  Check,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface CalendarSaint {
  id: string;
  name: string;
  description: string | null;
  feast_day: number;
  feast_month: number;
  category: string;
  country_code: string | null;
  image_url: string | null;
  prayer_id: string | null;
  tags: string[] | null;
  created_at: string | null;
}

interface BatchProgress {
  current: number;
  total: number;
  results: { name: string; success: boolean; error?: string }[];
}

const ITEMS_PER_PAGE = 20;

const categoryLabels: Record<string, string> = {
  feast: 'Fiesta',
  memorial: 'Memorial',
  optional_memorial: 'Memoria Opcional',
  patron_country: 'Patrono Nacional',
  solemnity: 'Solemnidad',
  universal_helper: 'Auxiliador Universal',
};

const countryFlags: Record<string, string> = {
  AR: '🇦🇷', BO: '🇧🇴', BR: '🇧🇷', CL: '🇨🇱', CO: '🇨🇴',
  CR: '🇨🇷', CU: '🇨🇺', DO: '🇩🇴', EC: '🇪🇨', GT: '🇬🇹',
  HN: '🇭🇳', MX: '🇲🇽', NI: '🇳🇮', PA: '🇵🇦', PE: '🇵🇪',
  PR: '🇵🇷', PY: '🇵🇾', SV: '🇸🇻', UY: '🇺🇾', VE: '🇻🇪',
};

const monthNames = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export default function AdminSantos() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [imageFilter, setImageFilter] = useState<string>('all');
  const [prayerFilter, setPrayerFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [editingSaint, setEditingSaint] = useState<CalendarSaint | null>(null);
  const [editedDescription, setEditedDescription] = useState('');
  const [viewingSaint, setViewingSaint] = useState<CalendarSaint | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null);

  // Fetch all saints
  const { data: saints = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-calendar-saints'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_saints')
        .select('*')
        .order('feast_month', { ascending: true })
        .order('feast_day', { ascending: true });

      if (error) throw error;
      return data as CalendarSaint[];
    },
  });

  // Fetch oraciones for linking
  const { data: oraciones = [] } = useQuery({
    queryKey: ['admin-oraciones-for-saints'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('oraciones')
        .select('id, nombre')
        .order('nombre');

      if (error) throw error;
      return data;
    },
  });

  // Update description mutation
  const updateDescriptionMutation = useMutation({
    mutationFn: async ({ id, description }: { id: string; description: string }) => {
      const { error } = await supabase
        .from('calendar_saints')
        .update({ description })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-calendar-saints'] });
      toast.success('Historia actualizada correctamente');
      setEditingSaint(null);
    },
    onError: (error) => {
      toast.error('Error al actualizar: ' + error.message);
    },
  });

  // Generate single image mutation
  const generateImageMutation = useMutation({
    mutationFn: async (saintId: string) => {
      setGeneratingId(saintId);
      const { data, error } = await supabase.functions.invoke('generate-saint-image', {
        body: { saintId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-calendar-saints'] });
      toast.success('Imagen generada correctamente');
      setGeneratingId(null);
    },
    onError: (error) => {
      toast.error('Error al generar imagen: ' + error.message);
      setGeneratingId(null);
    },
  });

  // Batch generate images
  const generateBatchImagesMutation = useMutation({
    mutationFn: async (onlyPatrons: boolean) => {
      const saintsWithoutImage = saints.filter(s => 
        !s.image_url && (onlyPatrons ? s.category === 'patron_country' : true)
      );
      
      setBatchProgress({ current: 0, total: saintsWithoutImage.length, results: [] });

      const results: BatchProgress['results'] = [];
      
      for (let i = 0; i < saintsWithoutImage.length; i++) {
        const saint = saintsWithoutImage[i];
        try {
          await supabase.functions.invoke('generate-saint-image', {
            body: { saintId: saint.id },
          });
          results.push({ name: saint.name, success: true });
        } catch (error: any) {
          results.push({ name: saint.name, success: false, error: error.message });
        }
        setBatchProgress({ current: i + 1, total: saintsWithoutImage.length, results });
        
        // Small delay between requests
        if (i < saintsWithoutImage.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-calendar-saints'] });
      toast.success('Generación batch completada');
    },
    onError: (error) => {
      toast.error('Error en generación batch: ' + error.message);
    },
  });

  // Filter saints
  const filteredSaints = saints.filter(saint => {
    if (searchQuery && !saint.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (categoryFilter !== 'all' && saint.category !== categoryFilter) {
      return false;
    }
    if (countryFilter !== 'all' && saint.country_code !== countryFilter) {
      return false;
    }
    if (imageFilter === 'with' && !saint.image_url) {
      return false;
    }
    if (imageFilter === 'without' && saint.image_url) {
      return false;
    }
    if (prayerFilter === 'with' && !saint.prayer_id) {
      return false;
    }
    if (prayerFilter === 'without' && saint.prayer_id) {
      return false;
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSaints.length / ITEMS_PER_PAGE);
  const paginatedSaints = filteredSaints.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Stats
  const stats = {
    total: saints.length,
    withImage: saints.filter(s => s.image_url).length,
    withPrayer: saints.filter(s => s.prayer_id).length,
    withHistory: saints.filter(s => s.description && s.description.length > 100).length,
    patrons: saints.filter(s => s.category === 'patron_country').length,
    patronsWithoutImage: saints.filter(s => s.category === 'patron_country' && !s.image_url).length,
  };

  // Get unique countries
  const countries = [...new Set(saints.map(s => s.country_code).filter(Boolean))] as string[];

  const formatDate = (month: number, day: number) => {
    return `${day} ${monthNames[month - 1]}`;
  };

  const handleEditSave = () => {
    if (editingSaint) {
      updateDescriptionMutation.mutate({
        id: editingSaint.id,
        description: editedDescription,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Church className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Gestión de Santos</h1>
            <p className="text-muted-foreground">Calendario de 395 santos con imágenes, historias y oraciones</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refrescar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Santos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats.withImage}</div>
            <p className="text-xs text-muted-foreground">Con Imagen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats.withPrayer}</div>
            <p className="text-xs text-muted-foreground">Con Oración</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">{stats.withHistory}</div>
            <p className="text-xs text-muted-foreground">Con Historia</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-secondary">{stats.patrons}</div>
            <p className="text-xs text-muted-foreground">Patronos</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/50">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-destructive">{stats.patronsWithoutImage}</div>
            <p className="text-xs text-muted-foreground">Patronos sin Img</p>
          </CardContent>
        </Card>
      </div>

      {/* Batch Progress */}
      {batchProgress && (
        <Card className="border-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generando imágenes: {batchProgress.current} de {batchProgress.total}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={(batchProgress.current / batchProgress.total) * 100} />
            <ScrollArea className="h-32">
              <div className="space-y-1">
                {batchProgress.results.map((result, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {result.success ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-destructive" />
                    )}
                    <span className={result.success ? '' : 'text-destructive'}>
                      {result.name}
                    </span>
                    {result.error && (
                      <span className="text-xs text-muted-foreground">({result.error})</span>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            {batchProgress.current === batchProgress.total && (
              <Button variant="outline" size="sm" onClick={() => setBatchProgress(null)}>
                Cerrar
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters and Actions */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={countryFilter} onValueChange={(v) => { setCountryFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="País" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {countries.map(code => (
                  <SelectItem key={code} value={code}>
                    {countryFlags[code] || ''} {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={imageFilter} onValueChange={(v) => { setImageFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Imagen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="with">Con imagen</SelectItem>
                <SelectItem value="without">Sin imagen</SelectItem>
              </SelectContent>
            </Select>

            <Select value={prayerFilter} onValueChange={(v) => { setPrayerFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Oración" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="with">Con oración</SelectItem>
                <SelectItem value="without">Sin oración</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 ml-auto">
              <Button
                variant="secondary"
                onClick={() => generateBatchImagesMutation.mutate(true)}
                disabled={generateBatchImagesMutation.isPending || stats.patronsWithoutImage === 0}
              >
                <ImagePlus className="h-4 w-4 mr-2" />
                Generar {stats.patronsWithoutImage} patronos
              </Button>
            </div>
          </div>

          <div className="mt-3 text-sm text-muted-foreground">
            Mostrando {paginatedSaints.length} de {filteredSaints.length} santos
          </div>
        </CardContent>
      </Card>

      {/* Saints Table */}
      <Card>
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Nombre</TableHead>
                <TableHead className="w-[80px]">Fecha</TableHead>
                <TableHead className="w-[60px]">País</TableHead>
                <TableHead className="w-[140px]">Categoría</TableHead>
                <TableHead className="w-[80px] text-center">Historia</TableHead>
                <TableHead className="w-[80px] text-center">Oración</TableHead>
                <TableHead className="w-[80px] text-center">Imagen</TableHead>
                <TableHead className="w-[120px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : paginatedSaints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No se encontraron santos con los filtros actuales
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSaints.map((saint) => {
                  const hasHistory = saint.description && saint.description.length > 100;
                  const isGenerating = generatingId === saint.id;

                  return (
                    <TableRow key={saint.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {saint.category === 'patron_country' && (
                            <Badge variant="secondary" className="text-xs">Patrono</Badge>
                          )}
                          <span className="line-clamp-1">{saint.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(saint.feast_month, saint.feast_day)}
                      </TableCell>
                      <TableCell>
                        {saint.country_code ? (
                          <span className="text-lg">{countryFlags[saint.country_code] || saint.country_code}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {categoryLabels[saint.category] || saint.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {hasHistory ? (
                          <Check className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {saint.prayer_id ? (
                          <Check className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {saint.image_url ? (
                          <Check className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewingSaint(saint)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingSaint(saint);
                              setEditedDescription(saint.description || '');
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => generateImageMutation.mutate(saint.id)}
                            disabled={isGenerating || !!saint.image_url}
                          >
                            {isGenerating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ImagePlus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Edit History Modal */}
      <Dialog open={!!editingSaint} onOpenChange={(open) => !open && setEditingSaint(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Editar Historia: {editingSaint?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{editingSaint && formatDate(editingSaint.feast_month, editingSaint.feast_day)}</span>
              {editingSaint?.country_code && (
                <span>{countryFlags[editingSaint.country_code]} {editingSaint.country_code}</span>
              )}
              <Badge variant="outline">{editingSaint && categoryLabels[editingSaint.category]}</Badge>
            </div>
            <Textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              placeholder="Escribe la historia del santo..."
              className="min-h-[300px]"
            />
            <div className="text-sm text-muted-foreground">
              {editedDescription.length} caracteres
              {editedDescription.length < 100 && (
                <span className="text-destructive ml-2">(mínimo recomendado: 100)</span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSaint(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={updateDescriptionMutation.isPending}
            >
              {updateDescriptionMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Saint Modal */}
      <Dialog open={!!viewingSaint} onOpenChange={(open) => !open && setViewingSaint(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Church className="h-5 w-5" />
              {viewingSaint?.name}
            </DialogTitle>
          </DialogHeader>
          {viewingSaint && (
            <div className="space-y-4">
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg overflow-hidden">
                {viewingSaint.image_url ? (
                  <img
                    src={viewingSaint.image_url}
                    alt={viewingSaint.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Church className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-wrap gap-2">
                <Badge>{formatDate(viewingSaint.feast_month, viewingSaint.feast_day)}</Badge>
                {viewingSaint.country_code && (
                  <Badge variant="secondary">
                    {countryFlags[viewingSaint.country_code]} {viewingSaint.country_code}
                  </Badge>
                )}
                <Badge variant="outline">{categoryLabels[viewingSaint.category]}</Badge>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Historia
                </h4>
                {viewingSaint.description ? (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {viewingSaint.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Sin historia registrada</p>
                )}
              </div>

              {/* Prayer link */}
              {viewingSaint.prayer_id && (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-secondary" />
                  <span className="text-sm">Oración vinculada</span>
                  <Button variant="link" size="sm" className="h-auto p-0" asChild>
                    <a href={`/oraciones`} target="_blank" rel="noopener noreferrer">
                      Ver oración <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              )}

              {/* Tags */}
              {viewingSaint.tags && viewingSaint.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {viewingSaint.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (viewingSaint) {
                  setEditingSaint(viewingSaint);
                  setEditedDescription(viewingSaint.description || '');
                  setViewingSaint(null);
                }
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Historia
            </Button>
            <Button
              onClick={() => {
                if (viewingSaint && !viewingSaint.image_url) {
                  generateImageMutation.mutate(viewingSaint.id);
                  setViewingSaint(null);
                }
              }}
              disabled={!!viewingSaint?.image_url || generateImageMutation.isPending}
            >
              <ImagePlus className="h-4 w-4 mr-2" />
              {viewingSaint?.image_url ? 'Ya tiene imagen' : 'Generar Imagen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
