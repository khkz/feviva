import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Church, 
  Sparkles, 
  Share2, 
  BookOpen,
  UserPlus,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import logoElRugido from '@/assets/logo-elrugido.svg';

// Country mappings
const countryFlags: Record<string, string> = {
  AR: '🇦🇷', BO: '🇧🇴', BR: '🇧🇷', CL: '🇨🇱', CO: '🇨🇴',
  CR: '🇨🇷', CU: '🇨🇺', DO: '🇩🇴', EC: '🇪🇨', SV: '🇸🇻',
  GT: '🇬🇹', HN: '🇭🇳', MX: '🇲🇽', NI: '🇳🇮', PA: '🇵🇦',
  PY: '🇵🇾', PE: '🇵🇪', PR: '🇵🇷', UY: '🇺🇾', VE: '🇻🇪',
};

const countryNames: Record<string, string> = {
  AR: 'Argentina', BO: 'Bolivia', BR: 'Brasil', CL: 'Chile', CO: 'Colombia',
  CR: 'Costa Rica', CU: 'Cuba', DO: 'República Dominicana', EC: 'Ecuador', SV: 'El Salvador',
  GT: 'Guatemala', HN: 'Honduras', MX: 'México', NI: 'Nicaragua', PA: 'Panamá',
  PY: 'Paraguay', PE: 'Perú', PR: 'Puerto Rico', UY: 'Uruguay', VE: 'Venezuela',
};

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function SantoPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Fetch saint by slug
  const { data: saint, isLoading, error } = useQuery({
    queryKey: ['saint', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_saints')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Fetch related saints (same month or same country for patrons)
  const { data: relatedSaints = [] } = useQuery({
    queryKey: ['related-saints', saint?.id, saint?.feast_month, saint?.country_code],
    queryFn: async () => {
      if (!saint) return [];
      
      let query = supabase
        .from('calendar_saints')
        .select('id, name, slug, image_url, feast_day, feast_month, category, country_code')
        .neq('id', saint.id)
        .limit(4);

      if (saint.category === 'patron_country' && saint.country_code) {
        // For patrons, get saints from same country or same month
        query = query.or(`country_code.eq.${saint.country_code},feast_month.eq.${saint.feast_month}`);
      } else {
        // For regular saints, get saints from same month
        query = query.eq('feast_month', saint.feast_month);
      }

      const { data } = await query;
      return data || [];
    },
    enabled: !!saint,
  });

  const formatDate = (month: number, day: number) => {
    return `${day} de ${monthNames[month - 1]}`;
  };

  const handleShare = async () => {
    if (navigator.share && saint) {
      try {
        await navigator.share({
          title: `${saint.name} - ElRugido`,
          text: saint.description || `Conoce la historia de ${saint.name}`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    }
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
    : `${saint.name} - Fiesta: ${formatDate(saint.feast_month, saint.feast_day)}. Conoce su historia y oración en ElRugido.`;

  return (
    <>
      <Helmet>
        <title>{saint.name} - Calendario de Santos | ElRugido</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={`${saint.name} - ElRugido`} />
        <meta property="og:description" content={metaDescription} />
        {saint.image_url && <meta property="og:image" content={saint.image_url} />}
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`https://elrugido.com/santo/${saint.slug}`} />
        
        {/* Schema.org markup for rich snippets */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": saint.name,
            "description": saint.description,
            "image": saint.image_url,
            "sameAs": `https://elrugido.com/santo/${saint.slug}`
          })}
        </script>
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

        {/* Back button - Mobile */}
        <div className="container mx-auto max-w-5xl px-4 py-4 sm:hidden">
          <Link to="/santos">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <section className="relative">
          <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10"
              >
                {saint.image_url ? (
                  <img
                    src={saint.image_url}
                    alt={saint.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Church className="h-24 w-24 text-muted-foreground/30" />
                  </div>
                )}
                
                {/* Country flag for patrons */}
                {isPatron && saint.country_code && (
                  <div className="absolute top-4 right-4 text-4xl">
                    {countryFlags[saint.country_code]}
                  </div>
                )}
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-6"
              >
                <div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">{saint.name}</h1>
                  
                  {isPatron && saint.country_code && (
                    <p className="text-lg text-primary font-medium mb-4">
                      Patrono/a de {countryNames[saint.country_code]}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <Badge variant="secondary" className="gap-1.5 text-sm py-1 px-3">
                      <Calendar className="h-4 w-4" />
                      {formatDate(saint.feast_month, saint.feast_day)}
                    </Badge>
                    
                    {saint.country_code && (
                      <Badge variant="outline" className="gap-1.5 text-sm py-1 px-3">
                        <MapPin className="h-4 w-4" />
                        {countryNames[saint.country_code] || saint.country_code}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {saint.tags && saint.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {saint.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3">
                  {saint.prayer_id && (
                    <Link to="/auth">
                      <Button className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        Rezar oración
                      </Button>
                    </Link>
                  )}
                  <Button variant="outline" className="gap-2" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                    Compartir
                  </Button>
                </div>

                {/* Description preview on desktop */}
                {saint.description && (
                  <div className="hidden md:block">
                    <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Historia
                    </h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {saint.description}
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* History Section - Mobile */}
        {saint.description && (
          <section className="md:hidden container mx-auto max-w-5xl px-4 py-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Historia
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {saint.description}
              </p>
            </motion.div>
          </section>
        )}

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
                            {formatDate(related.feast_month, related.feast_day)}
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

        {/* CTA Section */}
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
                el rosario interactivo y mucho más.
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

        {/* Footer */}
        <footer className="py-8 px-4 border-t">
          <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <Link to="/" className="flex items-center gap-2">
              <img src={logoElRugido} alt="ElRugido" className="h-6 w-6" />
              <span className="font-display font-semibold">ElRugido</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link to="/santos" className="hover:text-foreground transition-colors">
                Calendario de Santos
              </Link>
              <Link to="/" className="hover:text-foreground transition-colors">
                Inicio
              </Link>
            </nav>
            <p>© {new Date().getFullYear()} ElRugido</p>
          </div>
        </footer>
      </div>
    </>
  );
}
