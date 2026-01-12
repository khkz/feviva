import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, BookOpen, PlayCircle, Brain, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Mission {
  id: string;
  icon: typeof Target;
  title: string;
  action: string;
  href?: string;
  onClick?: () => void;
  color: string;
}

interface MissionBannerProps {
  onRosarioClick?: () => void;
}

const ARTICLES_READ_KEY = 'frontera-final-articles-read';
const ROSARIO_COMPLETED_KEY = 'frontera-final-rosario-completed';
const QUIZ_COMPLETED_KEY = 'frontera-final-quiz-completed';

export function MissionBanner({ onRosarioClick }: MissionBannerProps) {
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Determine the next mission based on user progress
    const articlesRead = JSON.parse(localStorage.getItem(ARTICLES_READ_KEY) || '[]');
    const rosarioCompleted = localStorage.getItem(ROSARIO_COMPLETED_KEY);
    const quizCompleted = localStorage.getItem(QUIZ_COMPLETED_KEY);

    let mission: Mission;

    if (articlesRead.length === 0) {
      // New user - suggest first article
      mission = {
        id: 'first-article',
        icon: BookOpen,
        title: 'Lee tu primer artículo',
        action: 'El Libro de la Naturaleza',
        href: '/frontera-final/libro-naturaleza',
        color: 'cyan',
      };
    } else if (!rosarioCompleted && articlesRead.length >= 1) {
      // Has read articles but hasn't tried rosario
      mission = {
        id: 'try-rosario',
        icon: PlayCircle,
        title: 'Prueba el Rosario Interestelar',
        action: 'Reza con el cosmos',
        onClick: onRosarioClick,
        color: 'amber',
      };
    } else if (!quizCompleted && articlesRead.length >= 3) {
      // Has done rosario, read articles, try quiz
      mission = {
        id: 'try-quiz',
        icon: Brain,
        title: 'Pon a prueba tu conocimiento',
        action: 'Quiz de Apologética',
        href: '#quiz',
        color: 'purple',
      };
    } else {
      // Advanced user - suggest next unread article
      const allArticles = [
        'libro-naturaleza',
        'punto-omega',
        'bautizar-extraterrestre',
        'padre-big-bang',
        'observatorio-vaticano',
        'colonizar-conquistar',
        'ia-alma',
      ];
      const unreadArticle = allArticles.find(a => !articlesRead.includes(a));
      
      if (unreadArticle) {
        mission = {
          id: 'next-article',
          icon: Target,
          title: 'Continúa tu exploración',
          action: 'Siguiente artículo',
          href: `/frontera-final/${unreadArticle}`,
          color: 'cyan',
        };
      } else {
        // All complete - encourage sharing or revisiting
        mission = {
          id: 'share',
          icon: Target,
          title: '¡Explorador Completo!',
          action: 'Comparte tu logro',
          color: 'amber',
        };
      }
    }

    setCurrentMission(mission);
  }, [onRosarioClick]);

  if (!currentMission || isDismissed) {
    return null;
  }

  const Icon = currentMission.icon;
  
  const colorClasses = {
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-400/40 text-cyan-400',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-400/40 text-amber-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-400/40 text-purple-400',
  };

  const classes = colorClasses[currentMission.color as keyof typeof colorClasses];

  const content = (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative glass-cyber rounded-xl p-4 border bg-gradient-to-r ${classes} overflow-hidden group cursor-pointer`}
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
              Tu Próxima Misión
            </p>
            <p className="text-white font-orbitron text-sm">
              {currentMission.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium hidden sm:inline">
            {currentMission.action}
          </span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDismissed(true);
        }}
        className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors p-1"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );

  if (currentMission.href) {
    return (
      <Link to={currentMission.href} className="block">
        {content}
      </Link>
    );
  }

  if (currentMission.onClick) {
    return (
      <button onClick={currentMission.onClick} className="block w-full text-left">
        {content}
      </button>
    );
  }

  return content;
}

// Hook to track article reads
export function useArticleTracking() {
  const markArticleRead = (articleId: string) => {
    const current = JSON.parse(localStorage.getItem(ARTICLES_READ_KEY) || '[]');
    if (!current.includes(articleId)) {
      current.push(articleId);
      localStorage.setItem(ARTICLES_READ_KEY, JSON.stringify(current));
    }
  };

  const isArticleRead = (articleId: string): boolean => {
    const current = JSON.parse(localStorage.getItem(ARTICLES_READ_KEY) || '[]');
    return current.includes(articleId);
  };

  const getReadArticles = (): string[] => {
    return JSON.parse(localStorage.getItem(ARTICLES_READ_KEY) || '[]');
  };

  const markRosarioCompleted = () => {
    localStorage.setItem(ROSARIO_COMPLETED_KEY, 'true');
  };

  const markQuizCompleted = () => {
    localStorage.setItem(QUIZ_COMPLETED_KEY, 'true');
  };

  return {
    markArticleRead,
    isArticleRead,
    getReadArticles,
    markRosarioCompleted,
    markQuizCompleted,
  };
}
