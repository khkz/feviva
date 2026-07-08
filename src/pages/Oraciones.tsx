import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Heart, BookOpen, Moon, Loader2, Calendar, Sparkles, Cross, Home, Church, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OracionCard } from "@/components/oraciones/OracionCard";
import { OracionFundamentalCard } from "@/components/oraciones/OracionFundamentalCard";
import { OracionDetail } from "@/components/oraciones/OracionDetail";
import { OracionesHero } from "@/components/oraciones/OracionesHero";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { useOraciones } from "@/hooks/useOraciones";
import { useAudioCache } from "@/hooks/useAudioCache";
import { useAudioPlayer, AudioQueueItem } from "@/contexts/AudioPlayerContext";
import { cn } from "@/lib/utils";
import { ListRowsSkeleton, CardGridSkeleton } from "@/components/shared/PageSkeletons";

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
const CATEGORY_CONFIG: Record<string, { icon: typeof Cross; gradient: string; bgClass: string }> = {
  "Oraciones Básicas": { 
    icon: Cross, 
    gradient: "from-primary/20 to-primary/5",
    bgClass: "bg-primary/10" 
  },
  "Oraciones Marianas": { 
    icon: Sparkles, 
    gradient: "from-blue-500/20 to-blue-500/5",
    bgClass: "bg-blue-500/10"
  },
  "Oraciones a los Santos": { 
    icon: Church, 
    gradient: "from-amber-500/20 to-amber-500/5",
    bgClass: "bg-amber-500/10"
  },
  "Oraciones del Rosario": { 
    icon: Moon, 
    gradient: "from-purple-500/20 to-purple-500/5",
    bgClass: "bg-purple-500/10"
  },
};

// Helper to convert oracion to AudioQueueItem
interface OracionData {
  id: string;
  nombre: string;
  texto: string;
  categoria: string;
  subcategoria?: string | null;
  audio_url?: string | null;
  tagline?: string | null;
  es_fundamental?: boolean | null;
}

function oracionToQueueItem(oracion: OracionData): AudioQueueItem {
  return {
    id: oracion.id,
    title: oracion.nombre,
    subtitle: oracion.categoria,
    audioUrl: oracion.audio_url || null,
    type: 'oracion',
    originalData: oracion,
  };
}

