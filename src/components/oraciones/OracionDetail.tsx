import { useState } from "react";
import { X, Heart, Play, Pause, Volume2, Info, Loader2, Share2, ChevronUp, ChevronDown, Cross, Quote, ListPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useOracionAudio } from "@/hooks/useOracionAudio";
import { ShareModal } from "@/components/shared/ShareModal";
import { AmbientSoundMixer } from "@/components/sleep/AmbientSoundMixer";
import { AddToPlaylistButton } from "@/components/audio/AddToPlaylistButton";
import { cn } from "@/lib/utils";

// Import images for header backgrounds
import padreNuestroImg from "@/assets/oracion-padre-nuestro.jpg";
import aveMariaImg from "@/assets/oracion-ave-maria.jpg";
import gloriaImg from "@/assets/oracion-gloria.jpg";
import credoImg from "@/assets/oracion-credo.jpg";

interface OracionDetailProps {
  id: string;
  nombre: string;
  texto: string;
  categoria: string;
  historia?: string;
  audioUrl?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onClose: () => void;
  // New enhanced props
  tagline?: string;
  esFundamental?: boolean;
  citaCelebre?: string;
  citaAutor?: string;
}

// Map prayer names to their images
function getPrayerImage(nombre: string): string | null {
  const normalizedName = nombre.toLowerCase();
  
  if (normalizedName.includes("padre nuestro")) return padreNuestroImg;
  if (normalizedName.includes("ave") && normalizedName.includes("mar")) return aveMariaImg;
  if (normalizedName.includes("gloria")) return gloriaImg;
  if (normalizedName.includes("credo")) return credoImg;
  
  return null;
}

