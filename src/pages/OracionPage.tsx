import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Share2, Volume2, Heart, Church, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import logoElRugido from '@/assets/logo-elrugido.svg';
import { FooterSection } from '@/components/landing/FooterSection';

interface Oracion {
  id: string;
  nombre: string;
  texto: string;
  categoria: string;
  subcategoria: string | null;
  tagline: string | null;
  historia: string | null;
  es_fundamental: boolean | null;
  es_tradicional: boolean | null;
  audio_url: string | null;
  cita_celebre: string | null;
  cita_autor: string | null;
  fuente: string | null;
  fuente_url: string | null;
}

const OracionPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Fetch prayer by slug from database
  const { data: oracion, isLoading } = useQuery({
    queryKey: ['oracion-public', slug],
    queryFn: async () => {
      // First try by UUID (if slug looks like a UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(slug!)) {
        const { data: byId, error: idError } = await supabase
          .from('oraciones')
          .select('*')
          .eq('id', slug)
          .maybeSingle();
        if (idError) throw idError;
        if (byId) return byId as Oracion;
      }

      // Then try by slug column
      const { data: bySlug, error: slugError } = await supabase
        .from('oraciones')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      
      if (slugError) throw slugError;
      if (bySlug) return bySlug as Oracion;
      
      // Fallback: search by generated slug from name (for backwards compatibility)
      const { data: allPrayers, error } = await supabase
        .from('oraciones')
        .select('*');
      
      if (error) throw error;
      
      const prayer = (allPrayers as Oracion[]).find(o => {
        const prayerSlug = o.nombre
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        return prayerSlug === slug;
      });
      
      return prayer || null;
    },
    enabled: !!slug,
  });

  // Fetch related prayers
  const { data: relatedPrayers = [] } = useQuery({
    queryKey: ['related-prayers', oracion?.categoria],
    queryFn: async () => {
      if (!oracion) return [];
      
      const { data, error } = await supabase
        .from('oraciones')
        .select('id, nombre, categoria, tagline')
        .eq('categoria', oracion.categoria)
        .neq('id', oracion.id)
        .limit(4);
      
      if (error) throw error;
      return data;
    },
    enabled: !!oracion,
  });

  const generateSlug = (nombre: string) => {
    return nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={logoElRugido} alt="ElRugido" className="w-8 h-8" />
              <span className="font-display font-bold text-lg">ElRugido</span>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-12 w-3/4 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!oracion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Oración no encontrada</h1>
          <p className="text-muted-foreground mb-4">La oración que buscas no existe.</p>
          <Button onClick={() => navigate('/oraciones')}>
            Ver todas las oraciones
          </Button>
        </div>
      </div>
    );
  }

  const canonicalUrl = `https://elrugido.com/oracion/${slug}`;

  return (
    <>
      <Helmet>
        <title>{oracion.nombre} | ElRugido - Oraciones Católicas</title>
        <meta
          name="description"
          content={oracion.tagline || oracion.texto.substring(0, 160)}
        />
        <meta
          name="keywords"
          content={`${oracion.nombre}, oracion católica, ${oracion.categoria}, oraciones tradicionales`}
        />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${oracion.nombre} | ElRugido`} />
        <meta property="og:description" content={oracion.tagline || oracion.texto.substring(0, 160)} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        
        {/* Schema.org Prayer/CreativeWork */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: oracion.nombre,
            description: oracion.tagline || oracion.texto.substring(0, 300),
            text: oracion.texto,
            inLanguage: 'es',
            genre: 'Oración Católica',
            keywords: [oracion.categoria, 'oración', 'católico', 'cristiano'],
            url: canonicalUrl,
            publisher: {
              '@type': 'Organization',
              name: 'ElRugido',
              url: 'https://elrugido.com',
            },
            ...(oracion.fuente && { source: oracion.fuente }),
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://elrugido.com' },
                { '@type': 'ListItem', position: 2, name: 'Oraciones', item: 'https://elrugido.com/oraciones' },
                { '@type': 'ListItem', position: 3, name: oracion.nombre, item: canonicalUrl },
              ],
            },
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
              <Link to="/oraciones">
                <Button variant="ghost" size="sm">Oraciones</Button>
              </Link>
              <Link to="/santos">
                <Button variant="ghost" size="sm">Santos</Button>
              </Link>
              <Button onClick={() => navigate('/auth')} size="sm">
                Registrarse
              </Button>
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="border-b border-border/50">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/oraciones" className="hover:text-foreground transition-colors">Oraciones</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground truncate max-w-[200px]">{oracion.nombre}</span>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <article className="py-8 md:py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Back button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/oraciones')}
                className="mb-6 gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a oraciones
              </Button>

              {/* Header */}
              <div className="mb-8">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge variant="secondary">{oracion.categoria}</Badge>
                  {oracion.es_fundamental && (
                    <Badge variant="default" className="bg-primary">Fundamental</Badge>
                  )}
                  {oracion.es_tradicional && (
                    <Badge variant="outline">Tradicional</Badge>
                  )}
                  {oracion.audio_url && (
                    <Badge variant="secondary" className="gap-1">
                      <Volume2 className="h-3 w-3" />
                      Audio disponible
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  {oracion.nombre}
                </h1>

                {oracion.tagline && (
                  <p className="text-lg text-muted-foreground">
                    {oracion.tagline}
                  </p>
                )}
              </div>

              {/* Quote */}
              {oracion.cita_celebre && (
                <Card className="mb-8 bg-primary/5 border-primary/20">
                  <CardContent className="p-6">
                    <blockquote className="text-lg italic text-foreground/90">
                      "{oracion.cita_celebre}"
                    </blockquote>
                    {oracion.cita_autor && (
                      <cite className="block mt-2 text-sm text-muted-foreground">
                        — {oracion.cita_autor}
                      </cite>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Prayer Text */}
              <Card className="mb-8">
                <CardContent className="p-6 md:p-8">
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    {oracion.texto.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 last:mb-0 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* History */}
              {oracion.historia && (
                <Card className="mb-8">
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Church className="h-5 w-5 text-primary" />
                      Historia de esta oración
                    </h2>
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-muted-foreground leading-relaxed">
                        {oracion.historia}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Source */}
              {oracion.fuente && (
                <div className="text-sm text-muted-foreground mb-8">
                  <span className="font-medium">Fuente:</span>{' '}
                  {oracion.fuente_url ? (
                    <a 
                      href={oracion.fuente_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {oracion.fuente}
                    </a>
                  ) : (
                    oracion.fuente
                  )}
                </div>
              )}

              {/* CTA */}
              <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                <CardContent className="p-6 text-center">
                  <Heart className="h-10 w-10 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">
                    ¿Quieres rezar con audio guiado?
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Regístrate en ElRugido para acceder a oraciones con audio, favoritos y más.
                  </p>
                  <Button onClick={() => navigate('/auth')} size="lg" className="gap-2">
                    Comenzar gratis
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </article>

        {/* Related Prayers */}
        {relatedPrayers.length > 0 && (
          <section className="py-12 px-4 bg-muted/30">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-2xl font-semibold mb-6">
                Oraciones relacionadas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedPrayers.map((prayer) => (
                  <Link 
                    key={prayer.id} 
                    to={`/oracion/${generateSlug(prayer.nombre)}`}
                    className="block"
                  >
                    <Card className="hover:shadow-md transition-shadow h-full">
                      <CardContent className="p-4">
                        <h3 className="font-medium hover:text-primary transition-colors">
                          {prayer.nombre}
                        </h3>
                        {prayer.tagline && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {prayer.tagline}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <FooterSection />
      </div>
    </>
  );
};

export default OracionPage;