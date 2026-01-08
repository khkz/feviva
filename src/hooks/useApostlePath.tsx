import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PathProgress {
  id: string;
  user_id: string;
  etapa_actual: number;
  cimientos_completado: boolean;
  defensor_completado: boolean;
  debatidor_completado: boolean;
  misionero_completado: boolean;
  apostol_completado: boolean;
  fecha_inicio: string;
  fecha_ultima_actividad: string | null;
  puntos_ruta: number;
}

export interface PathActivity {
  id: string;
  user_id: string;
  etapa: number;
  actividad_tipo: string;
  actividad_id: string;
  completado_en: string;
  puntos_ganados: number;
}

export interface StageRequirement {
  tipo: 'leccion' | 'debate' | 'mision' | 'reflexion' | 'gratitud';
  id?: string;
  titulo: string;
  descripcion: string;
  cantidad?: number;
  dificultad?: string;
  puntuacion_minima?: number;
}

export interface Stage {
  numero: number;
  nombre: string;
  subtitulo: string;
  descripcion: string;
  icono: string;
  color: string;
  requisitos: StageRequirement[];
  recompensa_puntos: number;
  badge_codigo: string;
}

// Mapping from stage requirement IDs to library_lessons titles
const LESSON_TITLE_MAP: Record<string, string> = {
  'existe-dios': '¿Existe Dios?',
  'biblia-confiable': 'La Confiabilidad de la Biblia',
  'jesus-historico': 'Jesús Histórico',
  'resurreccion': 'La Resurrección de Jesús',
  'fe-ciencia': 'Fe y Ciencia',
  'salvacion': 'Salvación por Gracia',
  'problema-mal': 'El Problema del Mal',
  'trinidad': 'La Trinidad',
};

