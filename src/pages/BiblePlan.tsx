import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, CheckCircle2, Flame, ArrowLeft, Calendar, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useBiblePlan } from '@/hooks/useBiblePlan';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';
import { YouTubePlayer } from '@/components/bible/YouTubePlayer';
import { PeriodProgress } from '@/components/bible/PeriodProgress';
import { BibleTextViewer } from '@/components/bible/BibleTextViewer';
import { BibleNotes } from '@/components/bible/BibleNotes';
import { ReadingCalendar } from '@/components/bible/ReadingCalendar';
import { ReminderButton } from '@/components/shared/ReminderButton';

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
    <div className="min-h-screen bg-background">
      <DesktopSidebar />
      
      <div className="lg:ml-64 pb-24 lg:pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Glass Hero Header - Compact on desktop */}
          <div className="relative overflow-hidden glass-hero">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/40 via-orange-700/30 to-amber-900/40" />
            <div className="absolute inset-0 backdrop-blur-sm" />
            
            <div className="relative px-4 lg:px-6 pt-12 lg:pt-6 pb-4 lg:pb-4">
              <button onClick={() => navigate('/dashboard')} className="mb-3 lg:mb-2 flex items-center gap-2 text-amber-200 hover:text-white transition-colors lg:hidden">
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm">Volver</span>
              </button>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 lg:p-2 rounded-xl bg-amber-500/20 backdrop-blur-md border border-white/10">
                      <Book className="w-6 h-6 lg:w-5 lg:h-5 text-amber-300" />
                    </div>
                    <div>
                      <h1 className="text-lg lg:text-xl font-bold text-white">La Biblia en 365 Días</h1>
                      <p className="text-amber-200/80 text-xs lg:text-sm">The Great Adventure</p>
                    </div>
                  </div>
                  <ReminderButton practice="biblia" className="text-white hover:bg-white/10" />
                </div>
              </motion.div>

              {/* Compact Progress Stats - Row layout on desktop */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 }}
                className="mt-3 grid grid-cols-3 gap-2 max-w-md lg:max-w-sm"
              >
                <div className="glass-card rounded-lg p-2 lg:p-2 text-center">
                  <Calendar className="w-3.5 h-3.5 mx-auto mb-0.5 text-amber-400" />
                  <p className="text-lg lg:text-base font-bold text-foreground">{userProgress?.dias_completados.length || 0}</p>
                  <p className="text-[9px] lg:text-[10px] text-muted-foreground">Días</p>
                </div>
                <div className="glass-card rounded-lg p-2 lg:p-2 text-center">
                  <Flame className="w-3.5 h-3.5 mx-auto mb-0.5 text-orange-400" />
                  <p className="text-lg lg:text-base font-bold text-foreground">{userProgress?.racha_actual || 0}</p>
                  <p className="text-[9px] lg:text-[10px] text-muted-foreground">Racha</p>
                </div>
                <div className="glass-card rounded-lg p-2 lg:p-2 text-center">
                  <BookOpen className="w-3.5 h-3.5 mx-auto mb-0.5 text-amber-400" />
                  <p className="text-lg lg:text-base font-bold text-foreground">{progressPercentage}%</p>
                  <p className="text-[9px] lg:text-[10px] text-muted-foreground">Avance</p>
                </div>
              </motion.div>

              <div className="mt-2 max-w-md lg:max-w-sm">
                <Progress value={progressPercentage} className="h-1 bg-white/20" />
              </div>
            </div>
          </div>

          {/* Period Progress */}
          <div className="px-4 lg:px-6 py-3 lg:py-2">
            <PeriodProgress 
              currentDay={currentDayNumber} 
              completedDays={userProgress?.dias_completados || []} 
            />
          </div>

          {/* Day Navigation - Compact */}
          <div className="px-4 lg:px-6 mb-3 lg:mb-4">
            <div className="flex items-center justify-between glass-card rounded-xl p-2 max-w-xl">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousDay}
                disabled={!canGoBack}
                className="h-8 w-8 lg:h-9 lg:w-9 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="text-center flex-1">
                <p className="text-[10px] lg:text-xs text-muted-foreground">
                  {isViewingToday ? 'Lectura de hoy' : 'Navegando'}
                </p>
                <p className="font-semibold text-sm lg:text-base">Día {currentDayNumber} de 365</p>
                {!isViewingToday && (
                  <button 
                    onClick={goToToday}
                    className="text-[10px] lg:text-xs text-primary hover:underline"
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
                className="h-8 w-8 lg:h-9 lg:w-9 rounded-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Main Content - 2 Column Layout on Desktop */}
          <div className="px-4 lg:px-6">
            <div className="lg:grid lg:grid-cols-3 lg:gap-6">
              {/* Main Column */}
              <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  {reading && (
                    <motion.div 
                      key={reading.dia}
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
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
                        
                        {/* YouTube Video - Contained size on desktop */}
                        <div className="max-w-2xl">
                          <YouTubePlayer 
                            videoId={reading.youtube_video_id} 
                            dia={reading.dia} 
                          />
                        </div>
                      </div>

                      {/* Bible Readings */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-muted-foreground px-1">📖 Lecturas de hoy</h3>
                        {reading.lectura_1 && (
                          <BibleTextViewer reference={reading.lectura_1} label="Lectura principal" />
                        )}
                        {reading.lectura_2 && (
                          <BibleTextViewer reference={reading.lectura_2} label="Salmo/Proverbio" />
                        )}
                      </div>

                      {/* Notes - Only show on mobile, moved to sidebar on desktop */}
                      <div className="lg:hidden">
                        <BibleNotes dia={reading.dia} />
                      </div>

                      {/* Mark as Complete */}
                      {!userProgress?.dias_completados.includes(reading.dia) && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <Button 
                            onClick={() => markAsCompleted(reading.dia)}
                            className="w-full lg:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25 h-11 text-sm lg:text-base"
                            size="lg"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Marcar día {reading.dia} como completado
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Reading Calendar - Below content on mobile, hidden on desktop sidebar */}
                <div className="mt-6 lg:hidden">
                  <ReadingCalendar
                    readings={allReadings}
                    completedDays={userProgress?.dias_completados || []}
                    currentDay={userProgress?.dia_actual || 1}
                    selectedDay={selectedDay}
                    onSelectDay={setSelectedDay}
                  />
                </div>
              </div>

              {/* Sidebar Column - Desktop only */}
              <div className="hidden lg:block lg:col-span-1 space-y-4">
                {reading && <BibleNotes dia={reading.dia} />}
                
                <ReadingCalendar
                  readings={allReadings}
                  completedDays={userProgress?.dias_completados || []}
                  currentDay={userProgress?.dia_actual || 1}
                  selectedDay={selectedDay}
                  onSelectDay={setSelectedDay}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default BiblePlan;
