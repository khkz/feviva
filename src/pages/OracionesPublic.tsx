import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, BookOpen, ArrowRight, Heart, Cross, Sparkles, Church, Moon, HandHeart, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import logoElRugido from '@/assets/logo-elrugido.png';
import { FooterSection } from '@/components/landing/FooterSection';
import { useIsAuthed } from '@/hooks/useIsAuthed';


// Category configuration
const CATEGORY_CONFIG: Record<string, { icon: typeof Cross; color: string }> = {
  "Oraciones Básicas": { icon: Cross, color: "text-primary" },
  "Oraciones Marianas": { icon: Sparkles, color: "text-blue-500" },
  "Oraciones a los Santos": { icon: Church, color: "text-amber-500" },
  "santos": { icon: Church, color: "text-amber-500" },
  "Oraciones del Rosario": { icon: Moon, color: "text-purple-500" },
  "default": { icon: HandHeart, color: "text-primary" },
};

function getCategoryConfig(category: string) {
  return CATEGORY_CONFIG[category] || CATEGORY_CONFIG["default"];
}

interface Oracion {
  id: string;
  nombre: string;
  texto: string;
  categoria: string;
  subcategoria: string | null;
  tagline: string | null;
  es_fundamental: boolean | null;
  es_tradicional: boolean | null;
  audio_url: string | null;
  historia: string | null;
}

