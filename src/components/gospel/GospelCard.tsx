import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Play, Calendar, ChevronRight, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDailyGospel, DailyGospel } from '@/hooks/useDailyGospel';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import gospelFallback from '@/assets/feature-bible.jpg';
import { DailyShareButton } from '@/components/shared/DailyShareButton';

interface GospelCardProps {
  gospel?: DailyGospel | null;
  title?: string;
  subtitle?: string;
  compact?: boolean;
  variant?: "default" | "featured";
}

export const GospelCard = ({ gospel: propGospel, title, subtitle, compact = false, variant = "default" }: GospelCardProps) => {
  const navigate = useNavigate();
  const { activeGospel, isShowingTomorrow, isLoading } = useDailyGospel();
  const [imageError, setImageError] = useState(false);
  
  const gospel = propGospel ?? activeGospel;
  
  const defaultTitle = isShowingTomorrow ? 'Evangelio de Mañana' : 'Evangelio de Hoy';
  const displayTitle = title || defaultTitle;
  const displaySubtitle = subtitle || (isShowingTomorrow ? 'Prepárate para mañana' : 'Reflexión del día litúrgico');
  
  const isFeatured = variant === "featured";

  if (isLoading && !propGospel) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!gospel) {
    return null;
  }

  const formattedDate = format(new Date(gospel.fecha + 'T12:00:00'), "EEEE d 'de' MMMM", { locale: es });

  if (compact) {
    return (
      <motion.button
        onClick={() => navigate('/evangelio')}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 transition-all text-left group border border-amber-200/30 dark:border-amber-800/30"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground truncate">{displayTitle}</p>
          <p className="text-xs text-muted-foreground truncate">{gospel.referencia}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 transition-colors shrink-0" />
      </motion.button>
    );
  }

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
      <CardContent className="p-0">
        {/* Thumbnail */}
        <motion.div 
          className="relative cursor-pointer group aspect-video"
          onClick={() => navigate('/evangelio')}
          whileTap={{ scale: 0.98 }}
        >
          <img 
            src={
              !gospel.youtube_video_id || imageError
                ? gospelFallback
                : `https://img.youtube.com/vi/${gospel.youtube_video_id}/maxresdefault.jpg`
            }
            alt={gospel.referencia}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onLoad={(e) => {
              const target = e.currentTarget;
              if (target.naturalWidth <= 120) {
                setImageError(true);
              }
            }}
            onError={(e) => {
              const target = e.currentTarget;
              if (gospel.youtube_video_id && target.src.includes('maxresdefault')) {
                target.src = `https://img.youtube.com/vi/${gospel.youtube_video_id}/hqdefault.jpg`;
              } else {
                setImageError(true);
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-center justify-center">
            <motion.div 
              className="w-16 h-16 bg-amber-500/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl"
              whileHover={{ scale: 1.1 }}
            >
              <Play className="w-8 h-8 text-white ml-1" fill="white" />
            </motion.div>
          </div>
          
          {/* Badge */}
          {isShowingTomorrow && !propGospel && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500 text-white text-xs font-medium flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              Mañana
            </div>
          )}
          
          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-white font-semibold drop-shadow-lg text-lg">
              {gospel.referencia}
            </p>
            <p className="text-white/80 text-sm capitalize">
              {formattedDate}
            </p>
          </div>
        </motion.div>
        
        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-semibold text-amber-900 dark:text-amber-100">{displayTitle}</h3>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {displaySubtitle}
          </p>
          
          {gospel.sacerdote && (
            <p className="text-xs text-muted-foreground">
              👤 {gospel.sacerdote}
            </p>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate('/evangelio')}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              Ver Reflexión
            </Button>
            <DailyShareButton 
              tipo="evangelio"
              title=""
              fallbackText={`📖 Evangelio de hoy: ${gospel.referencia}. ¡Reflexiona con nosotros en ElRugido!`}
              variant="outline"
              size="default"
              className="px-3"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
