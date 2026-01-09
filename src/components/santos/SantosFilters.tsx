import { motion } from 'framer-motion';
import { Calendar, Users, Sparkles, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type FilterTab = 'today' | 'month' | 'patrons' | 'all';

interface SantosFiltersProps {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  selectedMonth: number | null;
  onMonthChange: (month: number | null) => void;
  months: { value: number; label: string }[];
  todayCount: number;
  monthCount: number;
  patronCount: number;
}

export function SantosFilters({
  activeTab,
  onTabChange,
  selectedMonth,
  onMonthChange,
  months,
  todayCount,
  monthCount,
  patronCount,
}: SantosFiltersProps) {
  const tabs = [
    { id: 'today' as const, label: 'Hoy', icon: Sparkles, count: todayCount },
    { id: 'month' as const, label: 'Este Mes', icon: Calendar, count: monthCount },
    { id: 'patrons' as const, label: 'Patronos', icon: Users, count: patronCount },
    { id: 'all' as const, label: 'Todos', icon: Filter, count: null },
  ];

  return (
    <div className="space-y-4 px-5">
      {/* Tab buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <Button
              key={tab.id}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'gap-1.5 whitespace-nowrap rounded-full',
                isActive && 'shadow-md'
              )}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.count !== null && (
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  isActive ? 'bg-background/20' : 'bg-muted'
                )}>
                  {tab.count}
                </span>
              )}
            </Button>
          );
        })}
      </motion.div>

      {/* Month selector - only show when viewing "all" */}
      {activeTab === 'all' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center gap-2"
        >
          <Select
            value={selectedMonth?.toString() || 'all'}
            onValueChange={(value) => onMonthChange(value === 'all' ? null : parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por mes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los meses</SelectItem>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      )}
    </div>
  );
}