export default function Oraciones() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOracion, setSelectedOracion] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const { 
    oraciones, 
    categorias, 
    oracionesByCategoria,
    oracionesFundamentales,
    isLoading,
    toggleFavorite,
    isFavorite,
    favoritos,
    isAuthenticated,
  } = useOraciones();

  const { cacheAudio } = useAudioCache();
  const { playQueue, currentItem, isMinimized, expand } = useAudioPlayer();

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

  // Play all prayers from a list starting at a specific index
  const handlePlayAll = useCallback((oracionList: typeof oraciones, startIndex = 0) => {
    const queueItems = oracionList
      .filter(o => o.audio_url) // Only include prayers with audio
      .map(oracionToQueueItem);
    
    if (queueItems.length > 0) {
      // Find the correct start index in the filtered list
      const filteredIndex = startIndex >= 0 ? 
        queueItems.findIndex((item, idx) => {
          const originalItem = oracionList.filter(o => o.audio_url)[idx];
          return originalItem?.id === oracionList[startIndex]?.id;
        }) : 0;
      
      playQueue(queueItems, Math.max(0, filteredIndex));
    }
  }, [playQueue]);

  // Handle playing a single prayer - queue ALL prayers, start from selected
  const handlePlayOracion = useCallback((oracion: typeof oraciones[0]) => {
    // Queue all prayers with audio, start from selected one
    const allWithAudio = oraciones.filter(o => o.audio_url);
    const queueItems = allWithAudio.map(oracionToQueueItem);
    const startIndex = queueItems.findIndex(item => item.id === oracion.id);
    
    if (queueItems.length > 0) {
      playQueue(queueItems, Math.max(0, startIndex));
    }
  }, [oraciones, playQueue]);

  // Check if a prayer is currently playing
  const isCurrentlyPlaying = currentItem?.type === 'oracion' && !isMinimized;

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
        tagline={selected.tagline ?? undefined}
        esFundamental={selected.es_fundamental ?? false}
        citaCelebre={selected.cita_celebre ?? undefined}
        citaAutor={selected.cita_autor ?? undefined}
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
        
        {/* Immersive Hero */}
        <OracionesHero 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearCategory={() => setActiveCategory(null)}
        />

        {/* Quick Actions */}
        <motion.div 
          className="flex gap-2 px-5 pb-5 overflow-x-auto scrollbar-hide -mt-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Play All button - only show if there are prayers with audio */}
          {oraciones.filter(o => o.audio_url).length > 0 && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="gap-2 whitespace-nowrap bg-primary/20 text-primary border-primary/30 rounded-xl h-10 hover:bg-primary/30"
              onClick={() => handlePlayAll(oraciones)}
            >
              <Play className="h-4 w-4" />
              Reproducir todas ({oraciones.filter(o => o.audio_url).length})
            </Button>
          )}
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
              Historias para Dormir
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

        {/* Content */}
        {isLoading ? (
          <div className="px-4 py-4 space-y-6">
            <CardGridSkeleton count={4} />
            <ListRowsSkeleton count={6} />
          </div>
        ) : searchQuery ? (
          // Search results
          <motion.div 
            className="p-4 space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center justify-between px-1">
              <p className="text-sm text-muted-foreground">
                {filteredOraciones.length} resultado{filteredOraciones.length !== 1 && "s"} para "{searchQuery}"
              </p>
              {filteredOraciones.filter(o => o.audio_url).length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-primary"
                  onClick={() => handlePlayAll(filteredOraciones)}
                >
                  <Play className="h-4 w-4" />
                  Reproducir todas
                </Button>
              )}
            </div>
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
                  esFundamental={oracion.es_fundamental ?? false}
                  onPlay={() => handlePlayOracion(oracion)}
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
                  <Cross className="h-10 w-10 text-muted-foreground/50" />
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-destructive" fill="currentColor" />
                <h2 className="font-heading font-semibold text-lg">Mis Favoritas</h2>
              </div>
              {favoritasOraciones.filter(o => o.audio_url).length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-primary"
                  onClick={() => handlePlayAll(favoritasOraciones)}
                >
                  <Play className="h-4 w-4" />
                  Reproducir todas
                </Button>
              )}
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
                  esFundamental={oracion.es_fundamental ?? false}
                  onPlay={() => handlePlayOracion(oracion)}
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
              className="flex items-center justify-between mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setActiveCategory(null)}
                  className="text-muted-foreground"
                >
                  ← Volver
                </Button>
                <h2 className="font-heading font-semibold text-lg">{activeCategory}</h2>
              </div>
              {displayedOraciones.filter(o => o.audio_url).length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-primary"
                  onClick={() => handlePlayAll(displayedOraciones)}
                >
                  <Play className="h-4 w-4" />
                  Reproducir todas
                </Button>
              )}
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
                    esFundamental={oracion.es_fundamental ?? false}
                    onPlay={() => handlePlayOracion(oracion)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          // Default view with Fundamental Prayers + Categories
          <ScrollArea className="h-[calc(100vh-320px)]">
            <motion.div 
              className="p-4 space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* === FUNDAMENTAL PRAYERS SECTION === */}
              {oracionesFundamentales.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Cross className="h-5 w-5 text-secondary" />
                      <h2 className="font-heading font-semibold text-lg">Oraciones Fundamentales</h2>
                    </div>
                    {oracionesFundamentales.filter(o => o.audio_url).length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-primary"
                        onClick={() => handlePlayAll(oracionesFundamentales)}
                      >
                        <Play className="h-4 w-4" />
                        Reproducir
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Las oraciones que han guiado a la humanidad por más de 2000 años
                  </p>
                  
                  {/* Grid of Fundamental Prayer Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    {oracionesFundamentales.slice(0, 4).map((oracion, idx) => (
                      <OracionFundamentalCard
                        key={oracion.id}
                        id={oracion.id}
                        nombre={oracion.nombre}
                        tagline={oracion.tagline ?? undefined}
                        audioUrl={oracion.audio_url ?? undefined}
                        isFavorite={isFavorite(oracion.id)}
                        onToggleFavorite={toggleFavorite}
                        onSelect={() => setSelectedOracion(oracion.id)}
                        onPlay={() => handlePlayOracion(oracion)}
                      />
                    ))}
                  </div>
                </motion.section>
              )}

              {/* === CATEGORY CARDS GRID === */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h2 className="font-heading font-semibold text-lg">Todas las Oraciones</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {categorias.map((categoria, idx) => {
                    const config = CATEGORY_CONFIG[categoria] || { 
                      icon: BookOpen, 
                      gradient: "from-muted to-muted/5",
                      bgClass: "bg-muted/50"
                    };
                    const Icon = config.icon;
                    const count = oracionesByCategoria[categoria]?.length || 0;
                    const hasAudio = oracionesByCategoria[categoria]?.some(o => o.audio_url);
                    
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
                          <div className={cn(
                            "p-2 rounded-xl w-fit mb-3 backdrop-blur-sm",
                            config.bgClass
                          )}>
                            <Icon className="h-5 w-5 text-foreground" />
                          </div>
                          <h3 className="font-heading font-semibold text-sm text-foreground line-clamp-2 mb-1">
                            {categoria}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {count} {count === 1 ? "oración" : "oraciones"}
                          </p>
                          {hasAudio && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                              <Play className="h-3 w-3" />
                              <span>Con audio</span>
                            </div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.section>
            </motion.div>
          </ScrollArea>
        )}

        <BottomNavigation />
      </div>
    </div>
  );
}
