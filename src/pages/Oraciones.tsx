import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Heart, BookOpen, Moon, Loader2, Calendar, Sparkles, Cross, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OracionCard } from "@/components/oraciones/OracionCard";
import { OracionDetail } from "@/components/oraciones/OracionDetail";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { useOraciones } from "@/hooks/useOraciones";
import { useAudioCache } from "@/hooks/useAudioCache";
import { cn } from "@/lib/utils";

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

// Category icons and colors
const CATEGORY_CONFIG: Record<string, { icon: typeof Cross; gradient: string }> = {
  "Oraciones Básicas": { icon: Cross, gradient: "from-primary/20 to-primary/5" },
  "Oraciones Marianas": { icon: Sparkles, gradient: "from-blue-500/20 to-blue-500/5" },
  "Oraciones a los Santos": { icon: BookOpen, gradient: "from-amber-500/20 to-amber-500/5" },
  "Oraciones del Rosario": { icon: Moon, gradient: "from-purple-500/20 to-purple-500/5" },
};

export default function Oraciones() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOracion, setSelectedOracion] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
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

  const { cacheAudio } = useAudioCache();

  // Pre-cache all existing audio URLs on page load
  useEffect(() => {
    if (oraciones.length > 0) {
      const audioUrls = oraciones
        .map(o => o.audio_url)
        .filter((url): url is string => !!url);
      
      // Pre-cache in background (first 10 for performance)
      audioUrls.slice(0, 10).forEach(url => {
        cacheAudio(url).catch(console.error);
      });
    }
  }, [oraciones, cacheAudio]);

  // Filter by search
  const filteredOraciones = oraciones.filter((o) =>
    o.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.texto.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected prayer details
  const selected = oraciones.find((o) => o.id === selectedOracion);

  // Get favorite prayers
  const favoritasOraciones = oraciones.filter((o) => favoritos.includes(o.id));

  // Get oraciones to display based on active category
  const displayedOraciones = activeCategory 
    ? oracionesByCategoria[activeCategory] || []
    : null;

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
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <DesktopSidebar userName="" userLevel={1} userStreak={0} />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-64 pb-20">
        {/* Back to Home button - Mobile */}
        <div className="lg:hidden p-4 pb-0">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <Home className="h-4 w-4" />
              Inicio
            </Button>
          </Link>
        </div>
        
        {/* Immersive Hero Header */}
      <motion.header 
        className="relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background gradient with animated orb */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/15 via-secondary/10 to-background" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 p-5 pt-8">
          <motion.div
            className="flex items-center gap-4 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="p-3 rounded-2xl bg-secondary/20 backdrop-blur-sm">
              <Cross className="h-7 w-7 text-secondary" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">
                Libro de Oraciones
              </h1>
              <p className="text-muted-foreground text-sm">
                Encuentra paz en la oración
              </p>
            </div>
          </motion.div>
          
          {/* Search */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar oraciones..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveCategory(null);
              }}
              className="pl-12 h-12 glass-card border-0 text-base rounded-2xl"
            />
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div 
          className="flex gap-2 px-5 pb-5 overflow-x-auto scrollbar-hide"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link to="/rosario">
            <Button variant="secondary" size="sm" className="gap-2 whitespace-nowrap glass-button border-0 rounded-xl h-10">
              <BookOpen className="h-4 w-4" />
              Santo Rosario
            </Button>
          </Link>
          <Link to="/novenas">
            <Button variant="secondary" size="sm" className="gap-2 whitespace-nowrap glass-button border-0 rounded-xl h-10">
              <Calendar className="h-4 w-4" />
              Novenas
            </Button>
          </Link>
          <Link to="/sleep">
            <Button variant="secondary" size="sm" className="gap-2 whitespace-nowrap glass-button border-0 rounded-xl h-10">
              <Moon className="h-4 w-4" />
              Sleep Stories
            </Button>
          </Link>
          {isAuthenticated && favoritasOraciones.length > 0 && (
            <Button 
              variant="secondary" 
              size="sm" 
              className={cn(
                "gap-2 whitespace-nowrap rounded-xl h-10",
                activeCategory === "favoritas" 
                  ? "bg-destructive/20 text-destructive border-destructive/30" 
                  : "glass-button border-0"
              )}
              onClick={() => setActiveCategory(activeCategory === "favoritas" ? null : "favoritas")}
            >
              <Heart className="h-4 w-4" fill={activeCategory === "favoritas" ? "currentColor" : "none"} />
              Favoritas ({favoritasOraciones.length})
            </Button>
          )}
        </motion.div>
      </motion.header>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-secondary/30 rounded-full blur-xl animate-pulse" />
            <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
          </div>
          <p className="text-muted-foreground text-sm">Cargando oraciones...</p>
        </div>
      ) : searchQuery ? (
        // Search results
        <motion.div 
          className="p-4 space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <p className="text-sm text-muted-foreground px-1">
            {filteredOraciones.length} resultado{filteredOraciones.length !== 1 && "s"} para "{searchQuery}"
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
          {filteredOraciones.length === 0 && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="glass-card rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Search className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground">No se encontraron oraciones</p>
            </motion.div>
          )}
        </motion.div>
      ) : activeCategory === "favoritas" ? (
        // Favorites
        <motion.div 
          className="p-4 space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-destructive" fill="currentColor" />
            <h2 className="font-heading font-semibold text-lg">Mis Favoritas</h2>
          </div>
          {favoritasOraciones.map((oracion) => (
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
          ))}
        </motion.div>
      ) : activeCategory && displayedOraciones ? (
        // Category view
        <motion.div 
          className="p-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="flex items-center gap-3 mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setActiveCategory(null)}
              className="text-muted-foreground"
            >
              ← Volver
            </Button>
            <h2 className="font-heading font-semibold text-lg">{activeCategory}</h2>
          </motion.div>
          <div className="space-y-3">
            {displayedOraciones.map((oracion) => (
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
          </div>
        </motion.div>
      ) : (
        // Category grid view (default)
        <ScrollArea className="h-[calc(100vh-260px)]">
          <motion.div 
            className="p-4 space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Category Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              {categorias.map((categoria, idx) => {
                const config = CATEGORY_CONFIG[categoria] || { icon: BookOpen, gradient: "from-muted to-muted/5" };
                const Icon = config.icon;
                const count = oracionesByCategoria[categoria]?.length || 0;
                
                return (
                  <motion.button
                    key={categoria}
                    variants={itemVariants}
                    className={cn(
                      "relative p-4 rounded-2xl text-left transition-all duration-300",
                      "bg-gradient-to-br border border-border/50",
                      "hover:shadow-medium hover:scale-[1.02] active:scale-[0.98]",
                      "overflow-hidden group",
                      config.gradient
                    )}
                    onClick={() => setActiveCategory(categoria)}
                  >
                    <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-30 transition-opacity">
                      <Icon className="h-12 w-12" />
                    </div>
                    <div className="relative z-10">
                      <div className="p-2 rounded-xl bg-background/50 backdrop-blur-sm w-fit mb-3">
                        <Icon className="h-5 w-5 text-foreground" />
                      </div>
                      <h3 className="font-heading font-semibold text-sm text-foreground line-clamp-2 mb-1">
                        {categoria}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {count} {count === 1 ? "oración" : "oraciones"}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Featured Section - Most Popular */}
            {oraciones.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-secondary" />
                  <h2 className="font-heading font-semibold text-lg">Oraciones Populares</h2>
                </div>
                <div className="space-y-2">
                  {oraciones.slice(0, 4).map((oracion) => (
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
            )}
          </motion.div>
        </ScrollArea>
        )}

        <BottomNavigation />
      </div>
    </div>
  );
}
