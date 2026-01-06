import { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface YouTubePlayerProps {
  videoId?: string | null;
  dia: number;
  channelUrl?: string;
}

export const YouTubePlayer = ({ videoId, dia, channelUrl = "https://www.youtube.com/@LaBibliaEn365Dias/videos" }: YouTubePlayerProps) => {
  const [showVideo, setShowVideo] = useState(false);

  if (!videoId) {
    return (
      <div className="bg-muted/50 rounded-xl p-6 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Play className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-semibold mb-2">Video del Día {dia}</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Escucha la lectura y reflexión de Fray Sergio Serrano, OP
        </p>
        <Button variant="outline" asChild>
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
      <div 
        className="relative aspect-video bg-muted rounded-xl overflow-hidden cursor-pointer group"
        onClick={() => setShowVideo(true)}
      >
        <img 
          src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
          alt={`Video del día ${dia}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          }}
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-8 h-8 text-white ml-1" fill="white" />
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-white text-sm font-medium drop-shadow-lg">
            Día {dia} - La Biblia en 365 Días
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-xl overflow-hidden">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title={`Video del día ${dia}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
};
