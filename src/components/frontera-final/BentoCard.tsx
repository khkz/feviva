import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LucideIcon, CheckCircle } from 'lucide-react';
import { useFronteraProgress } from '@/hooks/useFronteraProgress';

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
  id,
  title, 
  description, 
  icon: Icon, 
  size, 
  color, 
  delay = 0,
  href 
}: BentoCardProps) {
  const { isArticleRead } = useFronteraProgress();
  const isRead = isArticleRead(id);

  const colorClasses = {
    cyan: {
      border: 'border-cyan-400/20 hover:border-cyan-400/50',
      icon: 'text-cyan-400',
      glow: 'group-hover:shadow-cyan-400/20',
      readBg: 'bg-cyan-400/10',
    },
    amber: {
      border: 'border-amber-400/20 hover:border-amber-400/50',
      icon: 'text-amber-400',
      glow: 'group-hover:shadow-amber-400/20',
      readBg: 'bg-amber-400/10',
    },
    purple: {
      border: 'border-purple-400/20 hover:border-purple-400/50',
      icon: 'text-purple-400',
      glow: 'group-hover:shadow-purple-400/20',
      readBg: 'bg-purple-400/10',
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
        group glass-cyber rounded-2xl p-6 cursor-pointer h-full relative
        transition-all duration-300
        ${classes.border}
        ${classes.glow}
        group-hover:shadow-lg
        ${size === 'large' ? 'md:col-span-2 md:row-span-2' : ''}
        ${isRead ? classes.readBg : ''}
      `}
    >
      {/* Read indicator */}
      {isRead && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3"
        >
          <CheckCircle className={`w-5 h-5 ${classes.icon}`} />
        </motion.div>
      )}

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
        <div className="mt-4 flex items-center justify-between text-xs">
          <span className={`${isRead ? classes.icon : 'text-gray-500'} group-hover:text-gray-400 transition-colors`}>
            {isRead ? 'Leído' : 'Explorar'}
          </span>
          <span className="text-gray-500 group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </div>
    </motion.div>
  );

  if (href) {
    return (
      <Link to={href} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