export const STAGES: Stage[] = [
  {
    numero: 1,
    nombre: 'Cimientos',
    subtitulo: 'El Fundamento de la Fe',
    descripcion: 'Establece las bases de tu fe con los fundamentos esenciales de la apologética cristiana.',
    icono: '🪨',
    color: 'from-green-500 to-emerald-600',
    requisitos: [
      { tipo: 'leccion', id: 'existe-dios', titulo: 'Lección: ¿Existe Dios?', descripcion: 'Argumentos para la existencia de Dios' },
      { tipo: 'leccion', id: 'biblia-confiable', titulo: 'Lección: La Biblia es Confiable', descripcion: 'Evidencias de la confiabilidad bíblica' },
      { tipo: 'reflexion', titulo: 'Reflexión IA', descripcion: '¿Por qué creo lo que creo?' },
      { tipo: 'gratitud', cantidad: 1, titulo: 'Entrada de Gratitud', descripcion: 'Registra 1 momento de gratitud' },
    ],
    recompensa_puntos: 50,
    badge_codigo: 'ruta_cimientos',
  },
  {
    numero: 2,
    nombre: 'Defensor',
    subtitulo: 'Conoce los Argumentos',
    descripcion: 'Profundiza en los argumentos principales que sostienen la fe cristiana.',
    icono: '🛡️',
    color: 'from-blue-500 to-indigo-600',
    requisitos: [
      { tipo: 'leccion', id: 'jesus-historico', titulo: 'Lección: Jesús Histórico', descripcion: 'Evidencias históricas de Jesús' },
      { tipo: 'leccion', id: 'resurreccion', titulo: 'Lección: La Resurrección', descripcion: 'El evento central de la fe' },
      { tipo: 'leccion', id: 'fe-ciencia', titulo: 'Lección: Fe y Ciencia', descripcion: 'Compatibilidad entre fe y razón' },
      { tipo: 'leccion', id: 'salvacion', titulo: 'Lección: Salvación por Gracia', descripcion: 'El mensaje del Evangelio' },
      { tipo: 'reflexion', titulo: 'Quiz de Comprensión', descripcion: 'Evalúa tu aprendizaje' },
      { tipo: 'debate', cantidad: 1, dificultad: 'aprendiz', titulo: '1 Debate Nivel Aprendiz', descripcion: 'Practica con el Coach' },
    ],
    recompensa_puntos: 100,
    badge_codigo: 'ruta_defensor',
  },
  {
    numero: 3,
    nombre: 'Debatidor',
    subtitulo: 'Practica el Diálogo',
    descripcion: 'Desarrolla habilidades prácticas de diálogo y debate apologético.',
    icono: '⚔️',
    color: 'from-orange-500 to-amber-600',
    requisitos: [
      { tipo: 'leccion', id: 'problema-mal', titulo: 'Lección: El Problema del Mal', descripcion: 'Responde a la objeción más común' },
      { tipo: 'leccion', id: 'trinidad', titulo: 'Lección: La Trinidad', descripcion: 'Comprende este misterio' },
      { tipo: 'debate', cantidad: 3, titulo: '3 Debates con Coach IA', descripcion: 'Cualquier dificultad' },
      { tipo: 'reflexion', titulo: 'Análisis de Debates', descripcion: 'IA analiza tus fortalezas y debilidades' },
    ],
    recompensa_puntos: 150,
    badge_codigo: 'ruta_debatidor',
  },
  {
    numero: 4,
    nombre: 'Misionero',
    subtitulo: 'Aplica en la Vida Real',
    descripcion: 'Lleva tu formación al mundo real compartiendo tu fe con otros.',
    icono: '🧭',
    color: 'from-purple-500 to-violet-600',
    requisitos: [
      { tipo: 'mision', cantidad: 3, titulo: '3 Registros de Evangelización', descripcion: 'Comparte tu fe en la vida real' },
      { tipo: 'debate', cantidad: 2, dificultad: 'intermedio', titulo: '2 Debates Nivel Intermedio', descripcion: 'Enfrenta desafíos mayores' },
      { tipo: 'leccion', titulo: 'Lección Avanzada', descripcion: 'Elige una lección nivel 3+' },
      { tipo: 'reflexion', titulo: 'Reflexión: Mi Experiencia', descripcion: 'Comparte tu testimonio misionero' },
    ],
    recompensa_puntos: 200,
    badge_codigo: 'ruta_misionero',
  },
  {
    numero: 5,
    nombre: 'Apóstol',
    subtitulo: 'Maestría Apologética',
    descripcion: 'Alcanza el nivel más alto de formación y conviértete en un apóstol completo.',
    icono: '👑',
    color: 'from-yellow-500 to-amber-500',
    requisitos: [
      { tipo: 'leccion', cantidad: 4, titulo: 'Todas las Lecciones Nivel 4', descripcion: 'Argumentos avanzados' },
      { tipo: 'debate', cantidad: 5, dificultad: 'avanzado', puntuacion_minima: 2, titulo: '5 Debates Nivel Avanzado', descripcion: 'Puntuación promedio ≥2' },
      { tipo: 'mision', cantidad: 10, titulo: '10 Registros de Evangelización', descripcion: 'Impacta múltiples vidas' },
      { tipo: 'reflexion', titulo: 'Testimonio Final', descripcion: 'Tu testimonio como apóstol' },
    ],
    recompensa_puntos: 500,
    badge_codigo: 'ruta_apostol',
  },
];

interface LessonProgress {
  lesson_id: string;
  completado: boolean;
}

interface LibraryLesson {
  id: string;
  titulo: string;
}

