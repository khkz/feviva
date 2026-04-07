import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ArrowRight, Calendar, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface NovenaDia {
  dia: number;
  titulo: string;
  oracion: string;
  reflexion?: string;
}

const NovenaPublicPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: novena, isLoading } = useQuery({
    queryKey: ["novena-public", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("novenas")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: 60 * 60 * 1000,
  });

  const dias = (novena?.dias as NovenaDia[] | null) || [];
  const dia1 = dias[0];

  const schemaHowTo = novena ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": novena.titulo,
    "description": novena.descripcion,
    "totalTime": "P9D",
    "step": dias.map((d) => ({
      "@type": "HowToStep",
      "position": d.dia,
      "name": d.titulo || `Día ${d.dia}`,
      "text": d.oracion?.substring(0, 200) || "",
    })),
  } : null;

  const schemaArticle = novena ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": novena.titulo,
    "description": novena.descripcion,
    "author": { "@type": "Organization", "name": "ElRugido" },
    "publisher": {
      "@type": "Organization",
      "name": "ElRugido",
      "logo": { "@type": "ImageObject", "url": "https://elrugido.com/logo-elrugido.svg" }
    },
    "mainEntityOfPage": `https://elrugido.com/novena/${id}`,
    ...(novena.imagen_url && { "image": novena.imagen_url }),
  } : null;

  const schemaBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://elrugido.com" },
      { "@type": "ListItem", "position": 2, "name": "Novenas", "item": "https://elrugido.com/novenas-publicas" },
      ...(novena ? [{ "@type": "ListItem", "position": 3, "name": novena.titulo, "item": `https://elrugido.com/novena/${id}` }] : []),
    ],
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-96 w-full max-w-3xl mx-4" />
      </div>
    );
  }

  if (!novena) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground mb-4">Novena no encontrada</p>
            <Link to="/novenas-publicas"><Button variant="outline">Ver todas las novenas</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${novena.titulo} — Novena de 9 días | ElRugido`}</title>
        <meta name="description" content={`${novena.descripcion} Reza esta novena de 9 días con reflexiones y oraciones guiadas.`} />
        <meta property="og:title" content={novena.titulo} />
        <meta property="og:description" content={novena.descripcion} />
        <meta property="og:url" content={`https://elrugido.com/novena/${id}`} />
        {novena.imagen_url && <meta property="og:image" content={novena.imagen_url} />}
        <link rel="canonical" href={`https://elrugido.com/novena/${id}`} />
        <script type="application/ld+json">{JSON.stringify(schemaBreadcrumb)}</script>
        {schemaArticle && <script type="application/ld+json">{JSON.stringify(schemaArticle)}</script>}
        {schemaHowTo && <script type="application/ld+json">{JSON.stringify(schemaHowTo)}</script>}
      </Helmet>

      <div className="min-h-screen bg-background">
        <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-30">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/novenas-publicas" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Novenas</span>
            </Link>
            <Link to="/auth">
              <Button size="sm" variant="default">Crear cuenta gratis</Button>
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Hero */}
          {novena.imagen_url && (
            <div className="aspect-[16/9] rounded-xl overflow-hidden mb-6">
              <img src={novena.imagen_url} alt={novena.titulo} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Novena de 9 días</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">{novena.titulo}</h1>
            <p className="text-muted-foreground">{novena.descripcion}</p>
            <p className="text-sm text-foreground/70 mt-2 italic">Intención: {novena.intencion}</p>
          </div>

          {/* Day 1 preview */}
          {dia1 && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Día 1: {dia1.titulo || "Primera jornada"}
                  </h2>
                </div>
                <div className="text-foreground/80 leading-relaxed whitespace-pre-line line-clamp-12">
                  {dia1.oracion}
                </div>
                {dia1.reflexion && (
                  <div className="mt-4 pt-4 border-t border-border/40">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Reflexión</h3>
                    <p className="text-sm text-muted-foreground line-clamp-4">{dia1.reflexion}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Remaining days teaser */}
          {dias.length > 1 && (
            <Card className="mb-6 border-dashed">
              <CardContent className="pt-6">
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-4">
                  {dias.map((d) => (
                    <div
                      key={d.dia}
                      className={`rounded-lg p-2 text-center text-sm font-medium ${
                        d.dia === 1
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {d.dia}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Regístrate para acceder a los 9 días completos con recordatorios diarios.
                </p>
              </CardContent>
            </Card>
          )}

          {/* CTA */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6 text-center">
              <h3 className="text-lg font-bold text-foreground mb-2">
                Reza los 9 días completos
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Lleva el seguimiento de tu novena, recibe recordatorios diarios y accede al audio.
              </p>
              <Link to="/auth">
                <Button size="lg" className="group">
                  Empieza esta novena gratis
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
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

export default NovenaPublicPage;