const OracionesPublic = () => {
  const navigate = useNavigate();
  const isAuthed = useIsAuthed();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);


  // Fetch all prayers
  const { data: oraciones = [], isLoading } = useQuery({
    queryKey: ['oraciones-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('oraciones')
        .select('id, nombre, texto, categoria, subcategoria, tagline, es_fundamental, es_tradicional, audio_url, historia')
        .order('orden', { ascending: true });
      
      if (error) throw error;
      return data as Oracion[];
    },
  });

  // Get unique categories
  const categorias = useMemo(() => {
    return [...new Set(oraciones.map(o => o.categoria))].sort();
  }, [oraciones]);

  // Filter prayers
  const filteredOraciones = useMemo(() => {
    let result = oraciones;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        o => o.nombre.toLowerCase().includes(query) ||
             o.texto.toLowerCase().includes(query) ||
             o.categoria.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(o => o.categoria === selectedCategory);
    }

    return result;
  }, [oraciones, searchQuery, selectedCategory]);

  // Get fundamental prayers
  const fundamentalPrayers = useMemo(() => {
    return oraciones.filter(o => o.es_fundamental === true).slice(0, 4);
  }, [oraciones]);

  // Get traditional prayers
  const traditionalPrayers = useMemo(() => {
    return oraciones.filter(o => o.es_tradicional === true).slice(0, 8);
  }, [oraciones]);

  // Stats
  const stats = useMemo(() => ({
    total: oraciones.length,
    withAudio: oraciones.filter(o => o.audio_url).length,
    traditional: oraciones.filter(o => o.es_tradicional).length,
    categories: categorias.length,
  }), [oraciones, categorias]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all';

  // Generate slug from prayer name
  const generateSlug = (nombre: string) => {
    return nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  return (
    <>
      <Helmet>
        <title>{`Oraciones Católicas | ElRugido - Más de ${stats.total} Oraciones con Audio`}</title>
        <meta
          name="description"
          content={`Colección de ${stats.total}+ oraciones católicas: Padre Nuestro, Ave María, oraciones a los santos, novenas y más. Con audio guiado para tu oración diaria.`}
        />
        <meta
          name="keywords"
          content="oraciones católicas, padre nuestro, ave maría, oraciones a santos, rosario, novenas, oraciones de la iglesia, oraciones tradicionales"
        />
        <link rel="canonical" href="https://elrugido.com/oraciones" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Oraciones Católicas | ElRugido" />
        <meta property="og:description" content={`Descubre ${stats.total}+ oraciones católicas con audio guiado`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://elrugido.com/oraciones" />
        
        {/* Schema.org ItemList */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Oraciones Católicas',
            description: 'Colección completa de oraciones católicas tradicionales con audio',
            numberOfItems: stats.total,
            itemListElement: fundamentalPrayers.map((prayer, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'CreativeWork',
                name: prayer.nombre,
                url: `https://elrugido.com/oracion/${generateSlug(prayer.nombre)}`,
                description: prayer.tagline || prayer.texto.substring(0, 160),
              },
            })),
          })}
        </script>
        {/* FAQ para AEO/GEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: '¿Qué es el libro de oraciones católicas de ElRugido?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Es una colección de más de 150 oraciones católicas tradicionales —Padre Nuestro, Ave María, oraciones a los santos, oraciones para diferentes momentos del día— con texto completo y audio guiado para acompañar tu vida espiritual.',
                },
              },
              {
                '@type': 'Question',
                name: '¿Puedo leer las oraciones sin cuenta?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Sí. El texto completo de todas las oraciones es de libre lectura. El audio guiado, marcar favoritas y el seguimiento personal se desbloquean al crear una cuenta gratuita.',
                },
              },
              {
                '@type': 'Question',
                name: '¿Cómo elegir qué oración rezar?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Puedes empezar por las oraciones fundamentales (Padre Nuestro, Ave María, Gloria, Credo), buscar por categoría —marianas, a los santos, para la mañana o la noche— o usar el buscador por palabra clave.',
                },
              },
            ],
          })}
        </script>
      </Helmet>


      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={logoElRugido} alt="ElRugido" className="w-8 h-8" />
              <span className="font-display font-bold text-lg">ElRugido</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link to="/santos">
                <Button variant="ghost" size="sm">Santos</Button>
              </Link>
              {!isAuthed && (
                <Button onClick={() => navigate('/auth')} size="sm">
                  Crear cuenta gratis
                </Button>
              )}
              {isAuthed && (
                <Button onClick={() => navigate('/oraciones/app')} size="sm" variant="secondary">
                  Abrir mi libro
                </Button>
              )}

            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="py-12 md:py-16 px-4 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="mb-4">
                <BookOpen className="w-3 h-3 mr-1" />
                Oraciones Católicas
              </Badge>
              <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
                Oraciones para tu Vida Espiritual
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Descubre {stats.total}+ oraciones católicas tradicionales.
                Desde el Padre Nuestro hasta oraciones a los santos, con audio guiado.
              </p>

              {/* Search */}
              <div className="max-w-xl mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar oración..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-12 text-lg"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-8 px-4 border-b border-border/50">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Oraciones</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-primary">{stats.withAudio}</div>
                <div className="text-sm text-muted-foreground">Con audio</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-primary">{stats.traditional}</div>
                <div className="text-sm text-muted-foreground">Tradicionales</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-primary">{stats.categories}</div>
                <div className="text-sm text-muted-foreground">Categorías</div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-6 px-4 border-b border-border/50">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros
              </Button>

              {showFilters && (
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                  <X className="h-4 w-4" />
                  Limpiar
                </Button>
              )}

              <div className="ml-auto text-sm text-muted-foreground">
                {filteredOraciones.length} oraciones encontradas
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => (
                  <Skeleton key={i} className="h-40 rounded-lg" />
                ))}
              </div>
            ) : (
              <>
                {/* Fundamental Prayers */}
                {!hasActiveFilters && fundamentalPrayers.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      Oraciones Fundamentales
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {fundamentalPrayers.map((prayer) => (
                        <PrayerCard key={prayer.id} prayer={prayer} featured />
                      ))}
                    </div>
                  </div>
                )}

                {/* Traditional Prayers */}
                {!hasActiveFilters && traditionalPrayers.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Church className="h-5 w-5 text-amber-500" />
                      Oraciones Tradicionales
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {traditionalPrayers.map((prayer) => (
                        <PrayerCard key={prayer.id} prayer={prayer} />
                      ))}
                    </div>
                  </div>
                )}

                {/* All/Filtered Prayers */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    {hasActiveFilters ? 'Resultados' : 'Todas las Oraciones'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredOraciones.slice(0, 24).map((prayer) => (
                      <PrayerCard key={prayer.id} prayer={prayer} />
                    ))}
                  </div>

                  {filteredOraciones.length > 24 && (
                    <div className="mt-8 text-center">
                      <p className="text-muted-foreground mb-4">
                        Mostrando 24 de {filteredOraciones.length} oraciones
                      </p>
                      <Button onClick={() => navigate('/auth')} className="gap-2">
                        Registrarse para ver todas
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-b from-transparent to-primary/5">
          <div className="container mx-auto max-w-3xl text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
              Ora con audio guiado
            </h2>
            <p className="text-muted-foreground mb-6">
              Únete a ElRugido para acceder a oraciones con audio, rosarios interactivos,
              novenas y mucho más contenido para fortalecer tu vida espiritual.
            </p>
            <Button onClick={() => navigate('/auth')} size="lg" className="gap-2">
              Comenzar gratis
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>

        <FooterSection />
      </div>
    </>
  );
};

// Prayer Card Component
interface PrayerCardProps {
  prayer: Oracion;
  featured?: boolean;
}

function PrayerCard({ prayer, featured = false }: PrayerCardProps) {
  const config = getCategoryConfig(prayer.categoria);
  const Icon = config.icon;
  
  const generateSlug = (nombre: string) => {
    return nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  return (
    <Link to={`/oracion/${generateSlug(prayer.nombre)}`}>
      <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full group ${featured ? 'border-primary/30' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg bg-muted/50 ${config.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {prayer.nombre}
              </h3>
              {prayer.tagline && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {prayer.tagline}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {prayer.categoria}
                </Badge>
                {prayer.audio_url && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Audio
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
            {prayer.texto.substring(0, 150)}...
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default OracionesPublic;