export function OracionDetail({
  id,
  nombre,
  texto,
  categoria,
  historia,
  audioUrl: existingAudioUrl,
  isFavorite = false,
  onToggleFavorite,
  onClose,
  tagline,
  esFundamental = false,
  citaCelebre,
  citaAutor,
}: OracionDetailProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.5);
  const [showAmbient, setShowAmbient] = useState(false);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");
  
  const {
    isGenerating,
    isPlaying,
    progress,
    toggle,
    hasAudio,
  } = useOracionAudio({
    oracionId: id,
    nombre,
    texto,
    existingAudioUrl,
  });

  const headerImage = getPrayerImage(nombre);
  const hasHeaderImage = !!headerImage && esFundamental;

  // Font size classes - using serif for solemn feel
  const fontSizeClasses = {
    normal: "text-lg leading-relaxed",
    large: "text-xl leading-relaxed",
    xlarge: "text-2xl leading-loose",
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 bg-background flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Ambient background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-radial from-secondary/10 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-gradient-radial from-primary/5 via-transparent to-transparent rounded-full blur-2xl" />
      </div>

      {/* Header with Image (for fundamental prayers) */}
      {hasHeaderImage ? (
        <motion.header 
          className="relative z-10 h-48 lg:h-56 overflow-hidden"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${headerImage})` }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-background" />
          
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white"
            >
              <X className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowShareModal(true)}
                className="rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white"
              >
                <Share2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20",
                  isFavorite ? "text-destructive" : "text-white"
                )}
                onClick={onToggleFavorite}
              >
                <Heart 
                  className="h-5 w-5" 
                  fill={isFavorite ? "currentColor" : "none"}
                />
              </Button>
            </div>
          </div>
          
          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
            {/* Fundamental Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-secondary/90 text-secondary-foreground mb-3 backdrop-blur-sm">
              <Cross className="h-3 w-3" />
              Oración Fundamental
            </span>
            
            <h1 className="font-heading text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">
              {nombre}
            </h1>
            {tagline && (
              <p className="text-white/80 text-sm mt-1 drop-shadow-md">
                {tagline}
              </p>
            )}
          </div>
        </motion.header>
      ) : (
        // Standard Header (for non-fundamental prayers)
        <motion.header 
          className="relative z-10 flex items-center justify-between p-4 border-b border-border/50 bg-background/80 backdrop-blur-md"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className="text-center flex-1 px-4">
            <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
              {categoria}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowShareModal(true)}
              className="rounded-full"
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("rounded-full", isFavorite && "text-destructive")}
              onClick={onToggleFavorite}
            >
              <Heart 
                className="h-5 w-5" 
                fill={isFavorite ? "currentColor" : "none"}
              />
            </Button>
          </div>
        </motion.header>
      )}

      {/* Title (for non-image headers) */}
      {!hasHeaderImage && (
        <motion.div 
          className="relative z-10 p-6 pb-4 text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {nombre}
          </h1>
          {tagline && (
            <p className="text-muted-foreground text-sm mt-1">
              {tagline}
            </p>
          )}
        </motion.div>
      )}

      {/* Content */}
      <ScrollArea className="flex-1 relative z-10">
        <motion.div 
          className="px-6 pb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="max-w-lg mx-auto">
            {/* Famous Quote (for fundamental prayers) */}
            {citaCelebre && citaAutor && (
              <motion.div
                className="mb-8 p-4 rounded-2xl bg-secondary/10 border border-secondary/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Quote className="h-5 w-5 text-secondary mb-2" />
                <p className="text-foreground italic leading-relaxed">
                  "{citaCelebre}"
                </p>
                <p className="text-sm text-muted-foreground mt-2 font-medium">
                  — {citaAutor}
                </p>
              </motion.div>
            )}

            {/* Font size controls */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-xs text-muted-foreground">Tamaño:</span>
              {(["normal", "large", "xlarge"] as const).map((size) => (
                <Button
                  key={size}
                  variant={fontSize === size ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={() => setFontSize(size)}
                >
                  <span className={cn(
                    size === "normal" && "text-xs",
                    size === "large" && "text-sm",
                    size === "xlarge" && "text-base"
                  )}>A</span>
                </Button>
              ))}
            </div>
            
            {/* Prayer text - formatted for reading with serif font for solemnity */}
            <div className={cn(
              "prose prose-lg dark:prose-invert max-w-none",
              "text-center font-serif",
              fontSizeClasses[fontSize]
            )}>
              {texto.split('\n').map((line, i) => (
                <p 
                  key={i} 
                  className={cn(
                    "text-foreground mb-4",
                    fontSizeClasses[fontSize],
                    !line.trim() && "h-4"
                  )}
                >
                  {line || "\u00A0"}
                </p>
              ))}
            </div>

            {/* History section */}
            {historia && (
              <motion.div 
                className="mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between gap-2 rounded-xl"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Historia de esta oración
                  </div>
                  {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                
                <AnimatePresence>
                  {showHistory && (
                    <motion.div 
                      className="mt-3 p-4 bg-muted/50 rounded-xl"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {historia}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Ambient Sound Section */}
            <motion.div 
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between gap-2 rounded-xl mb-3"
                onClick={() => setShowAmbient(!showAmbient)}
              >
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Sonidos Ambientales
                </div>
                {showAmbient ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>

              <AnimatePresence>
                {showAmbient && (
                  <motion.div 
                    className="p-4 bg-muted/30 rounded-xl"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <AmbientSoundMixer isPlaying={true} masterVolume={masterVolume} />
                    
                    <div className="mt-4 flex items-center gap-3">
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                      <Slider
                        value={[masterVolume]}
                        max={1}
                        step={0.1}
                        onValueChange={(value) => setMasterVolume(value[0])}
                        className="flex-1"
                      />
                      <span className="text-xs text-muted-foreground w-8 text-right">
                        {Math.round(masterVolume * 100)}%
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </ScrollArea>

      {/* Audio Controls - Floating */}
      <motion.div 
        className="relative z-10 p-4 border-t border-border/50 bg-background/80 backdrop-blur-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="max-w-lg mx-auto">
          {/* Add to Routine Button */}
          <div className="flex justify-center mb-4">
            <AddToPlaylistButton
              item={{
                id,
                title: nombre,
                subtitle: categoria,
                audioUrl: existingAudioUrl || null,
                type: 'oracion',
              }}
              variant="full"
            />
          </div>
          {/* Progress bar */}
          <AnimatePresence>
            {(isPlaying || progress > 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Progress value={progress} className="h-1 mb-4 rounded-full" />
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex items-center justify-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className={cn(
                  "h-16 w-16 rounded-full shadow-lg",
                  "bg-gradient-to-br from-primary to-primary-hover",
                  "hover:shadow-xl hover:shadow-primary/20"
                )}
                onClick={toggle}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="h-7 w-7 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-7 w-7" />
                ) : (
                  <Play className="h-7 w-7 ml-1" />
                )}
              </Button>
            </motion.div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-foreground">
                {isGenerating 
                  ? "Generando audio..." 
                  : isPlaying 
                    ? "Reproduciendo" 
                    : hasAudio 
                      ? "Escuchar oración" 
                      : "Generar y escuchar"}
              </span>
              <span className="text-xs text-muted-foreground">
                Audio narrado
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={nombre}
        text={texto}
        reference={categoria}
      />
    </motion.div>
  );
}
