import { motion } from 'framer-motion';
import { Book, CheckCircle2, Flame, ArrowLeft, Calendar, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBiblePlan } from '@/hooks/useBiblePlan';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { YouTubePlayer } from '@/components/bible/YouTubePlayer';
import { PeriodProgress } from '@/components/bible/PeriodProgress';
import { BibleTextViewer } from '@/components/bible/BibleTextViewer';
import { BibleNotes } from '@/components/bible/BibleNotes';

const BiblePlan = () => {
  const navigate = useNavigate();
  const { todayReading, userProgress, allReadings, loading, markAsCompleted, progressPercentage } = useBiblePlan();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <Book className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  const reading = todayReading as any; // Extended type with new fields

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950/20 via-background to-background pb-24">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/30 to-orange-700/20" />
        <div className="relative px-4 pt-12 pb-8">
          <button onClick={() => navigate('/dashboard')} className="mb-4 flex items-center gap-2 text-amber-200">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-2xl bg-amber-500/20 backdrop-blur">
                <Book className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">La Biblia en 365 Días</h1>
                <p className="text-amber-200/80">The Great Adventure</p>
              </div>
            </div>
          </motion.div>

          {/* Progress Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="mt-6 grid grid-cols-3 gap-3"
          >
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <Calendar className="w-5 h-5 mx-auto mb-1 text-amber-400" />
              <p className="text-2xl font-bold text-white">{userProgress?.dias_completados.length || 0}</p>
              <p className="text-xs text-amber-200/70">Días leídos</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <Flame className="w-5 h-5 mx-auto mb-1 text-orange-400" />
              <p className="text-2xl font-bold text-white">{userProgress?.racha_actual || 0}</p>
              <p className="text-xs text-amber-200/70">Racha</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <BookOpen className="w-5 h-5 mx-auto mb-1 text-amber-400" />
              <p className="text-2xl font-bold text-white">{progressPercentage}%</p>
              <p className="text-xs text-amber-200/70">Completado</p>
            </div>
          </motion.div>

          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2 bg-white/20" />
          </div>
        </div>
      </div>

      {/* Period Progress */}
      <div className="px-4 py-4">
        <PeriodProgress 
          currentDay={userProgress?.dia_actual || 1} 
          completedDays={userProgress?.dias_completados || []} 
        />
      </div>

      {/* Today's Reading */}
      {reading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="px-4 space-y-4"
        >
          {/* Period Badge & Title */}
          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border-amber-500/20 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full">
                  Día {reading.dia} de 365
                </span>
                {reading.periodo && (
                  <span 
                    className="text-xs font-medium px-2 py-1 rounded-full text-white"
                    style={{ backgroundColor: reading.color_periodo || '#666' }}
                  >
                    {reading.periodo}
                  </span>
                )}
              </div>
              {userProgress?.dias_completados.includes(reading.dia) && (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
            </div>
            
            <h2 className="text-xl font-bold text-foreground mb-4">{reading.titulo}</h2>
            
            {/* YouTube Video */}
            <YouTubePlayer 
              videoId={reading.youtube_video_id} 
              dia={reading.dia} 
            />
          </Card>

          {/* Bible Readings */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">📖 Lecturas de hoy</h3>
            {reading.lectura_1 && (
              <BibleTextViewer reference={reading.lectura_1} label="Lectura principal" />
            )}
            {reading.lectura_2 && (
              <BibleTextViewer reference={reading.lectura_2} label="Salmo/Proverbio" />
            )}
          </div>

          {/* Notes */}
          <BibleNotes dia={reading.dia} />

          {/* Mark as Complete */}
          {!userProgress?.dias_completados.includes(reading.dia) && (
            <Button 
              onClick={() => markAsCompleted(reading.dia)}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              size="lg"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Marcar día {reading.dia} como completado
            </Button>
          )}
        </motion.div>
      )}

      {/* Reading Calendar */}
      <div className="px-4 mt-6">
        <h3 className="text-lg font-semibold mb-3">Calendario de Lectura</h3>
        <ScrollArea className="h-48">
          <div className="grid grid-cols-10 gap-1">
            {allReadings.slice(0, 50).map((r) => {
              const isCompleted = userProgress?.dias_completados.includes(r.dia);
              const isCurrent = r.dia === userProgress?.dia_actual;
              
              return (
                <motion.button
                  key={r.dia}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    aspect-square rounded flex items-center justify-center text-[10px] font-medium transition-colors
                    ${isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isCurrent 
                        ? 'bg-amber-500 text-white ring-2 ring-amber-300' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }
                  `}
                >
                  {r.dia}
                </motion.button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            {allReadings.length} días en el plan
          </p>
        </ScrollArea>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default BiblePlan;
