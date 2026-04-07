import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronLeft, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CapsuleCard } from "@/components/capsules/CapsuleCard";
import { CapsuleShareButtons } from "@/components/capsules/CapsuleShareButtons";
import { useDailyCapsule } from "@/hooks/useDailyCapsule";

const CapsulaDelDia = () => {
  const { capsule, recentCapsules, isLoading, incrementShare } = useDailyCapsule();

  const schemaArticle = capsule ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": capsule.dato_impactante,
    "datePublished": capsule.fecha,
    "author": { "@type": "Organization", "name": "ElRugido", "url": "https://elrugido.com" },
    "publisher": {
      "@type": "Organization",
      "name": "ElRugido",
      "logo": { "@type": "ImageObject", "url": "https://elrugido.com/logo-elrugido.png" }
    },
    "mainEntityOfPage": "https://elrugido.com/capsula-del-dia",
    "description": capsule.reflexion,
    "about": {
      "@type": "DefinedTerm",
      "name": "Fe y tecnología",
      "description": "Datos verificables que conectan la tradición católica con los avances tecnológicos modernos"
    },
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", ".capsule-dato"]
    },
    ...(capsule.fuente && { "citation": capsule.fuente }),
    "inLanguage": "es"
  } : null;

  return (
    <>
      <Helmet>
        <title>{capsule ? `${capsule.emoji_icon} ${capsule.dato_impactante.substring(0, 50)}...` : "Cápsula del día"} | ElRugido</title>
        <meta name="description" content={capsule?.reflexion || "Micro-dato diario sobre fe, tecnología y humanidad."} />
        <meta property="og:title" content={capsule ? capsule.dato_impactante : "Cápsula del día — ElRugido"} />
        <meta property="og:description" content={capsule?.reflexion || "Un dato que cambiará tu perspectiva hoy."} />
        <meta property="og:url" content="https://elrugido.com/capsula-del-dia" />
        <link rel="canonical" href="https://elrugido.com/capsula-del-dia" />
        {schemaArticle && <script type="application/ld+json">{JSON.stringify(schemaArticle)}</script>}
      </Helmet>

      <div className="min-h-screen bg-background">
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

        <main className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Citable definition */}
          <p className="text-xs text-muted-foreground mb-6 text-center max-w-lg mx-auto">
            Las cápsulas de ElRugido son micro-datos verificables que conectan fe, tecnología y humanidad. Cada dato incluye su fuente original.
          </p>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Cápsula del día
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Un dato para despertar
            </h1>
            <p className="text-muted-foreground">
              Cada día, un micro-dato que conecta tecnología, humanidad y fe.
            </p>
          </div>

          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-2xl" />
          ) : capsule ? (
            <div className="space-y-6">
              <CapsuleCard capsule={capsule} />

              <div className="flex justify-center">
                <CapsuleShareButtons
                  capsule={capsule}
                  onShare={() => incrementShare(capsule.id)}
                />
              </div>

              {/* CTA */}
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="pt-6 text-center">
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    ¿Quieres recibir una cápsula cada día?
                  </h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Crea tu cuenta gratuita y recibe reflexiones diarias que te hacen pensar.
                  </p>
                  <Link to="/auth">
                    <Button size="lg" className="group">
                      Empieza gratis
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Recent capsules */}
              {recentCapsules && recentCapsules.length > 1 && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-4">Cápsulas recientes</h2>
                  <div className="space-y-3">
                    {recentCapsules.slice(1).map((c) => (
                      <CapsuleCard key={c.id} capsule={c} variant="compact" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">La cápsula de hoy estará disponible pronto.</p>
              </CardContent>
            </Card>
          )}
        </main>

        <footer className="border-t border-border/40 py-6 mt-12">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} ElRugido — Ruge tu fe. Defiende tu esperanza.</p>
            <div className="flex justify-center gap-4 mt-2">
              <Link to="/santos" className="hover:text-primary transition-colors">Santos</Link>
              <Link to="/oraciones" className="hover:text-primary transition-colors">Oraciones</Link>
              <Link to="/evangelio-del-dia" className="hover:text-primary transition-colors">Evangelio</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default CapsulaDelDia;
