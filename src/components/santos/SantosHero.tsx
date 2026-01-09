import { motion } from 'framer-motion';
import { Search, Church, Calendar, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SantosHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  stats: {
    total: number;
    patrons: number;
    withImage: number;
  };
}

export function SantosHero({ searchQuery, onSearchChange, stats }: SantosHeroProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-background" />
      
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />

      <div className="relative px-5 py-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Church className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              Santos del Calendario
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Conoce la vida y las oraciones de los santos
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative max-w-md mx-auto"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar santo por nombre..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-card/50 border-border/50 backdrop-blur-sm"
          />
        </motion.div>

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center gap-6"
        >
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">{stats.total} santos</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-secondary" />
            <span className="text-muted-foreground">{stats.patrons} patronos</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
