import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface BentoCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  size: 'normal' | 'large';
  color: string;
  delay?: number;
  href?: string;
}

export function BentoCard({ 
  title, 
  description, 
  icon: Icon, 
  size, 
  color, 
  delay = 0,
  href 
}: BentoCardProps) {
  const colorClasses = {
    cyan: {
      border: 'border-cyan-400/20 hover:border-cyan-400/50',
      icon: 'text-cyan-400',
      glow: 'group-hover:shadow-cyan-400/20',
    },
    amber: {
      border: 'border-amber-400/20 hover:border-amber-400/50',
      icon: 'text-amber-400',
      glow: 'group-hover:shadow-amber-400/20',
    },
    purple: {
      border: 'border-purple-400/20 hover:border-purple-400/50',
      icon: 'text-purple-400',
      glow: 'group-hover:shadow-purple-400/20',
    },
  };

  const classes = colorClasses[color as keyof typeof colorClasses] || colorClasses.cyan;

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`
        group glass-cyber rounded-2xl p-6 cursor-pointer h-full
        transition-all duration-300
        ${classes.border}
        ${classes.glow}
        group-hover:shadow-lg
        ${size === 'large' ? 'md:col-span-2 md:row-span-2' : ''}
      `}
    >
      <div className="flex flex-col h-full">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-slate-800/50 border border-slate-700/50 group-hover:scale-110 transition-transform duration-300">
          <Icon className={`w-6 h-6 ${classes.icon}`} />
        </div>
        <h3 className="font-orbitron text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
          {title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed flex-grow">
          {description}
        </p>
        <div className="mt-4 flex items-center text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
          <span>Explorar</span>
          <span className="ml-2">→</span>
        </div>
      </div>
    </motion.div>
  );

  if (href) {
    return <Link to={href} className="block">{cardContent}</Link>;
  }

  return cardContent;
}
