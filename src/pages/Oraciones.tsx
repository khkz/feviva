import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Heart, ChevronRight, BookOpen, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OracionCard } from "@/components/oraciones/OracionCard";
import { OracionDetail } from "@/components/oraciones/OracionDetail";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { useOraciones } from "@/hooks/useOraciones";

export default function Oraciones() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOracion, setSelectedOracion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("todas");
  
  const { 
    oraciones, 
    categorias, 
    oracionesByCategoria, 
    isLoading,
    toggleFavorite,
    isFavorite,
    favoritos,
    isAuthenticated,
  } = useOraciones();

  // Filter by search
  const filteredOraciones = oraciones.filter((o) =>
    o.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.texto.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected prayer details
  const selected = oraciones.find((o) => o.id === selectedOracion);

  // Get favorite prayers
  const favoritasOraciones = oraciones.filter((o) => favoritos.includes(o.id));

  if (selected) {
    return (
      <OracionDetail
        id={selected.id}
        nombre={selected.nombre}
        texto={selected.texto}
        categoria={selected.categoria}
        historia={selected.historia ?? undefined}
        audioUrl={selected.audio_url ?? undefined}
        isFavorite={isFavorite(selected.id)}
        onToggleFavorite={() => toggleFavorite(selected.id)}
        onClose={() => setSelectedOracion(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="p-4">
          <h1 className="font-heading text-2xl font-bold text-foreground mb-4">
            Libro de Oraciones
          </h1>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar oraciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 px-4 pb-4 overflow-x-auto">
          <Link to="/rosario">
            <Button variant="secondary" size="sm" className="gap-2 whitespace-nowrap">
              <BookOpen className="h-4 w-4" />
              Santo Rosario
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : searchQuery ? (
        <div className="p-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            {filteredOraciones.length} resultado{filteredOraciones.length !== 1 && "s"}
          </p>
          {filteredOraciones.map((oracion) => (
            <OracionCard
              key={oracion.id}
              id={oracion.id}
              nombre={oracion.nombre}
              texto={oracion.texto}
              categoria={oracion.categoria}
              subcategoria={oracion.subcategoria ?? undefined}
              historia={oracion.historia ?? undefined}
              audioUrl={oracion.audio_url ?? undefined}
              isFavorite={isFavorite(oracion.id)}
              onToggleFavorite={toggleFavorite}
              onSelect={() => setSelectedOracion(oracion.id)}
            />
          ))}
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="w-full justify-start px-4 bg-transparent border-b border-border rounded-none h-auto py-0">
            <TabsTrigger 
              value="todas" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              Todas
            </TabsTrigger>
            {isAuthenticated && (
              <TabsTrigger 
                value="favoritas"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                <Heart className="h-4 w-4 mr-1" />
                Favoritas
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="todas" className="mt-0">
            <ScrollArea className="h-[calc(100vh-240px)]">
              <div className="p-4 space-y-6">
                {categorias.map((categoria) => (
                  <div key={categoria}>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="font-heading font-semibold text-lg text-foreground">
                        {categoria}
                      </h2>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      {oracionesByCategoria[categoria]?.map((oracion) => (
                        <OracionCard
                          key={oracion.id}
                          id={oracion.id}
                          nombre={oracion.nombre}
                          texto={oracion.texto}
                          categoria={oracion.categoria}
                          subcategoria={oracion.subcategoria ?? undefined}
                          historia={oracion.historia ?? undefined}
                          audioUrl={oracion.audio_url ?? undefined}
                          isFavorite={isFavorite(oracion.id)}
                          onToggleFavorite={toggleFavorite}
                          onSelect={() => setSelectedOracion(oracion.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="favoritas" className="mt-0">
            <ScrollArea className="h-[calc(100vh-240px)]">
              <div className="p-4 space-y-3">
                {favoritasOraciones.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No tienes oraciones favoritas aún
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Toca el corazón en una oración para guardarla aquí
                    </p>
                  </div>
                ) : (
                  favoritasOraciones.map((oracion) => (
                    <OracionCard
                      key={oracion.id}
                      id={oracion.id}
                      nombre={oracion.nombre}
                      texto={oracion.texto}
                      categoria={oracion.categoria}
                      subcategoria={oracion.subcategoria ?? undefined}
                      historia={oracion.historia ?? undefined}
                      audioUrl={oracion.audio_url ?? undefined}
                      isFavorite={true}
                      onToggleFavorite={toggleFavorite}
                      onSelect={() => setSelectedOracion(oracion.id)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}

      <BottomNavigation />
    </div>
  );
}
