import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface MusicVideoCardProps {
  videoId: string;
  title: string;
  description: string;
  duration?: string;
  index?: number;
}

export function MusicVideoCard({ 
  videoId, 
  title, 
  description, 
  duration,
  index = 0 
}: MusicVideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-2xl bg-card border border-border/50"
    >
      {/* Video Container */}
      <div className="relative aspect-video overflow-hidden">
        {isPlaying ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <>
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                // Fallback to hqdefault if maxresdefault doesn't exist
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Play Button */}
            <button
              onClick={() => setIsPlaying(true)}
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                "transition-all duration-300"
              )}
              aria-label={`Reproducir ${title}`}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "w-16 h-16 md:w-20 md:h-20 rounded-full",
                  "bg-primary/90 backdrop-blur-sm",
                  "flex items-center justify-center",
                  "shadow-lg shadow-primary/30",
                  "group-hover:bg-primary transition-colors"
                )}
              >
                <Play className="w-7 h-7 md:w-8 md:h-8 text-primary-foreground ml-1" fill="currentColor" />
              </motion.div>
            </button>

            {/* Duration Badge */}
            {duration && (
              <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm">
                <span className="text-xs text-white font-medium">{duration}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Info */}
      <div className="p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <Music className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
