import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Período actual:</span>
        {currentPeriod && (
          <span 
            className="font-semibold px-2 py-0.5 rounded text-white"
            style={{ backgroundColor: currentPeriod.color }}
          >
            {currentPeriod.name}
          </span>
        )}
      </div>
      
      <div className="flex gap-0.5 h-3 rounded-full overflow-hidden bg-muted/30">
        {PERIODS.map((period, index) => {
          const totalDays = period.daysRange[1] - period.daysRange[0] + 1;
          const completedInPeriod = completedDays.filter(
            d => d >= period.daysRange[0] && d <= period.daysRange[1]
          ).length;
          const percentComplete = (completedInPeriod / totalDays) * 100;
          const width = (totalDays / 365) * 100;
          const isCurrentPeriod = currentDay >= period.daysRange[0] && currentDay <= period.daysRange[1];

          return (
            <Tooltip key={period.name}>
              <TooltipTrigger asChild>
                <div 
                  className="relative h-full cursor-pointer transition-all hover:opacity-90"
                  style={{ 
                    width: `${width}%`,
                    backgroundColor: `${period.color}33`,
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentComplete}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="h-full"
                    style={{ backgroundColor: period.color }}
                  />
                  {isCurrentPeriod && (
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 border-2 rounded-sm"
                      style={{ borderColor: period.color }}
                    />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-semibold">{period.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Días {period.daysRange[0]}-{period.daysRange[1]}
                  </p>
                  <p className="text-xs">
                    {completedInPeriod}/{totalDays} completados
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {PERIODS.map((period) => (
          <div key={period.name} className="flex items-center gap-1">
            <div 
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: period.color }}
            />
            <span className="text-muted-foreground hidden sm:inline">{period.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
