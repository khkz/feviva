import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ShareModal } from '@/components/shared/ShareModal';
import { FooterSection } from '@/components/landing/FooterSection';
import logoElRugido from '@/assets/logo-elrugido.png';
import {
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Church, 
  Sparkles, 
  Share2, 
  BookOpen,
  UserPlus,
  Loader2,
  HandHeart,
  Globe,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { countryFlags, countryNames, formatFeastDate, getCountryContinent, continentCountries } from '@/lib/countryMappings';
import { InspiredStoryBadge, VerifiableDataBlock } from '@/components/santos/SaintCredibilityBlocks';

export default function SantoPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Fetch saint by canonical slug; fall back to legacy_slug for old shared URLs
  const { data: saint, isLoading, error } = useQuery({
    queryKey: ['saint', slug],
    queryFn: async () => {
      // Try canonical slug first
      const { data: bySlug } = await supabase
        .from('calendar_saints')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (bySlug) return bySlug;

      // Fallback: legacy slug (old URLs with UUID suffix)
      const { data: byLegacy, error: legacyErr } = await supabase
        .from('calendar_saints')
        .select('*')
        .eq('legacy_slug', slug)
        .maybeSingle();

      if (legacyErr) throw legacyErr;
      if (!byLegacy) throw new Error('Saint not found');
      return byLegacy;
    },
    enabled: !!slug,
  });

  // 301-style client redirect when accessed via legacy slug
  useEffect(() => {
    if (saint && slug && saint.slug && saint.slug !== slug) {
      navigate(`/santo/${saint.slug}`, { replace: true });
    }
  }, [saint, slug, navigate]);



  // Fetch prayer if saint has one
  const { data: prayer } = useQuery({
    queryKey: ['saint-prayer', saint?.prayer_id],
    queryFn: async () => {
      if (!saint?.prayer_id) return null;
      const { data } = await supabase
        .from('oraciones')
        .select('id, nombre, texto')
        .eq('id', saint.prayer_id)
        .single();
      return data;
    },
    enabled: !!saint?.prayer_id,
  });

  // Fetch related saints (same continent or same month)
  const { data: relatedSaints = [] } = useQuery({
    queryKey: ['related-saints', saint?.id, saint?.feast_month, saint?.country_code],
    queryFn: async () => {
      if (!saint) return [];
      
      let query = supabase
        .from('calendar_saints')
        .select('id, name, slug, image_url, feast_day, feast_month, category, country_code')
        .neq('id', saint.id)
        .not('image_url', 'is', null)
        .limit(4);

      if (saint.category === 'patron_country' && saint.country_code) {
        // For patrons, get saints from same continent
        const continent = getCountryContinent(saint.country_code);
        if (continent) {
          const continentCodes = continentCountries[continent] || [];
          if (continentCodes.length > 0) {
            query = query.in('country_code', continentCodes);
          }
        }
      } else {
        query = query.eq('feast_month', saint.feast_month);
      }

      const { data } = await query;
      return data || [];
    },
    enabled: !!saint,
  });

  // Fetch other patrons from same continent
  const { data: continentPatrons = [] } = useQuery({
    queryKey: ['continent-patrons', saint?.country_code],
    queryFn: async () => {
      if (!saint?.country_code || saint.category !== 'patron_country') return [];
      
      const continent = getCountryContinent(saint.country_code);
      if (!continent) return [];
      
      const continentCodes = continentCountries[continent] || [];
      if (continentCodes.length === 0) return [];

      const { data } = await supabase
        .from('calendar_saints')
        .select('id, name, slug, image_url, feast_day, feast_month, country_code')
        .eq('category', 'patron_country')
        .in('country_code', continentCodes)
        .neq('id', saint.id)
        .not('image_url', 'is', null)
        .limit(6);
      
      return data || [];
    },
    enabled: !!saint && saint.category === 'patron_country',
  });

  // Preload main image for faster LCP
  useEffect(() => {
    if (saint?.image_url) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = saint.image_url;
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [saint?.image_url]);

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error || !saint) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <Church className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Santo no encontrado</h1>
          <p className="text-muted-foreground mb-6">No pudimos encontrar el santo que buscas.</p>
          <Link to="/santos">
            <Button>Ver todos los santos</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isPatron = saint.category === 'patron_country';
  const metaDescription = saint.description 
    ? saint.description.slice(0, 155) + '...'
    : `${saint.name} - Fiesta: ${formatFeastDate(saint.feast_month, saint.feast_day)}. Conoce su historia y oración en ElRugido.`;

  // Enhanced Schema.org markup for better AI and search engine understanding
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `https://elrugido.com/santo/${saint.slug}#person`,
    "name": saint.name,
    "description": saint.description || metaDescription,
    "image": saint.image_url,
    "url": `https://elrugido.com/santo/${saint.slug}`,
    "sameAs": [
      ...(saint.fuente_url ? [saint.fuente_url] : []),
    ],
    ...(saint.fuente_url && { "citation": { "@type": "CreativeWork", "url": saint.fuente_url, "name": "Wikipedia en español" } }),
    "knowsAbout": saint.tags || [],
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://elrugido.com/santo/${saint.slug}`
    },
    ...(isPatron && saint.country_code && {
      "nationality": {
        "@type": "Country",
        "name": countryNames[saint.country_code]
      }
    })
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `${saint.name} - Historia, Oración y Festividad`,
    "description": metaDescription,
    "image": saint.image_url,
    "author": {
      "@type": "Organization",
      "name": "ElRugido"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ElRugido",
      "logo": {
        "@type": "ImageObject",
        "url": "https://elrugido.com/logo-elrugido.png"
      }
    },
    "datePublished": saint.created_at,
    "mainEntityOfPage": `https://elrugido.com/santo/${saint.slug}`
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": "https://elrugido.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Santos",
        "item": "https://elrugido.com/santos"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": saint.name,
        "item": `https://elrugido.com/santo/${saint.slug}`
      }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `¿Cuándo se celebra la fiesta de ${saint.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `La fiesta de ${saint.name} se celebra el ${formatFeastDate(saint.feast_month, saint.feast_day)}.`
        }
      },
      ...(isPatron && saint.country_code ? [{
        "@type": "Question",
        "name": `¿De qué país es patrono/a ${saint.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${saint.name} es el santo patrono de ${countryNames[saint.country_code]}.`
        }
      }] : []),
      ...(prayer ? [{
        "@type": "Question",
        "name": `¿Hay alguna oración a ${saint.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Sí, existe una oración tradicional para pedir la intercesión de ${saint.name}. Puedes encontrarla en ElRugido.`
        }
      }] : []),
      ...(saint.description ? [{
        "@type": "Question",
        "name": `¿Cuál es la historia de ${saint.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": saint.description.slice(0, 300) + '...'
        }
      }] : [])
    ]
  };

  return (
    <>
      <Helmet>
        <title>{saint.name} - Historia, Oración y Festividad | ElRugido</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={`${saint.name}, santo católico, oración ${saint.name}, historia ${saint.name}, ${isPatron ? `patrono ${countryNames[saint.country_code || '']}` : ''}, ${saint.tags?.join(', ') || ''}, santoral, fiesta ${formatFeastDate(saint.feast_month, saint.feast_day)}`} />
        
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${saint.name} - Historia y Oración | ElRugido`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={`https://elrugido.com/santo/${saint.slug}`} />
        <meta property="og:site_name" content="ElRugido" />
        <meta property="og:locale" content="es_ES" />
        {saint.image_url && (
          <>
            <meta property="og:image" content={saint.image_url} />
            <meta property="og:image:alt" content={`Imagen de ${saint.name}`} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
          </>
        )}
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@elrugidoapp" />
        <meta name="twitter:title" content={`${saint.name} - ElRugido`} />
        <meta name="twitter:description" content={metaDescription} />
        {saint.image_url && <meta name="twitter:image" content={saint.image_url} />}
        
        {/* Canonical and Language */}
        <link rel="canonical" href={`https://elrugido.com/santo/${saint.slug}`} />
        <meta httpEquiv="content-language" content="es" />
        
        {/* Schema.org Structured Data */}
        <script type="application/ld+json">{JSON.stringify(personSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Public Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
          <div className="container mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <img src={logoElRugido} alt="ElRugido" className="h-8 w-8" />
                <span className="font-display font-bold text-lg hidden sm:inline">ElRugido</span>
              </Link>
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
              <Link to="/santos" className="text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">
                Calendario de Santos
              </Link>
            </div>
            <Link to="/auth">
              <Button size="sm" className="gap-2">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Únete gratis</span>
                <span className="sm:hidden">Únete</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Breadcrumbs */}
        <nav className="container mx-auto max-w-5xl px-4 py-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Inicio</Link></li>
            <li>/</li>
            <li><Link to="/santos" className="hover:text-foreground">Santos</Link></li>
            <li>/</li>
            <li className="text-foreground font-medium truncate">{saint.name}</li>
          </ol>
        </nav>

        {/* Article — single centered reading column (~680px for optimal 60–75 CPL). */}
        <article className="container mx-auto max-w-[680px] px-4 pb-8 md:pb-12">
          {/* Featured image, integrated in the reading flow (no more empty side column). */}
          <motion.figure
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 shadow-xl mb-8"
          >
            {saint.image_url ? (
              <img
                src={saint.image_url}
                alt={`Imagen de ${saint.name}`}
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            ) : (
              <div className="aspect-[3/4] flex items-center justify-center">
                <Church className="h-24 w-24 text-muted-foreground/30" />
              </div>
            )}
            {isPatron && saint.country_code && (
              <div className="absolute top-4 right-4 text-4xl drop-shadow-lg">
                {countryFlags[saint.country_code]}
              </div>
            )}
          </motion.figure>

          {/* Title + meta */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4 mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold leading-tight">
              {saint.name}
            </h1>

            {isPatron && saint.country_code && (
              <p className="text-lg text-primary font-medium flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Patrono/a de {countryNames[saint.country_code]}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="gap-1.5 text-sm py-1 px-3">
                <Calendar className="h-4 w-4" />
                {formatFeastDate(saint.feast_month, saint.feast_day)}
              </Badge>
              {saint.country_code && (
                <Badge variant="outline" className="gap-1.5 text-sm py-1 px-3">
                  <MapPin className="h-4 w-4" />
                  {countryNames[saint.country_code] || saint.country_code}
                </Badge>
              )}
            </div>

            {saint.tags && saint.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {saint.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {formatSaintTag(tag)}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/auth">
                <Button className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Rezar con audio guiado
                </Button>
              </Link>
              <Button variant="outline" className="gap-2" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                Compartir
              </Button>
            </div>
          </motion.header>

          {/* Story */}
          {saint.description && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-5"
            >
              <InspiredStoryBadge saint={saint} />
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Historia de {saint.name}
              </h2>
              <div
                className="text-foreground/90 whitespace-pre-line"
                style={{ fontSize: "18px", lineHeight: 1.7 }}
              >
                {saint.description}
              </div>
            </motion.section>
          )}

          {/* Datos verificables — único en el DOM */}
          <div className="mt-8">
            <VerifiableDataBlock saint={saint} />
          </div>
        </article>




        {/* Prayer Section - PUBLIC */}
        {prayer && (
          <section className="container mx-auto max-w-5xl px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-4 flex items-center gap-2">
                    <HandHeart className="h-6 w-6 text-primary" />
                    Oración a {saint.name}
                  </h2>
                  <p className="text-foreground leading-relaxed whitespace-pre-line mb-6 italic">
                    {prayer.texto}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link to="/auth">
                      <Button className="w-full sm:w-auto gap-2">
                        <Sparkles className="h-4 w-4" />
                        Escuchar audio guiado
                      </Button>
                    </Link>
                    <Link to="/auth">
                      <Button variant="outline" className="w-full sm:w-auto gap-2">
                        <Heart className="h-4 w-4" />
                        Guardar en favoritos
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>
        )}

        {/* Intermediate CTA */}
        <section className="container mx-auto max-w-5xl px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-primary/10 rounded-2xl p-6 md:p-8 text-center"
          >
            <h3 className="text-lg md:text-xl font-semibold mb-2">
              ¿Quieres orar con {saint.name} cada día?
            </h3>
            <p className="text-muted-foreground mb-4">
              Únete gratis y recibe recordatorios en su festividad, oraciones guiadas con audio, y más.
            </p>
            <Link to="/auth">
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Registrarme gratis
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Related Saints */}
        {relatedSaints.length > 0 && (
          <section className="container mx-auto max-w-5xl px-4 py-8 border-t">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold mb-6">Santos relacionados</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedSaints.map((related) => (
                  <Link key={related.id} to={`/santo/${related.slug}`}>
                    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-0">
                        <div className="relative h-28 bg-gradient-to-br from-primary/10 to-secondary/10">
                          {related.image_url ? (
                            <img
                              src={related.image_url}
                              alt={related.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Church className="h-10 w-10 text-muted-foreground/30" />
                            </div>
                          )}
                          {related.category === 'patron_country' && related.country_code && (
                            <div className="absolute top-2 right-2 text-xl">
                              {countryFlags[related.country_code]}
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-sm line-clamp-1">{related.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {formatFeastDate(related.feast_month, related.feast_day, true)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* Continent Patrons */}
        {continentPatrons.length > 0 && (
          <section className="container mx-auto max-w-5xl px-4 py-8 border-t">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-xl font-semibold mb-6">
                Otros patronos de {getCountryContinent(saint.country_code!) === 'latinoamerica' ? 'Latinoamérica' : 
                  getCountryContinent(saint.country_code!) === 'europa' ? 'Europa' :
                  getCountryContinent(saint.country_code!) === 'asia' ? 'Asia' :
                  getCountryContinent(saint.country_code!) === 'africa' ? 'África' :
                  getCountryContinent(saint.country_code!) === 'norteamerica' ? 'Norteamérica' :
                  'Oceanía'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {continentPatrons.map((patron) => (
                  <Link key={patron.id} to={`/santo/${patron.slug}`}>
                    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
                      <CardContent className="p-0">
                        <div className="relative aspect-square bg-gradient-to-br from-primary/10 to-secondary/10">
                          {patron.image_url ? (
                            <img
                              src={patron.image_url}
                              alt={patron.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Church className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                          )}
                          {patron.country_code && (
                            <div className="absolute top-2 right-2 text-lg">
                              {countryFlags[patron.country_code]}
                            </div>
                          )}
                        </div>
                        <div className="p-2 text-center">
                          <h3 className="font-medium text-xs line-clamp-1">{patron.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {countryNames[patron.country_code!]}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* Final CTA Section */}
        <section className="bg-gradient-to-br from-primary/5 to-secondary/5 border-t">
          <div className="container mx-auto max-w-5xl px-4 py-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
                ¿Quieres profundizar en tu fe?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Únete a ElRugido y accede a oraciones guiadas, meditaciones diarias, 
                el rosario interactivo, el calendario de santos completo y mucho más.
              </p>
              <Link to="/auth">
                <Button size="lg" className="gap-2">
                  <UserPlus className="h-5 w-5" />
                  Regístrate gratis
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer with SEO Links */}
        <FooterSection />
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={saint?.name || 'Santo'}
        text={saint?.description?.substring(0, 300) || `Conoce la historia de ${saint?.name || 'este santo'}`}
        reference={saint?.name}
      />
    </>
  );
}
