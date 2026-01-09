import { motion } from "framer-motion";
import { Play, Heart, Cross, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Import images
import padreNuestroImg from "@/assets/oracion-padre-nuestro.jpg";
import aveMariaImg from "@/assets/oracion-ave-maria.jpg";
import gloriaImg from "@/assets/oracion-gloria.jpg";
import credoImg from "@/assets/oracion-credo.jpg";

interface OracionFundamentalCardProps {
  id: string;
  nombre: string;
  tagline?: string;
  audioUrl?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onSelect?: () => void;
}

// Map prayer names to their images
const PRAYER_IMAGES: Record<string, string> = {
  "padre nuestro": padreNuestroImg,
  "ave maria": aveMariaImg,
  "avemaría": aveMariaImg,
  "gloria": gloriaImg,
  "credo": credoImg,
};

// Get the appropriate image for a prayer
function getPrayerImage(nombre: string): string {
  const normalizedName = nombre.toLowerCase();
  
  for (const [key, image] of Object.entries(PRAYER_IMAGES)) {
    if (normalizedName.includes(key)) {
      return image;
    }
  }
  
  return padreNuestroImg; // Default fallback
}

export function OracionFundamentalCard({
  id,
  nombre,
  tagline,
  audioUrl,
  isFavorite = false,
  onToggleFavorite,
  onSelect,
}: OracionFundamentalCardProps) {
  const imageSrc = getPrayerImage(nombre);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(id);
  };

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-2xl cursor-pointer",
        "h-48 lg:h-56",
        "group"
      )}
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundImage: `url(${imageSrc})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
      
      {/* Badge */}
      <div className="absolute top-3 left-3">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/90 text-secondary-foreground backdrop-blur-sm">
          <Cross className="h-3 w-3" />
          Fundamental
        </span>
      </div>
      
      {/* Favorite Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-3 right-3 h-8 w-8 rounded-full",
          "bg-white/10 backdrop-blur-sm hover:bg-white/20",
          isFavorite 
            ? "text-destructive" 
            : "text-white hover:text-destructive"
        )}
        onClick={handleFavorite}
      >
        <Heart 
          className="h-4 w-4" 
          fill={isFavorite ? "currentColor" : "none"}
        />
      </Button>
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="font-heading text-lg font-bold text-white mb-1 line-clamp-1 drop-shadow-lg">
          {nombre}
        </h3>
        {tagline && (
          <p className="text-sm text-white/80 line-clamp-2 mb-3 drop-shadow-md">
            {tagline}
          </p>
        )}
        
        {/* Play indicator */}
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center justify-center",
            "h-10 w-10 rounded-full",
            "bg-primary text-primary-foreground",
            "shadow-lg shadow-primary/30",
            "group-hover:shadow-xl group-hover:shadow-primary/40 transition-shadow"
          )}>
            <Play className="h-5 w-5 ml-0.5" />
          </div>
          <span className="text-sm text-white/80 font-medium">
            Rezar ahora
          </span>
        </div>
      </div>
      
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/20 via-transparent to-transparent" />
      </div>
    </motion.div>
  );
}
