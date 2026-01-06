import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useState } from 'react';

interface Reading {
  dia: number;
  titulo: string;
  periodo?: string;
  color_periodo?: string;
}

interface ReadingCalendarProps {
  readings: Reading[];
  completedDays: number[];
  currentDay: number;
  selectedDay: number | null;
  onSelectDay: (day: number | null) => void;
}

const PERIODS = [
  { name: "Mundo Primitivo", color: "#00CED1", start: 1, end: 6 },
  { name: "Los Patriarcas", color: "#800020", start: 7, end: 30 },
  { name: "Egipto y Éxodo", color: "#FF0000", start: 31, end: 50 },
  { name: "Desierto", color: "#D2B48C", start: 51, end: 90 },
  { name: "Conquista y Jueces", color: "#228B22", start: 91, end: 120 },
  { name: "Reino Unido", color: "#800080", start: 121, end: 160 },
  { name: "Reino Dividido", color: "#2F4F4F", start: 161, end: 220 },
  { name: "Exilio", color: "#708090", start: 221, end: 260 },
  { name: "Retorno", color: "#FFD700", start: 261, end: 290 },
  { name: "Macabeos", color: "#FFA500", start: 291, end: 300 },
  { name: "Evangelios", color: "#4169E1", start: 301, end: 340 },
  { name: "Iglesia", color: "#DC143C", start: 341, end: 365 },
];

export const ReadingCalendar = ({ 
  readings, 
  completedDays, 
  currentDay, 
  selectedDay,
  onSelectDay 
}: ReadingCalendarProps) => {
  const [currentPeriodIndex, setCurrentPeriodIndex] = useState(() => {
    return PERIODS.findIndex(p => currentDay >= p.start && currentDay <= p.end);
  });

  const currentPeriod = PERIODS[currentPeriodIndex];
  const periodReadings = readings.filter(
    r => r.dia >= currentPeriod.start && r.dia <= currentPeriod.end
  );

  const goToPrevPeriod = () => {
    if (currentPeriodIndex > 0) {
      setCurrentPeriodIndex(currentPeriodIndex - 1);
    }
  };

  const goToNextPeriod = () => {
    if (currentPeriodIndex < PERIODS.length - 1) {
      setCurrentPeriodIndex(currentPeriodIndex + 1);
    }
  };

  return (
    <div className="space-y-3">
      {/* Period Navigation */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Calendario</h3>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={goToPrevPeriod}
            disabled={currentPeriodIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <span 
            className="text-xs font-medium px-2 py-1 rounded-full text-white min-w-[100px] text-center"
            style={{ backgroundColor: currentPeriod.color }}
          >
            {currentPeriod.name}
          </span>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={goToNextPeriod}
            disabled={currentPeriodIndex === PERIODS.length - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Period Pills */}
      <ScrollArea className="w-full">
        <div className="flex gap-1.5 pb-2">
          {PERIODS.map((period, index) => {
            const isActive = index === currentPeriodIndex;
            const periodCompleted = completedDays.filter(
              d => d >= period.start && d <= period.end
            ).length;
            const periodTotal = period.end - period.start + 1;
            const progress = (periodCompleted / periodTotal) * 100;
            
            return (
              <button
                key={period.name}
                onClick={() => setCurrentPeriodIndex(index)}
                className={`shrink-0 h-2 rounded-full transition-all ${
                  isActive ? 'w-8' : 'w-4'
                }`}
                style={{ 
                  backgroundColor: isActive ? period.color : `${period.color}40`,
                  boxShadow: isActive ? `0 0 8px ${period.color}60` : 'none'
                }}
                title={`${period.name}: ${periodCompleted}/${periodTotal}`}
              />
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="h-1" />
      </ScrollArea>

      {/* Days Grid - Larger touch targets */}
      <div className="glass-card rounded-xl p-3">
        <div className="grid grid-cols-7 gap-1.5">
          {periodReadings.map((r) => {
            const isCompleted = completedDays.includes(r.dia);
            const isCurrent = r.dia === currentDay;
            const isSelected = r.dia === selectedDay;
            
            return (
              <motion.button
                key={r.dia}
                whileTap={{ scale: 0.9 }}
                onClick={() => onSelectDay(r.dia === selectedDay ? null : r.dia)}
                className={`
                  min-h-[44px] min-w-[44px] rounded-xl flex flex-col items-center justify-center 
                  text-sm font-medium transition-all relative
                  ${isCompleted 
                    ? 'bg-green-500 text-white shadow-sm shadow-green-500/30' 
                    : isCurrent 
                      ? 'text-white shadow-md' 
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }
                  ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                `}
                style={isCurrent && !isCompleted ? { 
                  backgroundColor: currentPeriod.color,
                  boxShadow: `0 4px 12px ${currentPeriod.color}40`
                } : undefined}
              >
                <span className="text-sm font-semibold">{r.dia}</span>
                {isCompleted && (
                  <span className="text-[8px] opacity-80">✓</span>
                )}
              </motion.button>
            );
          })}
        </div>
        
        {/* Period info */}
        <p className="text-xs text-muted-foreground mt-3 text-center">
          {completedDays.filter(d => d >= currentPeriod.start && d <= currentPeriod.end).length} de {currentPeriod.end - currentPeriod.start + 1} días completados
        </p>
      </div>

      {/* Quick Stats */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>Completado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: currentPeriod.color }} />
          <span>Día actual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-muted" />
          <span>Pendiente</span>
        </div>
      </div>
    </div>
  );
};
