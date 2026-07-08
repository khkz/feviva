import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, Church, Calendar, MapPin, ArrowRight, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useSantos } from '@/hooks/useSantos';
import { countryFlags, countryNames, continentNames, countriesByContinent, monthNames } from '@/lib/countryMappings';
import logoElRugido from '@/assets/logo-elrugido.png';
import { FooterSection } from '@/components/landing/FooterSection';
import { supabase } from '@/integrations/supabase/client';

const SantosPublic = () => {
  const navigate = useNavigate();
  const { allSaints, patronSaints, saintsThisMonth, stats, isLoading, searchQuery, setSearchQuery } = useSantos();

  // Sesión: cuando hay usuario logueado se ocultan CTAs de registro y el límite de 24.
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setIsAuthed(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setIsAuthed(!!session);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  
  const [selectedContinent, setSelectedContinent] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter saints based on selections
  const filteredSaints = useMemo(() => {
    let result = allSaints || [];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query) ||
          (s.country_code && countryNames[s.country_code]?.toLowerCase().includes(query))
      );
    }

    // Continent filter
    if (selectedContinent !== 'all') {
      const continentCountries = countriesByContinent[selectedContinent as keyof typeof countriesByContinent] || [];
      result = result.filter((s) => s.country_code && continentCountries.includes(s.country_code));
    }

    // Month filter
    if (selectedMonth !== 'all') {
      result = result.filter((s) => s.feast_month === parseInt(selectedMonth));
    }

    return result;
  }, [allSaints, searchQuery, selectedContinent, selectedMonth]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedContinent('all');
    setSelectedMonth('all');
  };

  const hasActiveFilters = searchQuery || selectedContinent !== 'all' || selectedMonth !== 'all';

  return (
    <>
      <Helmet>
        <title>Santos del Calendario Litúrgico | ElRugido</title>
        <meta
          name="description"
          content={`Descubre ${stats?.total || 400}+ santos del calendario católico. Historias, oraciones y festividades de santos patronos, mártires, doctores de la Iglesia y más.`}
        />
        <meta
          name="keywords"
          content="santos católicos, calendario litúrgico, santos patronos, oraciones a santos, festividades católicas, santoral"
        />
        <link rel="canonical" href="https://elrugido.com/santos" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Santos del Calendario Litúrgico | ElRugido" />
        <meta property="og:description" content="Explora la vida y oraciones de cientos de santos católicos" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://elrugido.com/santos" />
        
        {/* Schema.org ItemList */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Santos del Calendario Litúrgico Católico',
            description: 'Directorio completo de santos católicos con biografías, oraciones y fechas de festividad',
            numberOfItems: stats?.total || 400,
            itemListElement: filteredSaints.slice(0, 10).map((saint, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'Person',
                name: saint.name,
                url: `https://elrugido.com/santo/${saint.slug || saint.id}`,
              },
            })),
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
            <Button onClick={() => navigate('/auth')} size="sm">
              Crear cuenta gratis
            </Button>
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
                <Calendar className="w-3 h-3 mr-1" />
                Calendario Litúrgico
              </Badge>
              <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
                Santos del Calendario Católico
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Descubre la vida, oraciones y festividades de {stats?.total || 400}+ santos.
                Desde mártires hasta doctores de la Iglesia, encuentra inspiración para tu fe.
              </p>

              {/* Search */}
              <div className="max-w-xl mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar santo por nombre o país..."
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
                <div className="text-2xl font-bold text-primary">{stats?.total || '400+'}</div>
                <div className="text-sm text-muted-foreground">Santos totales</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-primary">{stats?.patrons || 60}</div>
                <div className="text-sm text-muted-foreground">Santos patronos</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-primary">{saintsThisMonth?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Este mes</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-primary">{stats?.withPrayer || 0}</div>
                <div className="text-sm text-muted-foreground">Con oración</div>
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
                <>
                  <Select value={selectedContinent} onValueChange={setSelectedContinent}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Continente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los continentes</SelectItem>
                      {Object.entries(continentNames).map(([code, name]) => (
                        <SelectItem key={code} value={code}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Mes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los meses</SelectItem>
                      {monthNames.map((name, index) => (
                        <SelectItem key={index} value={String(index + 1)}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                  <X className="h-4 w-4" />
                  Limpiar
                </Button>
              )}

              <div className="ml-auto text-sm text-muted-foreground">
                {filteredSaints.length} santos encontrados
              </div>
            </div>
          </div>
        </section>

        {/* Saints Grid */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
                ))}
              </div>
            ) : (
              <>
                {/* Featured Patrons Row */}
                {!hasActiveFilters && patronSaints && patronSaints.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Santos Patronos Destacados
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {patronSaints
                        .filter((s) => s.image_url)
                        .slice(0, 6)
                        .map((saint) => (
                          <SaintCard key={saint.id} saint={saint} compact />
                        ))}
                    </div>
                  </div>
                )}

                {/* All Saints Grid */}
                <h2 className="text-xl font-semibold mb-4">
                  {hasActiveFilters ? 'Resultados' : 'Todos los Santos'}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredSaints.slice(0, 24).map((saint) => (
                    <SaintCard key={saint.id} saint={saint} />
                  ))}
                </div>

                {filteredSaints.length > 24 && (
                  <div className="mt-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      Mostrando 24 de {filteredSaints.length} santos
                    </p>
                    <Button onClick={() => navigate('/auth')} className="gap-2">
                      Registrarse para ver todos
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-b from-transparent to-primary/5">
          <div className="container mx-auto max-w-3xl text-center">
            <Church className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
              Profundiza en tu fe
            </h2>
            <p className="text-muted-foreground mb-6">
              Únete a ElRugido para acceder a oraciones guiadas con audio, rosarios interactivos,
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

// Saint Card Component
interface SaintCardProps {
  saint: {
    id: string;
    name: string;
    slug?: string | null;
    image_url?: string | null;
    country_code?: string | null;
    feast_day: number;
    feast_month: number;
    category: string;
    description?: string | null;
  };
  compact?: boolean;
}

function SaintCard({ saint, compact = false }: SaintCardProps) {
  return (
    <Link to={`/santo/${saint.slug || saint.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full group">
        <CardContent className="p-0">
          <div className={`relative ${compact ? 'aspect-[3/4]' : 'aspect-[3/4]'} bg-gradient-to-br from-primary/10 to-secondary/10`}>
            {saint.image_url ? (
              <img
                src={saint.image_url}
                alt={saint.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Church className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}

            {saint.country_code && (
              <div className="absolute top-2 right-2 text-xl">
                {countryFlags[saint.country_code]}
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3">
              <h3 className="font-semibold text-white text-sm line-clamp-2">{saint.name}</h3>
              <p className="text-white/70 text-xs mt-0.5">
                {saint.feast_day} de {monthNames[saint.feast_month - 1]}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default SantosPublic;
