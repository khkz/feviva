import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BookOpen, Play, ArrowRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDailyGospel } from "@/hooks/useDailyGospel";
import { useDailyContent } from "@/hooks/useDailyContent";
import { Skeleton } from "@/components/ui/skeleton";

const EvangelioPublic = () => {
  const { activeGospel, isLoading } = useDailyGospel();
  const { content: dailyContent } = useDailyContent();

  const today = new Date();
  const formattedDate = format(today, "EEEE d 'de' MMMM, yyyy", { locale: es });
  const isoDate = format(today, "yyyy-MM-dd");

  const pageTitle = activeGospel
    ? `Evangelio del día ${format(today, "d 'de' MMMM", { locale: es })} — ${activeGospel.referencia}`
    : `Evangelio del día — ${format(today, "d 'de' MMMM", { locale: es })}`;

  const schemaArticle = activeGospel ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": pageTitle,
    "datePublished": isoDate,
    "dateModified": isoDate,
    "author": { "@type": "Organization", "name": "ElRugido", "url": "https://elrugido.com" },
    "publisher": {
      "@type": "Organization",
      "name": "ElRugido",
      "logo": { "@type": "ImageObject", "url": "https://elrugido.com/logo-elrugido.png" }
    },
    "mainEntityOfPage": `https://elrugido.com/evangelio-del-dia`,
    "description": `Evangelio del día ${format(today, "d 'de' MMMM", { locale: es })}: ${activeGospel.referencia}. Lectura, reflexión y video para la meditación diaria católica.`,
    "about": {
      "@type": "Thing",
      "name": "Evangelio",
      "description": "Lectura del Evangelio según el calendario litúrgico de la Iglesia Católica"
    },
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", ".reflexion-text"]
    },
    "inLanguage": "es",
    ...(activeGospel.youtube_video_id && {
      "citation": `https://www.youtube.com/watch?v=${activeGospel.youtube_video_id}`
    })
  } : null;

  const schemaBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://elrugido.com" },
      { "@type": "ListItem", "position": 2, "name": "Evangelio del día", "item": "https://elrugido.com/evangelio-del-dia" }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={`Evangelio del día con reflexión católica. ${activeGospel?.referencia || ''} — Lectura y meditación para hoy.`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={`Reflexión del Evangelio de hoy: ${activeGospel?.referencia || 'lectura del día'}`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://elrugido.com/evangelio-del-dia" />
        <link rel="canonical" href="https://elrugido.com/evangelio-del-dia" />
        <script type="application/ld+json">{JSON.stringify(schemaBreadcrumb)}</script>
        {schemaArticle && <script type="application/ld+json">{JSON.stringify(schemaArticle)}</script>}
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-30">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Inicio</span>
            </Link>
            <Link to="/auth">
              <Button size="sm" variant="default">Crear cuenta gratis</Button>
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Citable definition for LLMs */}
          <div className="sr-only" aria-hidden="false">
            <p>El evangelio del día es la lectura del Evangelio según el calendario litúrgico de la Iglesia Católica, que se proclama en la misa diaria. ElRugido publica cada día el texto del evangelio con una reflexión, video explicativo y versículo destacado.</p>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" />
              Evangelio del día
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {isLoading ? <Skeleton className="h-8 w-64 mx-auto" /> : (activeGospel?.referencia || "Evangelio de hoy")}
            </h1>
            <p className="text-muted-foreground capitalize">{formattedDate}</p>
            {activeGospel?.tiempo_liturgico && (
              <p className="text-sm text-primary mt-1">{activeGospel.tiempo_liturgico}</p>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : activeGospel ? (
            <div className="space-y-6">
              {/* Video thumbnail as preview */}
              {activeGospel.youtube_video_id && (
                <Card className="overflow-hidden">
                  <div className="relative aspect-video bg-muted">
                    <img
                      src={`https://img.youtube.com/vi/${activeGospel.youtube_video_id}/maxresdefault.jpg`}
                      alt={`Evangelio ${activeGospel.referencia}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Link to="/auth" className="bg-primary text-primary-foreground rounded-full p-4 hover:scale-110 transition-transform shadow-lg">
                        <Play className="w-8 h-8" />
                      </Link>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      Regístrate para ver el video completo
                    </div>
                  </div>
                </Card>
              )}

              {/* Gospel title */}
              {activeGospel.titulo && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold text-foreground mb-2">{activeGospel.titulo}</h2>
                    {activeGospel.sacerdote && (
                      <p className="text-sm text-muted-foreground">Reflexión por {activeGospel.sacerdote}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Daily reflection preview */}
              {dailyContent?.reflexion_ia && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      💭 Reflexión del día
                    </h2>
                    <p className="text-foreground/80 leading-relaxed line-clamp-6">
                      {dailyContent.reflexion_ia}
                    </p>
                    <div className="mt-4 pt-4 border-t border-border/40">
                      <Link to="/auth" className="text-primary hover:underline text-sm font-medium inline-flex items-center gap-1">
                        <Play className="w-3 h-3" /> Escucha la reflexión en audio — regístrate gratis
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Daily verse preview */}
              {dailyContent?.versiculo_texto && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <h2 className="text-lg font-semibold text-foreground mb-3">📖 Versículo del día</h2>
                    <blockquote className="text-foreground/80 italic border-l-2 border-primary pl-4">
                      "{dailyContent.versiculo_texto}"
                    </blockquote>
                    <p className="text-sm text-primary mt-2 font-medium">{dailyContent.versiculo_referencia}</p>
                  </CardContent>
                </Card>
              )}

              {/* CTA */}
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="pt-6 text-center">
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    ¿Quieres más para tu día?
                  </h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Audio del Evangelio, oración de Laudes, tip apologético y más — todo en un solo lugar.
                  </p>
                  <Link to="/auth">
                    <Button size="lg" className="group">
                      Empieza gratis
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">El evangelio de hoy estará disponible pronto.</p>
              </CardContent>
            </Card>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border/40 py-6 mt-12">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} ElRugido — Ruge tu fe. Defiende tu esperanza.</p>
            <div className="flex justify-center gap-4 mt-2">
              <Link to="/santos" className="hover:text-primary transition-colors">Santos</Link>
              <Link to="/oraciones" className="hover:text-primary transition-colors">Oraciones</Link>
              <Link to="/novenas-publicas" className="hover:text-primary transition-colors">Novenas</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default EvangelioPublic;
