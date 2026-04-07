import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

const NovenasPublic = () => {
  const { data: novenas, isLoading } = useQuery({
    queryKey: ["novenas-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("novenas")
        .select("id, titulo, descripcion, categoria, imagen_url, intencion")
        .order("orden");
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 60 * 1000,
  });

  const schemaItemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Novenas Católicas",
    "description": "Colección de novenas católicas para rezar durante nueve días",
    "numberOfItems": novenas?.length || 0,
    "itemListElement": (novenas || []).map((n, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": n.titulo,
      "url": `https://elrugido.com/novena/${n.id}`,
    })),
  };

  const categoriaLabel: Record<string, string> = {
    mariana: "Mariana",
    cristologica: "Cristológica",
    espiritu_santo: "Espíritu Santo",
    santos: "Santos",
    situaciones: "Situaciones",
  };

  return (
    <>
      <Helmet>
        <title>Novenas Católicas — Oraciones de 9 días | ElRugido</title>
        <meta name="description" content="Reza novenas católicas guiadas: Virgen María, Sagrado Corazón, Espíritu Santo, San José y más. Nueve días de oración con reflexión diaria." />
        <meta property="og:title" content="Novenas Católicas — Oraciones de 9 días" />
        <meta property="og:description" content="Colección de novenas católicas guiadas para rezar durante nueve días." />
        <meta property="og:url" content="https://elrugido.com/novenas-publicas" />
        <link rel="canonical" href="https://elrugido.com/novenas-publicas" />
        <script type="application/ld+json">{JSON.stringify(schemaItemList)}</script>
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

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Heart className="w-4 h-4" />
              Novenas católicas
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Novenas de oración
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Nueve días de oración perseverante. Elige una novena y acompáñala con reflexiones diarias.
            </p>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(novenas || []).map((novena) => (
                <Link key={novena.id} to={`/novena/${novena.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 h-full">
                    {novena.imagen_url && (
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={novena.imagen_url}
                          alt={novena.titulo}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <span className="text-xs text-primary font-medium uppercase tracking-wider">
                        {categoriaLabel[novena.categoria] || novena.categoria}
                      </span>
                      <h2 className="text-lg font-bold text-foreground mt-1 mb-2">{novena.titulo}</h2>
                      <p className="text-sm text-muted-foreground line-clamp-2">{novena.descripcion}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* CTA */}
          <Card className="mt-10 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6 text-center">
              <h3 className="text-lg font-bold text-foreground mb-2">Reza con guía diaria</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Crea tu cuenta gratuita para llevar seguimiento de tus novenas, recibir recordatorios y acceder al audio.
              </p>
              <Link to="/auth">
                <Button size="lg" className="group">
                  Empieza gratis
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

export default NovenasPublic;
