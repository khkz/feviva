import { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import bibleFallback from '@/assets/feature-bible.jpg';

interface YouTubePlayerProps {
  videoId?: string | null;
  dia: number;
  channelUrl?: string;
}

export const YouTubePlayer = ({ videoId, dia, channelUrl = "https://www.youtube.com/@LaBibliaEn365Dias/videos" }: YouTubePlayerProps) => {
  const [showVideo, setShowVideo] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!videoId) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <motion.div 
          className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Play className="w-10 h-10 text-primary" />
        </motion.div>
        <h3 className="font-semibold mb-2 text-base">Video del Día {dia}</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Escucha la lectura y reflexión de Fray Sergio Serrano, OP
        </p>
        <Button variant="outline" asChild className="h-11 px-6">
          <a 
            href={channelUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Ver en YouTube
          </a>
        </Button>
      </div>
    );
  }

  if (!showVideo) {
    return (
      <motion.div 
        className="relative aspect-video bg-muted rounded-xl overflow-hidden cursor-pointer group"
        onClick={() => setShowVideo(true)}
        whileTap={{ scale: 0.98 }}
      >
        <img 
          src={
            imageError
              ? bibleFallback
              : `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
          }
          alt={`Video del día ${dia}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src.includes('maxresdefault')) {
              target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            } else {
              setImageError(true);
            }
          }}
        />
        {/* Glass overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-center justify-center">
          <motion.div 
            className="w-20 h-20 bg-red-600/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl border-2 border-white/20"
            whileHover={{ scale: 1.1 }}
            animate={{ 
              boxShadow: ['0 0 0 0 rgba(220, 38, 38, 0.4)', '0 0 0 20px rgba(220, 38, 38, 0)', '0 0 0 0 rgba(220, 38, 38, 0.4)']
            }}
            transition={{ 
              boxShadow: { duration: 2, repeat: Infinity },
              scale: { duration: 0.2 }
            }}
          >
            <Play className="w-10 h-10 text-white ml-1" fill="white" />
          </motion.div>
        </div>
        {/* Day info with better readability */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white font-semibold text-base drop-shadow-lg">
            Día {dia} - La Biblia en 365 Días
          </p>
          <p className="text-white/70 text-xs mt-0.5">
            Toca para reproducir
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="aspect-video rounded-xl overflow-hidden shadow-lg"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title={`Video del día ${dia}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </motion.div>
  );
};
