import { useState, useEffect, useCallback } from 'react';

const ARTICLES_READ_KEY = 'frontera-final-articles-read';
const ROSARIO_COMPLETED_KEY = 'frontera-final-rosario-completed';
const QUIZ_COMPLETED_KEY = 'frontera-final-quiz-completed';
const WELCOMED_KEY = 'frontera-final-welcomed';

export interface FronteraProgress {
  articlesRead: string[];
  rosarioCompleted: boolean;
  quizCompleted: boolean;
  hasBeenWelcomed: boolean;
  totalArticles: number;
  progressPercentage: number;
}

export function useFronteraProgress() {
  const [progress, setProgress] = useState<FronteraProgress>({
    articlesRead: [],
    rosarioCompleted: false,
    quizCompleted: false,
    hasBeenWelcomed: false,
    totalArticles: 7,
    progressPercentage: 0,
  });

  const loadProgress = useCallback(() => {
    const articlesRead = JSON.parse(localStorage.getItem(ARTICLES_READ_KEY) || '[]');
    const rosarioCompleted = localStorage.getItem(ROSARIO_COMPLETED_KEY) === 'true';
    const quizCompleted = localStorage.getItem(QUIZ_COMPLETED_KEY) === 'true';
    const hasBeenWelcomed = localStorage.getItem(WELCOMED_KEY) === 'true';
    
    // Calculate progress: articles (70%) + rosario (15%) + quiz (15%)
    const articleProgress = (articlesRead.length / 7) * 70;
    const rosarioProgress = rosarioCompleted ? 15 : 0;
    const quizProgress = quizCompleted ? 15 : 0;
    const progressPercentage = Math.round(articleProgress + rosarioProgress + quizProgress);

    setProgress({
      articlesRead,
      rosarioCompleted,
      quizCompleted,
      hasBeenWelcomed,
      totalArticles: 7,
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

  const markRosarioCompleted = useCallback(() => {
    localStorage.setItem(ROSARIO_COMPLETED_KEY, 'true');
    loadProgress();
  }, [loadProgress]);

  const markQuizCompleted = useCallback(() => {
    localStorage.setItem(QUIZ_COMPLETED_KEY, 'true');
    loadProgress();
  }, [loadProgress]);

  const resetProgress = useCallback(() => {
    localStorage.removeItem(ARTICLES_READ_KEY);
    localStorage.removeItem(ROSARIO_COMPLETED_KEY);
    localStorage.removeItem(QUIZ_COMPLETED_KEY);
    localStorage.removeItem(WELCOMED_KEY);
    loadProgress();
  }, [loadProgress]);

  return {
    progress,
    markArticleRead,
    isArticleRead,
    markRosarioCompleted,
    markQuizCompleted,
    resetProgress,
  };
}
