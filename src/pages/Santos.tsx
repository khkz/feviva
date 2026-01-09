import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Loader2, Church } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { SantosHero } from '@/components/santos/SantosHero';
import { SantoCard } from '@/components/santos/SantoCard';
import { SantoDetail } from '@/components/santos/SantoDetail';
import { SantosFilters } from '@/components/santos/SantosFilters';
import { useSantos, CalendarSaint } from '@/hooks/useSantos';

type FilterTab = 'today' | 'month' | 'patrons' | 'all';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export default function Santos() {
  const [activeTab, setActiveTab] = useState<FilterTab>('today');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedSaint, setSelectedSaint] = useState<CalendarSaint | null>(null);

  const {
    allSaints,
    saintsToday,
    saintsThisMonth,
    patronSaints,
    months,
    stats,
    isLoading,
    searchQuery,
    setSearchQuery,
  } = useSantos({ month: activeTab === 'all' ? selectedMonth : null });

  // Get displayed saints based on active tab and search
  const displayedSaints = useMemo(() => {
    let saints: CalendarSaint[] = [];

    if (searchQuery.trim()) {
      // Search across all saints
      const query = searchQuery.toLowerCase();
      saints = allSaints.filter(
        (saint) =>
          saint.name.toLowerCase().includes(query) ||
          saint.description?.toLowerCase().includes(query) ||
          saint.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    } else {
      switch (activeTab) {
        case 'today':
          saints = saintsToday;
          break;
        case 'month':
          saints = saintsThisMonth;
          break;
        case 'patrons':
          saints = patronSaints;
          break;
        case 'all':
          saints = selectedMonth
            ? allSaints.filter((s) => s.feast_month === selectedMonth)
            : allSaints;
          break;
      }
    }

    return saints;
  }, [activeTab, selectedMonth, searchQuery, allSaints, saintsToday, saintsThisMonth, patronSaints]);

  // Check if a saint is celebrated today
  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();
  const isSaintToday = (saint: CalendarSaint) =>
    saint.feast_month === todayMonth && saint.feast_day === todayDay;

  if (selectedSaint) {
    return (
      <SantoDetail
        saint={selectedSaint}
        onClose={() => setSelectedSaint(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <DesktopSidebar userName="" userLevel={1} userStreak={0} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 pb-20">
        {/* Back to Home button - Mobile */}
        <div className="lg:hidden p-4 pb-0">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <Home className="h-4 w-4" />
              Inicio
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <SantosHero
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          stats={stats}
        />

        {/* Filters */}
        <SantosFilters
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setSearchQuery('');
          }}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          months={months}
          todayCount={saintsToday.length}
          monthCount={saintsThisMonth.length}
          patronCount={patronSaints.length}
        />

        {/* Content */}
        <ScrollArea className="h-[calc(100vh-380px)] mt-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-secondary/30 rounded-full blur-xl animate-pulse" />
                <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
              </div>
              <p className="text-muted-foreground text-sm">Cargando santos...</p>
            </div>
          ) : displayedSaints.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 px-5"
            >
              <div className="glass-card rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Church className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground">
                {searchQuery
                  ? `No se encontraron santos para "${searchQuery}"`
                  : activeTab === 'today'
                  ? 'No hay santos registrados para hoy'
                  : 'No se encontraron santos'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="px-5 pb-6"
            >
              {/* Results count */}
              {searchQuery && (
                <p className="text-sm text-muted-foreground mb-4">
                  {displayedSaints.length} resultado{displayedSaints.length !== 1 && 's'} para "{searchQuery}"
                </p>
              )}

              {/* Grid of saints */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {displayedSaints.map((saint) => (
                  <SantoCard
                    key={saint.id}
                    saint={saint}
                    onSelect={() => setSelectedSaint(saint)}
                    isToday={isSaintToday(saint)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </ScrollArea>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
