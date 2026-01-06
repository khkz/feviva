import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, CheckCircle2, Flame, ArrowLeft, Calendar, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useBiblePlan } from '@/hooks/useBiblePlan';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { YouTubePlayer } from '@/components/bible/YouTubePlayer';
import { PeriodProgress } from '@/components/bible/PeriodProgress';
import { BibleTextViewer } from '@/components/bible/BibleTextViewer';
import { BibleNotes } from '@/components/bible/BibleNotes';
import { ReadingCalendar } from '@/components/bible/ReadingCalendar';

const BiblePlan = () => {
  const navigate = useNavigate();
  const { todayReading, userProgress, allReadings, loading, markAsCompleted, progressPercentage } = useBiblePlan();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <Book className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  // Use selected day or today's reading
  const currentDayNumber = selectedDay || userProgress?.dia_actual || 1;
  const reading = selectedDay 
    ? allReadings.find(r => r.dia === selectedDay) as any
    : todayReading as any;

  const canGoBack = currentDayNumber > 1;
  const canGoForward = currentDayNumber < 365;

  const goToPreviousDay = () => {
    if (canGoBack) {
      setSelectedDay(currentDayNumber - 1);
    }
  };

  const goToNextDay = () => {
    if (canGoForward) {
      setSelectedDay(currentDayNumber + 1);
    }
  };

  const goToToday = () => {
    setSelectedDay(null);
  };

  const isViewingToday = selectedDay === null || selectedDay === userProgress?.dia_actual;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Glass Hero Header */}
      <div className="relative overflow-hidden glass-hero">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/40 via-orange-700/30 to-amber-900/40" />
        <div className="absolute inset-0 backdrop-blur-sm" />
        
        <div className="relative px-4 pt-12 pb-6">
          <button onClick={() => navigate('/dashboard')} className="mb-4 flex items-center gap-2 text-amber-200 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Volver</span>
          </button>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-2xl bg-amber-500/20 backdrop-blur-md border border-white/10">
                <Book className="w-7 h-7 text-amber-300" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">La Biblia en 365 Días</h1>
                <p className="text-amber-200/80 text-sm">The Great Adventure</p>
              </div>
            </div>
          </motion.div>

          {/* Compact Progress Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="mt-4 grid grid-cols-3 gap-2"
          >
            <div className="glass-card rounded-xl p-3 text-center">
              <Calendar className="w-4 h-4 mx-auto mb-1 text-amber-400" />
              <p className="text-xl font-bold text-foreground">{userProgress?.dias_completados.length || 0}</p>
              <p className="text-[10px] text-muted-foreground">Días leídos</p>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <Flame className="w-4 h-4 mx-auto mb-1 text-orange-400" />
              <p className="text-xl font-bold text-foreground">{userProgress?.racha_actual || 0}</p>
              <p className="text-[10px] text-muted-foreground">Racha</p>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <BookOpen className="w-4 h-4 mx-auto mb-1 text-amber-400" />
              <p className="text-xl font-bold text-foreground">{progressPercentage}%</p>
              <p className="text-[10px] text-muted-foreground">Completado</p>
            </div>
          </motion.div>

          <div className="mt-3">
            <Progress value={progressPercentage} className="h-1.5 bg-white/20" />
          </div>
        </div>
      </div>

      {/* Period Progress - Optimized for touch */}
      <div className="px-4 py-3">
        <PeriodProgress 
          currentDay={currentDayNumber} 
          completedDays={userProgress?.dias_completados || []} 
        />
      </div>

      {/* Day Navigation */}
      <div className="px-4 mb-3">
        <div className="flex items-center justify-between glass-card rounded-xl p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousDay}
            disabled={!canGoBack}
            className="h-10 w-10 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="text-center flex-1">
            <p className="text-xs text-muted-foreground">
              {isViewingToday ? 'Lectura de hoy' : 'Navegando'}
            </p>
            <p className="font-semibold">Día {currentDayNumber} de 365</p>
            {!isViewingToday && (
              <button 
                onClick={goToToday}
                className="text-xs text-primary hover:underline mt-0.5"
              >
                Volver a hoy
              </button>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextDay}
            disabled={!canGoForward}
            className="h-10 w-10 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Today's Reading */}
      <AnimatePresence mode="wait">
        {reading && (
          <motion.div 
            key={reading.dia}
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="px-4 space-y-4"
          >
            {/* Video & Title Card */}
            <div className="glass-card rounded-2xl p-4 border border-amber-500/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {reading.periodo && (
                    <span 
                      className="text-xs font-medium px-2.5 py-1 rounded-full text-white"
                      style={{ backgroundColor: reading.color_periodo || '#666' }}
                    >
                      {reading.periodo}
                    </span>
                  )}
                </div>
                {userProgress?.dias_completados.includes(reading.dia) && (
                  <div className="flex items-center gap-1.5 text-green-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-medium">Completado</span>
                  </div>
                )}
              </div>
              
              <h2 className="text-lg font-bold text-foreground mb-4">{reading.titulo}</h2>
              
              {/* YouTube Video - Enhanced for mobile */}
              <YouTubePlayer 
                videoId={reading.youtube_video_id} 
                dia={reading.dia} 
              />
            </div>

            {/* Bible Readings - Glass cards */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground px-1">📖 Lecturas de hoy</h3>
              {reading.lectura_1 && (
                <BibleTextViewer reference={reading.lectura_1} label="Lectura principal" />
              )}
              {reading.lectura_2 && (
                <BibleTextViewer reference={reading.lectura_2} label="Salmo/Proverbio" />
              )}
            </div>

            {/* Notes - Glass card */}
            <BibleNotes dia={reading.dia} />

            {/* Mark as Complete - FAB style button */}
            {!userProgress?.dias_completados.includes(reading.dia) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button 
                  onClick={() => markAsCompleted(reading.dia)}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25 h-12 text-base"
                  size="lg"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Marcar día {reading.dia} como completado
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reading Calendar - Optimized grid */}
      <div className="px-4 mt-6">
        <ReadingCalendar
          readings={allReadings}
          completedDays={userProgress?.dias_completados || []}
          currentDay={userProgress?.dia_actual || 1}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
        />
      </div>

      <BottomNavigation />
    </div>
  );
};

export default BiblePlan;
