import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Heart, ChevronRight, BookOpen, Moon, Loader2, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OracionCard } from "@/components/oraciones/OracionCard";
import { OracionDetail } from "@/components/oraciones/OracionDetail";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { useOraciones } from "@/hooks/useOraciones";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
} as const;

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
      {/* Hero Header */}
      <motion.header 
        className="relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/10 to-background" />
        <div className="relative z-10 p-5 pt-8">
          <motion.h1 
            className="font-heading text-3xl font-bold text-foreground mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Libro de Oraciones
          </motion.h1>
          <motion.p 
            className="text-muted-foreground text-sm mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Encuentra paz en la oración
          </motion.p>
          
          {/* Search */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar oraciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-card border-0"
            />
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div 
          className="flex gap-2 px-5 pb-5 overflow-x-auto scrollbar-hide"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Link to="/rosario">
            <Button variant="secondary" size="sm" className="gap-2 whitespace-nowrap glass-button border-0">
              <BookOpen className="h-4 w-4" />
              Santo Rosario
            </Button>
          </Link>
          <Link to="/novenas">
            <Button variant="secondary" size="sm" className="gap-2 whitespace-nowrap glass-button border-0">
              <Calendar className="h-4 w-4" />
              Novenas
            </Button>
          </Link>
          <Link to="/sleep">
            <Button variant="secondary" size="sm" className="gap-2 whitespace-nowrap glass-button border-0">
              <Moon className="h-4 w-4" />
              Sleep Stories
            </Button>
          </Link>
        </motion.div>
      </motion.header>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : searchQuery ? (
        <motion.div 
          className="p-4 space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <p className="text-sm text-muted-foreground">
            {filteredOraciones.length} resultado{filteredOraciones.length !== 1 && "s"}
          </p>
          {filteredOraciones.map((oracion) => (
            <motion.div key={oracion.id} variants={itemVariants}>
              <OracionCard
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
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="w-full justify-start px-4 bg-transparent border-b border-border/50 rounded-none h-auto py-0">
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
            <ScrollArea className="h-[calc(100vh-280px)]">
              <motion.div 
                className="p-4 space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {categorias.map((categoria, catIdx) => (
                  <motion.div 
                    key={categoria}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: catIdx * 0.1 }}
                  >
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
                  </motion.div>
                ))}
              </motion.div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="favoritas" className="mt-0">
            <ScrollArea className="h-[calc(100vh-280px)]">
              <motion.div 
                className="p-4 space-y-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {favoritasOraciones.length === 0 ? (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="glass-card rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <Heart className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground">
                      No tienes oraciones favoritas aún
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Toca el corazón en una oración para guardarla aquí
                    </p>
                  </motion.div>
                ) : (
                  favoritasOraciones.map((oracion) => (
                    <motion.div key={oracion.id} variants={itemVariants}>
                      <OracionCard
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
                    </motion.div>
                  ))
                )}
              </motion.div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}

      <BottomNavigation />
    </div>
  );
}
