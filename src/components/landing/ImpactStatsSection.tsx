import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Heart, BookOpen, Users, Flame, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Stat {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
  color: string;
}

const useAnimatedCounter = (end: number, duration: number = 2000, startCounting: boolean = false) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startCounting || end === 0) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, startCounting]);

  return count;
};

const AnimatedStat = ({ stat, inView }: { stat: Stat; inView: boolean }) => {
  const count = useAnimatedCounter(stat.value, 2000, inView);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5 }}
      className="text-center group"
    >
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
        <stat.icon className="w-8 h-8 text-white" />
      </div>
      <div className="text-4xl md:text-5xl font-bold mb-2">
        {count.toLocaleString()}{stat.suffix}
      </div>
      <div className="text-muted-foreground text-sm">{stat.label}</div>
    </motion.div>
  );
};

export const ImpactStatsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Fetch real stats from database
  const { data: dbStats } = useQuery({
    queryKey: ['landing-stats'],
    queryFn: async () => {
      const [
        { count: oracionesCount },
        { count: usuariosCount },
        { count: santosCount }
      ] = await Promise.all([
        supabase.from('oraciones').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('calendar_saints').select('*', { count: 'exact', head: true })
      ]);

      return {
        oraciones: oracionesCount || 500,
        usuarios: usuariosCount || 5000,
        santos: santosCount || 365
      };
    },
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  });

  const stats: Stat[] = [
    {
      icon: Heart,
      value: dbStats?.oraciones || 500,
      suffix: "+",
      label: "Oraciones disponibles",
      color: "from-rose-500 to-pink-500"
    },
    {
      icon: Users,
      value: dbStats?.usuarios || 5000,
      suffix: "+",
      label: "Usuarios activos",
      color: "from-cyan-500 to-blue-500"
    },
    {
      icon: BookOpen,
      value: 365,
      suffix: "",
      label: "Días de lectura bíblica",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: Flame,
      value: dbStats?.santos || 365,
      suffix: "+",
      label: "Santos del calendario",
      color: "from-violet-500 to-purple-500"
    }
  ];

  return (
    <section ref={ref} className="py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-background to-muted/20" />
      
      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <AnimatedStat key={index} stat={stat} inView={isInView} />
          ))}
        </div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative max-w-3xl mx-auto text-center"
        >
          <div className="absolute -top-8 left-1/2 -translate-x-1/2">
            <Quote className="w-12 h-12 text-primary/20" />
          </div>
          
          <blockquote className="text-xl md:text-2xl font-display italic text-foreground/90 mb-4">
            "Pedid y se os dará; buscad y hallaréis; llamad y se os abrirá."
          </blockquote>
          <cite className="text-muted-foreground text-sm not-italic">
            — Mateo 7:7
          </cite>
        </motion.div>
      </div>
    </section>
  );
};
