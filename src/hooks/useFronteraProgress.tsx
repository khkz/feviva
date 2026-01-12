import { useState, useEffect, useCallback } from 'react';

const ARTICLES_READ_KEY = 'frontera-final-articles-read';
const MEDITACION_COMPLETED_KEY = 'frontera-final-meditacion-completed';
const QUIZ_COMPLETED_KEY = 'frontera-final-quiz-completed';
const WELCOMED_KEY = 'frontera-final-welcomed';
const MEDITATIONS_COUNT_KEY = 'frontera_meditations_completed';

export interface FronteraProgress {
  articlesRead: string[];
  meditacionCompleted: boolean;
  quizCompleted: boolean;
  hasBeenWelcomed: boolean;
  totalArticles: number;
  meditationsCompleted: number;
  progressPercentage: number;
}

export function useFronteraProgress() {
  const [progress, setProgress] = useState<FronteraProgress>({
    articlesRead: [],
    meditacionCompleted: false,
    quizCompleted: false,
    hasBeenWelcomed: false,
    totalArticles: 7,
    meditationsCompleted: 0,
    progressPercentage: 0,
  });

  const loadProgress = useCallback(() => {
    const articlesRead = JSON.parse(localStorage.getItem(ARTICLES_READ_KEY) || '[]');
    const meditacionCompleted = localStorage.getItem(MEDITACION_COMPLETED_KEY) === 'true';
    const quizCompleted = localStorage.getItem(QUIZ_COMPLETED_KEY) === 'true';
    const hasBeenWelcomed = localStorage.getItem(WELCOMED_KEY) === 'true';
    const meditationsCompleted = parseInt(localStorage.getItem(MEDITATIONS_COUNT_KEY) || '0');
    
    // Calculate progress: articles (70%) + meditación (15%) + quiz (15%)
    const articleProgress = (articlesRead.length / 7) * 70;
    const meditacionProgress = meditacionCompleted ? 15 : 0;
    const quizProgress = quizCompleted ? 15 : 0;
    const progressPercentage = Math.round(articleProgress + meditacionProgress + quizProgress);

    setProgress({
      articlesRead,
      meditacionCompleted,
      quizCompleted,
      hasBeenWelcomed,
      totalArticles: 7,
      meditationsCompleted,
      progressPercentage,
    });
  }, []);

  useEffect(() => {
    loadProgress();
    
    // Listen for storage changes from other tabs
    const handleStorageChange = () => loadProgress();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadProgress]);

  const markArticleRead = useCallback((articleId: string) => {
    const current = JSON.parse(localStorage.getItem(ARTICLES_READ_KEY) || '[]');
    if (!current.includes(articleId)) {
      current.push(articleId);
      localStorage.setItem(ARTICLES_READ_KEY, JSON.stringify(current));
      loadProgress();
    }
  }, [loadProgress]);

  const isArticleRead = useCallback((articleId: string): boolean => {
    return progress.articlesRead.includes(articleId);
  }, [progress.articlesRead]);

  const markMeditacionCompleted = useCallback(() => {
    localStorage.setItem(MEDITACION_COMPLETED_KEY, 'true');
    const current = parseInt(localStorage.getItem(MEDITATIONS_COUNT_KEY) || '0');
    localStorage.setItem(MEDITATIONS_COUNT_KEY, String(current + 1));
    loadProgress();
  }, [loadProgress]);

  const markQuizCompleted = useCallback(() => {
    localStorage.setItem(QUIZ_COMPLETED_KEY, 'true');
    loadProgress();
  }, [loadProgress]);

  const resetProgress = useCallback(() => {
    localStorage.removeItem(ARTICLES_READ_KEY);
    localStorage.removeItem(MEDITACION_COMPLETED_KEY);
    localStorage.removeItem(QUIZ_COMPLETED_KEY);
    localStorage.removeItem(WELCOMED_KEY);
    localStorage.removeItem(MEDITATIONS_COUNT_KEY);
    loadProgress();
  }, [loadProgress]);

  return {
    progress,
    markArticleRead,
    isArticleRead,
    markMeditacionCompleted,
    markQuizCompleted,
    resetProgress,
  };
}