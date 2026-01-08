import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDailyGospel } from '@/hooks/useDailyGospel';
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  Play,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

const DailyGospel = () => {
  const navigate = useNavigate();
  const { fecha: urlFecha } = useParams();
  const [selectedDate, setSelectedDate] = useState<string | undefined>(urlFecha);
  const [showVideo, setShowVideo] = useState(false);
  
  const { 
    gospel, 
    todayGospel,
    tomorrowGospel,
    recentGospels,
    isShowingTomorrow,
    isLoading 
  } = useDailyGospel(selectedDate);

  const displayGospel = selectedDate ? gospel : (isShowingTomorrow ? tomorrowGospel : todayGospel);
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const isViewingToday = !selectedDate || selectedDate === today;
  
  const handlePrevDay = () => {
    const currentDate = selectedDate || today;
    const prevDate = format(subDays(new Date(currentDate + 'T12:00:00'), 1), 'yyyy-MM-dd');
    setSelectedDate(prevDate);
    setShowVideo(false);
  };

  const handleNextDay = () => {
    const currentDate = selectedDate || today;
    const nextDate = format(addDays(new Date(currentDate + 'T12:00:00'), 1), 'yyyy-MM-dd');
    if (nextDate <= format(addDays(new Date(), 1), 'yyyy-MM-dd')) {
      setSelectedDate(nextDate);
      setShowVideo(false);
    }
  };

  const handleGoToToday = () => {
    setSelectedDate(undefined);
    setShowVideo(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/10">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-6 w-40" />
          </div>
        </header>
        <main className="max-w-2xl mx-auto p-4 space-y-4">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </main>
      </div>
    );
  }

  const formattedDate = displayGospel 
    ? format(new Date(displayGospel.fecha + 'T12:00:00'), "EEEE d 'de' MMMM, yyyy", { locale: es })
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/10">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver</span>
          </Button>
          
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <BookOpen className="h-5 w-5" />
            <span className="font-semibold text-foreground">Evangelio del Día</span>
          </div>
          
          <div className="w-16 sm:w-20" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Date navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={handlePrevDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <button 
            onClick={handleGoToToday}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Calendar className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium capitalize">{formattedDate}</span>
            {isShowingTomorrow && isViewingToday && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500 text-white">Mañana</span>
            )}
          </button>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNextDay}
            disabled={selectedDate === format(addDays(new Date(), 1), 'yyyy-MM-dd')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {displayGospel ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={displayGospel.fecha}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Video player */}
              <Card className="overflow-hidden border-0 shadow-lg">
                <CardContent className="p-0">
                  {!showVideo ? (
                    <motion.div 
                      className="relative aspect-video cursor-pointer group"
                      onClick={() => setShowVideo(true)}
                      whileTap={{ scale: 0.98 }}
                    >
                      <img 
                        src={`https://img.youtube.com/vi/${displayGospel.youtube_video_id}/maxresdefault.jpg`}
                        alt={displayGospel.referencia}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = `https://img.youtube.com/vi/${displayGospel.youtube_video_id}/hqdefault.jpg`;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-center justify-center">
                        <motion.div 
                          className="w-20 h-20 bg-amber-500/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl"
                          whileHover={{ scale: 1.1 }}
                          animate={{ 
                            boxShadow: ['0 0 0 0 rgba(245, 158, 11, 0.4)', '0 0 0 20px rgba(245, 158, 11, 0)', '0 0 0 0 rgba(245, 158, 11, 0.4)']
                          }}
                          transition={{ 
                            boxShadow: { duration: 2, repeat: Infinity },
                            scale: { duration: 0.2 }
                          }}
                        >
                          <Play className="w-10 h-10 text-white ml-1" fill="white" />
                        </motion.div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white font-semibold text-lg drop-shadow-lg">
                          {displayGospel.referencia}
                        </p>
                        <p className="text-white/70 text-sm">
                          Toca para reproducir
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="aspect-video"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <iframe
                        src={`https://www.youtube.com/embed/${displayGospel.youtube_video_id}?autoplay=1`}
                        title={displayGospel.referencia}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Gospel info */}
              <Card className="border-amber-200/50 dark:border-amber-800/30">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100">
                        {displayGospel.referencia}
                      </h2>
                      <p className="text-sm text-muted-foreground capitalize">
                        {formattedDate}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  {displayGospel.sacerdote && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{displayGospel.sacerdote}</span>
                    </div>
                  )}

                  {displayGospel.tiempo_liturgico && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm">
                      <Calendar className="h-3.5 w-3.5" />
                      {displayGospel.tiempo_liturgico}
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(`https://www.youtube.com/watch?v=${displayGospel.youtube_video_id}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver en YouTube
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        ) : (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold">No hay evangelio disponible</h2>
              <p className="text-muted-foreground text-sm">
                No encontramos el evangelio para esta fecha.
              </p>
              <Button onClick={handleGoToToday}>
                Ver evangelio de hoy
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent gospels */}
        {recentGospels && recentGospels.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Evangelios anteriores
            </h3>
            <div className="space-y-2">
              {recentGospels
                .filter(g => g.fecha !== displayGospel?.fecha)
                .slice(0, 5)
                .map(g => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setSelectedDate(g.fecha);
                      setShowVideo(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <img 
                      src={`https://img.youtube.com/vi/${g.youtube_video_id}/default.jpg`}
                      alt={g.referencia}
                      className="w-16 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{g.referencia}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {format(new Date(g.fecha + 'T12:00:00'), "EEEE d", { locale: es })}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DailyGospel;
