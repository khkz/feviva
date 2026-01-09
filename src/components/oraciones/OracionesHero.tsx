import { motion } from "framer-motion";
import { Search, Cross } from "lucide-react";
import { Input } from "@/components/ui/input";
import heroBgImage from "@/assets/oraciones-hero-bg.jpg";

interface OracionesHeroProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClearCategory: () => void;
}

export function OracionesHero({
  searchQuery,
  onSearchChange,
  onClearCategory,
}: OracionesHeroProps) {
  return (
    <motion.header 
      className="relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBgImage})` }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/70 to-background" />
      
      {/* Decorative orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10 p-5 pt-8 pb-10">
        {/* Icon and Title */}
        <motion.div
          className="flex flex-col items-center text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="p-4 rounded-2xl bg-secondary/20 backdrop-blur-sm mb-4 shadow-glow">
            <Cross className="h-8 w-8 text-secondary" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
            Libro de Oraciones
          </h1>
          
          {/* Inspirational Quote */}
          <div className="max-w-sm">
            <p className="text-muted-foreground text-sm italic leading-relaxed">
              "Donde dos o tres se reúnen en mi nombre, allí estoy yo en medio de ellos."
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1 font-medium">
              — Mateo 18:20
            </p>
          </div>
        </motion.div>
        
        {/* Search */}
        <motion.div 
          className="relative max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar oraciones..."
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              onClearCategory();
            }}
            className="pl-12 h-12 glass-card border-0 text-base rounded-2xl shadow-medium"
          />
        </motion.div>
      </div>
    </motion.header>
  );
}