export const useApostlePath = () => {
  const [progress, setProgress] = useState<PathProgress | null>(null);
  const [activities, setActivities] = useState<PathActivity[]>([]);
  const [lessonProgress, setLessonProgress] = useState<Record<string, boolean>>({});
  const [libraryLessons, setLibraryLessons] = useState<LibraryLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiReflection, setAiReflection] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const { toast } = useToast();

  const fetchProgress = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get or create progress
      let { data: progressData, error } = await supabase
        .from('apostle_path_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!progressData) {
        const { data: newProgress, error: insertError } = await supabase
          .from('apostle_path_progress')
          .insert({ user_id: user.id })
          .select()
          .single();
        
        if (insertError) throw insertError;
        progressData = newProgress;
      }

      setProgress(progressData);

      // Get activities from apostle path
      const { data: activitiesData } = await supabase
        .from('apostle_path_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('completado_en', { ascending: false });

      setActivities(activitiesData || []);

      // Get lesson progress from library
      const { data: lessonProgressData } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id, completado')
        .eq('user_id', user.id)
        .eq('completado', true);

      // Get library lessons to map titles
      const { data: lessonsData } = await supabase
        .from('library_lessons')
        .select('id, titulo');

      setLibraryLessons(lessonsData || []);

      // Create a map of lesson titles to completion status
      const progressMap: Record<string, boolean> = {};
      if (lessonProgressData && lessonsData) {
        lessonProgressData.forEach((p: LessonProgress) => {
          const lesson = lessonsData.find((l: LibraryLesson) => l.id === p.lesson_id);
          if (lesson) {
            progressMap[lesson.titulo] = p.completado;
          }
        });
      }
      setLessonProgress(progressMap);
    } catch (error) {
      console.error('Error fetching path progress:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const completeActivity = async (etapa: number, tipo: string, actividadId: string, puntos: number = 10) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if already completed
      const existing = activities.find(
        a => a.etapa === etapa && a.actividad_tipo === tipo && a.actividad_id === actividadId
      );
      if (existing) return;

      // Insert activity
      const { error } = await supabase
        .from('apostle_path_activities')
        .insert({
          user_id: user.id,
          etapa,
          actividad_tipo: tipo,
          actividad_id: actividadId,
          puntos_ganados: puntos,
        });

      if (error) throw error;

      // Update progress points
      await supabase
        .from('apostle_path_progress')
        .update({
          puntos_ruta: (progress?.puntos_ruta || 0) + puntos,
          fecha_ultima_actividad: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      toast({
        title: '¡Actividad completada!',
        description: `+${puntos} puntos en tu Ruta del Apóstol`,
      });

      await fetchProgress();
      await checkStageCompletion(etapa);
    } catch (error) {
      console.error('Error completing activity:', error);
    }
  };

  const getStageActivities = (etapa: number) => {
    return activities.filter(a => a.etapa === etapa);
  };

  const isLessonCompleted = (lessonId: string): boolean => {
    // Check if lesson is completed in library by matching the title
    const lessonTitle = LESSON_TITLE_MAP[lessonId];
    if (lessonTitle && lessonProgress[lessonTitle]) {
      return true;
    }
    return false;
  };

  const isActivityCompleted = (etapa: number, tipo: string, actividadId: string) => {
    // For lessons, also check the library progress
    if (tipo === 'leccion') {
      if (isLessonCompleted(actividadId)) {
        return true;
      }
    }
    
    return activities.some(
      a => a.etapa === etapa && a.actividad_tipo === tipo && a.actividad_id === actividadId
    );
  };

  const getStageProgress = (etapa: number): number => {
    const stage = STAGES.find(s => s.numero === etapa);
    if (!stage) return 0;

    let completedCount = 0;
    for (const req of stage.requisitos) {
      const activityId = req.id || req.titulo.toLowerCase().replace(/\s+/g, '-');
      if (isActivityCompleted(etapa, req.tipo, activityId)) {
        completedCount++;
      }
    }

    return Math.round((completedCount / stage.requisitos.length) * 100);
  };

  const isStageCompleted = (etapa: number): boolean => {
    if (!progress) return false;
    switch (etapa) {
      case 1: return progress.cimientos_completado;
      case 2: return progress.defensor_completado;
      case 3: return progress.debatidor_completado;
      case 4: return progress.misionero_completado;
      case 5: return progress.apostol_completado;
      default: return false;
    }
  };

  const isStageUnlocked = (etapa: number): boolean => {
    if (!progress) return etapa === 1;
    return etapa <= progress.etapa_actual;
  };

  const checkStageCompletion = async (etapa: number) => {
    const stageProgress = getStageProgress(etapa);
    if (stageProgress < 100) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const stage = STAGES.find(s => s.numero === etapa);
      if (!stage) return;

      const updateField = {
        1: 'cimientos_completado',
        2: 'defensor_completado',
        3: 'debatidor_completado',
        4: 'misionero_completado',
        5: 'apostol_completado',
      }[etapa];

      if (!updateField) return;

      // Mark stage as completed and unlock next
      await supabase
        .from('apostle_path_progress')
        .update({
          [updateField]: true,
          etapa_actual: Math.min(etapa + 1, 5),
          puntos_ruta: (progress?.puntos_ruta || 0) + stage.recompensa_puntos,
        })
        .eq('user_id', user.id);

      // Award achievement
      const { data: achievement } = await supabase
        .from('achievements')
        .select('id')
        .eq('codigo', stage.badge_codigo)
        .single();

      if (achievement) {
        await supabase.from('user_achievements').insert({
          user_id: user.id,
          achievement_id: achievement.id,
        });
      }

      toast({
        title: `🎉 ¡Etapa ${stage.nombre} Completada!`,
        description: `Ganaste ${stage.recompensa_puntos} puntos y el badge "${stage.nombre}"`,
      });

      await fetchProgress();
    } catch (error) {
      console.error('Error checking stage completion:', error);
    }
  };

  const getAIReflection = async (etapa: number, tipo: 'reflexion' | 'quiz' | 'analisis' | 'consejo') => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('apostle-path-ai', {
        body: {
          etapa,
          tipo,
          progress: progress,
          activitiesCompleted: activities.length,
        },
      });

      if (error) throw error;
      setAiReflection(data.reflection || data.message);
      return data.reflection || data.message;
    } catch (error) {
      console.error('Error getting AI reflection:', error);
      toast({
        title: 'Error',
        description: 'No se pudo obtener la reflexión de IA',
        variant: 'destructive',
      });
      return null;
    } finally {
      setAiLoading(false);
    }
  };

  const getCurrentStage = (): Stage | undefined => {
    return STAGES.find(s => s.numero === (progress?.etapa_actual || 1));
  };

  const getNextActivity = (): { stage: Stage; requirement: StageRequirement } | null => {
    const currentStage = getCurrentStage();
    if (!currentStage) return null;

    for (const req of currentStage.requisitos) {
      const activityId = req.id || req.titulo.toLowerCase().replace(/\s+/g, '-');
      if (!isActivityCompleted(currentStage.numero, req.tipo, activityId)) {
        return { stage: currentStage, requirement: req };
      }
    }

    return null;
  };

  const getCompletedActivityIds = (etapa: number): string[] => {
    const stage = STAGES.find(s => s.numero === etapa);
    if (!stage) return [];

    const completedIds: string[] = [];
    for (const req of stage.requisitos) {
      const activityId = req.id || req.titulo.toLowerCase().replace(/\s+/g, '-');
      if (isActivityCompleted(etapa, req.tipo, activityId)) {
        completedIds.push(activityId);
      }
    }
    return completedIds;
  };

  return {
    progress,
    activities,
    loading,
    aiReflection,
    aiLoading,
    stages: STAGES,
    fetchProgress,
    completeActivity,
    getStageActivities,
    isActivityCompleted,
    getStageProgress,
    isStageCompleted,
    isStageUnlocked,
    checkStageCompletion,
    getAIReflection,
    getCurrentStage,
    getNextActivity,
    getCompletedActivityIds,
    lessonProgress,
  };
};
