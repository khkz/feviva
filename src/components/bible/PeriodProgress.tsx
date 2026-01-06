import { motion } from 'framer-motion';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface Period {
  name: string;
  color: string;
  daysRange: [number, number];
}

const PERIODS: Period[] = [
  { name: "Mundo Primitivo", color: "#00CED1", daysRange: [1, 6] },
  { name: "Los Patriarcas", color: "#800020", daysRange: [7, 30] },
  { name: "Egipto y Éxodo", color: "#FF0000", daysRange: [31, 50] },
  { name: "Desierto", color: "#D2B48C", daysRange: [51, 90] },
  { name: "Conquista y Jueces", color: "#228B22", daysRange: [91, 120] },
  { name: "Reino Unido", color: "#800080", daysRange: [121, 160] },
  { name: "Reino Dividido", color: "#2F4F4F", daysRange: [161, 220] },
  { name: "Exilio", color: "#708090", daysRange: [221, 260] },
  { name: "Retorno", color: "#FFD700", daysRange: [261, 290] },
  { name: "Macabeos", color: "#FFA500", daysRange: [291, 300] },
  { name: "Evangelios", color: "#4169E1", daysRange: [301, 340] },
  { name: "Iglesia", color: "#DC143C", daysRange: [341, 365] },
];

interface PeriodProgressProps {
  currentDay: number;
  completedDays: number[];
}

export const PeriodProgress = ({ currentDay, completedDays }: PeriodProgressProps) => {
  const getCurrentPeriod = () => {
    return PERIODS.find(p => currentDay >= p.daysRange[0] && currentDay <= p.daysRange[1]);
  };

  const currentPeriod = getCurrentPeriod();
  const currentPeriodIndex = PERIODS.findIndex(p => p === currentPeriod);

  return (
    <div className="space-y-3">
      {/* Current Period Badge */}
      {currentPeriod && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <span className="text-xs text-muted-foreground">Período:</span>
          <span 
            className="font-semibold text-sm px-3 py-1 rounded-full text-white shadow-sm"
            style={{ backgroundColor: currentPeriod.color }}
          >
            {currentPeriod.name}
          </span>
          <span className="text-xs text-muted-foreground">
            (Día {currentDay - currentPeriod.daysRange[0] + 1} de {currentPeriod.daysRange[1] - currentPeriod.daysRange[0] + 1})
          </span>
        </motion.div>
      )}
      
      {/* Progress Bar - Larger touch target */}
      <div className="flex gap-0.5 h-4 rounded-full overflow-hidden glass-card p-0.5">
        {PERIODS.map((period, index) => {
          const totalDays = period.daysRange[1] - period.daysRange[0] + 1;
          const completedInPeriod = completedDays.filter(
            d => d >= period.daysRange[0] && d <= period.daysRange[1]
          ).length;
          const percentComplete = (completedInPeriod / totalDays) * 100;
          const width = (totalDays / 365) * 100;
          const isCurrentPeriod = currentDay >= period.daysRange[0] && currentDay <= period.daysRange[1];

          return (
            <div 
              key={period.name}
              className="relative h-full rounded-sm overflow-hidden transition-all active:scale-95"
              style={{ 
                width: `${width}%`,
                backgroundColor: `${period.color}20`,
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentComplete}%` }}
                transition={{ duration: 0.5, delay: index * 0.03 }}
                className="h-full rounded-sm"
                style={{ backgroundColor: period.color }}
              />
              {isCurrentPeriod && (
                <motion.div
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 border-2 rounded-sm"
                  style={{ borderColor: period.color }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Scrollable Legend - Mobile optimized */}
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-2">
          {PERIODS.map((period, index) => {
            const isCurrentPeriod = index === currentPeriodIndex;
            const completedInPeriod = completedDays.filter(
              d => d >= period.daysRange[0] && d <= period.daysRange[1]
            ).length;
            const totalDays = period.daysRange[1] - period.daysRange[0] + 1;
            
            return (
              <motion.div 
                key={period.name} 
                className={`flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-lg transition-all ${
                  isCurrentPeriod ? 'glass-card ring-1 ring-primary/30' : ''
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <div 
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: period.color }}
                />
                <div className="text-left">
                  <span className="text-xs font-medium whitespace-nowrap">
                    {period.name}
                  </span>
                  <p className="text-[10px] text-muted-foreground">
                    {completedInPeriod}/{totalDays}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="h-1.5" />
      </ScrollArea>
    </div>
  );
};
