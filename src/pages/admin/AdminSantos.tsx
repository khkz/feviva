import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Wand2,
  FileText,
  AlertCircle,
  Play,
  BookHeart,
  Download,
  Cross,
  Globe,
} from 'lucide-react';

interface CalendarSaint {
  id: string;
  name: string;
  description: string | null;
  description_source: string | null;
  feast_day: number;
  feast_month: number;
  category: string;
  country_code: string | null;
  image_url: string | null;
  prayer_id: string | null;
  tags: string[] | null;
  created_at: string | null;
  estado_verificacion: string;
  fuente_descripcion: string | null;
}

interface BatchProgress {
  current: number;
  total: number;
  type: 'history' | 'prayer' | 'image';
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
  const [historyFilter, setHistoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [editingSaint, setEditingSaint] = useState<CalendarSaint | null>(null);
  const [editedDescription, setEditedDescription] = useState('');
  const [viewingSaint, setViewingSaint] = useState<CalendarSaint | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [generatingType, setGeneratingType] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null);

  // Batch generation settings
  const [batchLimit, setBatchLimit] = useState<number>(10);
  const [batchCategory, setBatchCategory] = useState<string>('all');

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

  // Generate single history mutation
  const generateHistoryMutation = useMutation({
    mutationFn: async (saintId: string) => {
      setGeneratingId(saintId);
      setGeneratingType('history');
      const { data, error } = await supabase.functions.invoke('generate-saint-history', {
        body: { saintId, forceRegenerate: false },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-calendar-saints'] });
      if (data?.skipped) {
        toast.info('El santo ya tiene historia');
      } else {
        toast.success('Historia generada correctamente');
      }
      setGeneratingId(null);
      setGeneratingType(null);
    },
    onError: (error) => {
      toast.error('Error al generar historia: ' + error.message);
      setGeneratingId(null);
      setGeneratingType(null);
    },
  });

  // Generate single prayer mutation
  const generatePrayerMutation = useMutation({
    mutationFn: async (saintId: string) => {
      setGeneratingId(saintId);
      setGeneratingType('prayer');
      const { data, error } = await supabase.functions.invoke('generate-saint-prayer', {
        body: { saintId, forceRegenerate: false },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-calendar-saints'] });
      if (data?.skipped) {
        toast.info('El santo ya tiene oración');
      } else {
        toast.success('Oración generada correctamente');
      }
      setGeneratingId(null);
      setGeneratingType(null);
    },
    onError: (error) => {
      toast.error('Error al generar oración: ' + error.message);
      setGeneratingId(null);
      setGeneratingType(null);
    },
  });

  // Generate single image mutation
  const generateImageMutation = useMutation({
    mutationFn: async (saintId: string) => {
      setGeneratingId(saintId);
      setGeneratingType('image');
      const { data, error } = await supabase.functions.invoke('generate-saint-image', {
        body: { saintId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-calendar-saints'] });
      if (data?.skipped) {
        toast.info('El santo ya tiene imagen');
      } else {
        toast.success('Imagen generada correctamente');
      }
      setGeneratingId(null);
      setGeneratingType(null);
    },
    onError: (error) => {
      toast.error('Error al generar imagen: ' + error.message);
      setGeneratingId(null);
      setGeneratingType(null);
    },
  });

  // Batch generate histories
  const batchHistoryMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('batch-generate-saint-content', {
        body: { 
          contentType: 'history', 
          onlyPatrons: batchCategory === 'patron_country',
          limit: batchLimit 
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-calendar-saints'] });
      toast.success(`Generadas ${data?.historyGenerated || 0} historias`);
    },
    onError: (error) => {
      toast.error('Error en batch: ' + error.message);
    },
  });

  // Batch generate prayers
  const batchPrayerMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('batch-generate-saint-content', {
        body: { 
          contentType: 'prayer', 
          onlyPatrons: batchCategory === 'patron_country',
          limit: batchLimit 
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-calendar-saints'] });
      toast.success(`Generadas ${data?.prayerGenerated || 0} oraciones`);
    },
    onError: (error) => {
      toast.error('Error en batch: ' + error.message);
    },
  });

  // Batch generate images
  const batchImageMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('batch-generate-saint-images', {
        body: { 
          onlyPatrons: batchCategory === 'patron_country',
          limit: batchLimit 
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-calendar-saints'] });
      toast.success(`Generadas ${data?.successCount || 0} imágenes`);
    },
    onError: (error) => {
      toast.error('Error en batch: ' + error.message);
    },
  });

  // Import traditional prayers mutation
  const importTraditionalPrayersMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('import-traditional-prayers', {
        body: { importAll: true, limit: 50 },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-calendar-saints'] });
      queryClient.invalidateQueries({ queryKey: ['admin-oraciones-for-saints'] });
      toast.success(`Importadas ${data?.summary?.created || 0} oraciones tradicionales, actualizadas ${data?.summary?.updated || 0}`);
    },
    onError: (error) => {
      toast.error('Error al importar: ' + error.message);
    },
  });

  // Fix fundamental prayers mutation
  const fixFundamentalPrayersMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('fix-fundamental-prayers', {
        body: { fixFundamental: true, fixMarian: true },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-calendar-saints'] });
      queryClient.invalidateQueries({ queryKey: ['admin-oraciones-for-saints'] });
      queryClient.invalidateQueries({ queryKey: ['oraciones'] });
      const summary = data?.summary;
      toast.success(`Corregidas ${summary?.fundamentalUpdated || 0} + ${summary?.fundamentalCreated || 0} fundamentales, ${summary?.marianUpdated || 0} + ${summary?.marianCreated || 0} marianas`);
    },
    onError: (error) => {
      toast.error('Error al corregir: ' + error.message);
    },
  });

  // Scrape EWTN prayers mutation
  const scrapeEWTNMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('scrape-ewtn-prayers', {
        body: { batchMode: true, limit: batchLimit },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-calendar-saints'] });
      queryClient.invalidateQueries({ queryKey: ['admin-oraciones-for-saints'] });
      const summary = data?.summary;
      toast.success(`EWTN: Creadas ${summary?.created || 0}, enlazadas ${summary?.linked || 0}, fallidas ${summary?.failed || 0}`);
    },
    onError: (error) => {
      toast.error('Error EWTN: ' + error.message);
    },
  });

  // Batch fetch Wikipedia images mutation
  const batchWikipediaImageMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('batch-fetch-saint-images', {
        body: { 
          onlyPatrons: batchCategory === 'patron_country',
          limit: batchLimit 
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-calendar-saints'] });
      toast.success(`Wikipedia: Encontradas ${data?.success_count || 0} de ${data?.total_processed || 0} imágenes`);
    },
    onError: (error) => {
      toast.error('Error Wikipedia: ' + error.message);
    },
  });

  // Batch fetch Wikipedia biographies mutation
  const batchWikipediaBioMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('batch-fetch-saint-bios', {
        body: { 
          onlyPatrons: batchCategory === 'patron_country',
          limit: batchLimit,
          minDescriptionLength: 100,
          onlyWithoutBio: true
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-calendar-saints'] });
      toast.success(`Wikipedia Biografías: ${data?.success || 0} encontradas de ${data?.processed || 0} procesadas`);
    },
    onError: (error) => {
      toast.error('Error Wikipedia Biografías: ' + error.message);
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
    if (historyFilter === 'with' && (!saint.description || saint.description.length <= 100)) {
      return false;
    }
    if (historyFilter === 'without' && saint.description && saint.description.length > 100) {
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
    // Missing content
    withoutImage: saints.filter(s => !s.image_url).length,
    withoutPrayer: saints.filter(s => !s.prayer_id).length,
    withoutHistory: saints.filter(s => !s.description || s.description.length <= 100).length,
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

  const isBatchRunning = batchHistoryMutation.isPending || batchPrayerMutation.isPending || batchImageMutation.isPending || importTraditionalPrayersMutation.isPending || fixFundamentalPrayersMutation.isPending || scrapeEWTNMutation.isPending || batchWikipediaImageMutation.isPending || batchWikipediaBioMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Church className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Gestión de Santos</h1>
            <p className="text-muted-foreground">Centro de control del Santoral con generación IA</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refrescar
        </Button>
      </div>

      {/* Stats Cards - Content Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Santos</p>
          </CardContent>
        </Card>
        <Card className={stats.withoutHistory > 0 ? 'border-amber-500/50' : 'border-green-500/50'}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">{stats.withHistory}</div>
            </div>
            <p className="text-xs text-muted-foreground">
              Con Historia ({stats.withoutHistory} faltan)
            </p>
          </CardContent>
        </Card>
        <Card className={stats.withoutPrayer > 0 ? 'border-amber-500/50' : 'border-green-500/50'}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">{stats.withPrayer}</div>
            </div>
            <p className="text-xs text-muted-foreground">
              Con Oración ({stats.withoutPrayer} faltan)
            </p>
          </CardContent>
        </Card>
        <Card className={stats.withoutImage > 0 ? 'border-amber-500/50' : 'border-green-500/50'}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{stats.withImage}</div>
            </div>
            <p className="text-xs text-muted-foreground">
              Con Imagen ({stats.withoutImage} faltan)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Generation Panel */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wand2 className="h-5 w-5 text-primary" />
            Generación Masiva con IA
          </CardTitle>
          <CardDescription>
            Genera historias, oraciones e imágenes automáticamente para los santos que faltan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Settings Row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Límite:</span>
              <Select value={batchLimit.toString()} onValueChange={(v) => setBatchLimit(parseInt(v))}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Categoría:</span>
              <Select value={batchCategory} onValueChange={setBatchCategory}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los santos</SelectItem>
                  <SelectItem value="patron_country">Solo Patronos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => batchHistoryMutation.mutate()}
              disabled={isBatchRunning || stats.withoutHistory === 0}
              className="gap-2"
            >
              {batchHistoryMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BookOpen className="h-4 w-4" />
              )}
              Generar {Math.min(batchLimit, stats.withoutHistory)} Historias
              {stats.withoutHistory > 0 && (
                <Badge variant="secondary" className="ml-1">{stats.withoutHistory}</Badge>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => batchPrayerMutation.mutate()}
              disabled={isBatchRunning || stats.withoutPrayer === 0}
              className="gap-2"
            >
              {batchPrayerMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generar {Math.min(batchLimit, stats.withoutPrayer)} Oraciones
              {stats.withoutPrayer > 0 && (
                <Badge variant="secondary" className="ml-1">{stats.withoutPrayer}</Badge>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => batchImageMutation.mutate()}
              disabled={isBatchRunning || stats.withoutImage === 0}
              className="gap-2"
            >
              {batchImageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              Generar {Math.min(batchLimit, stats.withoutImage)} Imágenes
              {stats.withoutImage > 0 && (
                <Badge variant="secondary" className="ml-1">{stats.withoutImage}</Badge>
              )}
            </Button>

            {/* Wikipedia Images Button - NEW */}
            <Button
              onClick={() => batchWikipediaImageMutation.mutate()}
              disabled={isBatchRunning || stats.withoutImage === 0}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              {batchWikipediaImageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Globe className="h-4 w-4" />
              )}
              🌐 Buscar en Wikipedia ({Math.min(batchLimit, stats.withoutImage)})
              {stats.withoutImage > 0 && (
                <Badge variant="secondary" className="ml-1 bg-emerald-100 text-emerald-800">{stats.withoutImage}</Badge>
              )}
            </Button>

            {/* Wikipedia Biographies Button - NEW */}
            <Button
              onClick={() => batchWikipediaBioMutation.mutate()}
              disabled={isBatchRunning || stats.withoutHistory === 0}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {batchWikipediaBioMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BookOpen className="h-4 w-4" />
              )}
              📖 Buscar Biografías Wikipedia ({Math.min(batchLimit, stats.withoutHistory)})
              {stats.withoutHistory > 0 && (
                <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-800">{stats.withoutHistory}</Badge>
              )}
            </Button>
          </div>

          {/* Sección Oraciones Tradicionales */}
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <BookHeart className="h-5 w-5 text-amber-600" />
              <span className="font-medium text-sm">Oraciones Tradicionales</span>
              <Badge variant="outline" className="text-amber-600 border-amber-600">
                Fuentes Católicas Oficiales
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* Botón Corregir Oraciones Fundamentales */}
              <Button
                onClick={() => fixFundamentalPrayersMutation.mutate()}
                disabled={isBatchRunning}
                className="gap-2 bg-rose-600 hover:bg-rose-700"
              >
                {fixFundamentalPrayersMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Cross className="h-4 w-4" />
                )}
                Corregir Oraciones Fundamentales
              </Button>

              {/* Botón Importar de ACI Prensa */}
              <Button
                onClick={() => importTraditionalPrayersMutation.mutate()}
                disabled={isBatchRunning}
                className="gap-2 bg-amber-600 hover:bg-amber-700"
              >
                {importTraditionalPrayersMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Importar Oraciones de ACI Prensa
              </Button>

              {/* Botón Scrape EWTN */}
              <Button
                onClick={() => scrapeEWTNMutation.mutate()}
                disabled={isBatchRunning}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {scrapeEWTNMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                Importar desde EWTN ({Math.min(batchLimit, stats.withoutPrayer)})
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground mt-2">
              <strong>Corregir Fundamentales:</strong> Padre Nuestro, Ave María, Gloria, Credo + Advocaciones Marianas.
              <br />
              <strong>ACI Prensa:</strong> Oraciones tradicionales de santos importantes (80+ santos).
              <br />
              <strong>EWTN:</strong> Extrae oraciones de la biblioteca de EWTN (100+ santos con URL conocida).
            </p>
          </div>

          {/* Running indicator */}
          {isBatchRunning && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin" />
              Procesando en segundo plano... Esto puede tomar varios minutos.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Batch Progress */}
      {batchProgress && (
        <Card className="border-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generando {batchProgress.type}: {batchProgress.current} de {batchProgress.total}
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

            <Select value={historyFilter} onValueChange={(v) => { setHistoryFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Historia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="with">Con historia</SelectItem>
                <SelectItem value="without">Sin historia</SelectItem>
              </SelectContent>
            </Select>

            <Select value={prayerFilter} onValueChange={(v) => { setPrayerFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Oración" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="with">Con oración</SelectItem>
                <SelectItem value="without">Sin oración</SelectItem>
              </SelectContent>
            </Select>

            <Select value={imageFilter} onValueChange={(v) => { setImageFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Imagen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="with">Con imagen</SelectItem>
                <SelectItem value="without">Sin imagen</SelectItem>
              </SelectContent>
            </Select>
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
                <TableHead className="w-[80px] text-center">Fuente</TableHead>
                <TableHead className="w-[160px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : paginatedSaints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No se encontraron santos con los filtros actuales
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSaints.map((saint) => {
                  const hasHistory = saint.description && saint.description.length > 100;
                  const isGeneratingSaint = generatingId === saint.id;

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
                          <div className="flex items-center justify-center gap-1">
                            <Check className="h-4 w-4 text-green-600" />
                            {saint.estado_verificacion === 'verificado' ? (
                              <Badge className="text-[10px] px-1 bg-green-500/10 text-green-600">✅</Badge>
                            ) : (
                              <Badge className="text-[10px] px-1 bg-amber-500/10 text-amber-600">⏳</Badge>
                            )}
                          </div>
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
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[10px]">
                          {saint.fuente_descripcion === 'verificada_humano' ? '👤 Humano' :
                           saint.fuente_descripcion === 'wikipedia' ? '📖 Wiki' :
                           saint.description_source?.includes('wikipedia') ? '📖 Wiki' :
                           '🤖 IA'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewingSaint(saint)}
                            title="Ver detalles"
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
                            title="Editar historia"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => generateHistoryMutation.mutate(saint.id)}
                            disabled={isGeneratingSaint || hasHistory}
                            title="Generar historia"
                          >
                            {isGeneratingSaint && generatingType === 'history' ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <BookOpen className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => generatePrayerMutation.mutate(saint.id)}
                            disabled={isGeneratingSaint || !!saint.prayer_id}
                            title="Generar oración"
                          >
                            {isGeneratingSaint && generatingType === 'prayer' ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => generateImageMutation.mutate(saint.id)}
                            disabled={isGeneratingSaint || !!saint.image_url}
                            title="Generar imagen"
                          >
                            {isGeneratingSaint && generatingType === 'image' ? (
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
                <Badge variant="outline" className="text-xs">
                  Fuente: {viewingSaint.fuente_descripcion === 'verificada_humano' ? '👤 Humano' :
                    viewingSaint.description_source?.includes('wikipedia') ? '📖 Wikipedia' : '🤖 IA'}
                </Badge>
                {viewingSaint.estado_verificacion === 'verificado' ? (
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/30">✅ Verificado</Badge>
                ) : (
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">⏳ Sin verificar</Badge>
                )}
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Historia
                </h4>
                {viewingSaint.description ? (
                  <ScrollArea className="max-h-[300px]">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {viewingSaint.description}
                    </p>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Sin historia registrada</p>
                )}
              </div>

              {/* Mark as verified */}
              {viewingSaint.description && viewingSaint.estado_verificacion !== 'verificado' && (
                <Button
                  onClick={async () => {
                    const { data: { user } } = await supabase.auth.getUser();
                    await supabase.from('calendar_saints').update({
                      estado_verificacion: 'verificado',
                      verificado_por: user?.id,
                      fuente_descripcion: 'verificada_humano',
                    }).eq('id', viewingSaint.id);
                    toast.success('Santo marcado como verificado');
                    queryClient.invalidateQueries({ queryKey: ['admin-calendar-saints'] });
                    setViewingSaint(null);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  ✅ Marcar como verificado por humano
                </Button>
              )}

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
          <DialogFooter className="flex-wrap gap-2">
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
              variant="outline"
              onClick={() => {
                if (viewingSaint && !viewingSaint.prayer_id) {
                  generatePrayerMutation.mutate(viewingSaint.id);
                  setViewingSaint(null);
                }
              }}
              disabled={!!viewingSaint?.prayer_id || generatePrayerMutation.isPending}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {viewingSaint?.prayer_id ? 'Ya tiene oración' : 'Generar Oración'}
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
