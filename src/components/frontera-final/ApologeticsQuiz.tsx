import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, XCircle, Trophy, RotateCcw, Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: '¿Quién propuso la teoría del Big Bang?',
    options: ['Albert Einstein', 'Georges Lemaître', 'Stephen Hawking', 'Isaac Newton'],
    correctIndex: 1,
    explanation: 'Georges Lemaître, un sacerdote católico belga, propuso la teoría del "átomo primordial" en 1927, que hoy conocemos como el Big Bang.',
  },
  {
    id: 'q2',
    question: '¿En qué año se fundó el Observatorio Vaticano?',
    options: ['1582', '1891', '1969', '1750'],
    correctIndex: 1,
    explanation: 'El Observatorio Vaticano (Specola Vaticana) fue fundado en 1891 por el Papa León XIII.',
  },
  {
    id: 'q3',
    question: '¿Qué dijo el Papa Francisco sobre bautizar extraterrestres?',
    options: [
      'Sería imposible',
      'Si lo pidieran, sí los bautizaría',
      'Solo si son humanoides',
      'No ha hablado del tema'
    ],
    correctIndex: 1,
    explanation: 'En 2014, el Papa Francisco dijo que si llegaran marcianos pidiendo el bautismo, él los bautizaría: "¿Quiénes somos nosotros para cerrar las puertas?"',
  },
  {
    id: 'q4',
    question: '¿Qué es el "Punto Omega" según Teilhard de Chardin?',
    options: [
      'El fin del universo',
      'Un agujero negro',
      'La convergencia final hacia Cristo',
      'Una constelación'
    ],
    correctIndex: 2,
    explanation: 'Teilhard de Chardin, sacerdote jesuita y paleontólogo, propuso que la evolución cósmica converge hacia un "Punto Omega" identificado con Cristo.',
  },
  {
    id: 'q5',
    question: '¿Cuántos cráteres lunares llevan nombres de jesuitas científicos?',
    options: ['5', '15', '25', '35'],
    correctIndex: 3,
    explanation: '35 cráteres lunares llevan nombres de científicos jesuitas, testimonio de su contribución a la astronomía.',
  },
  {
    id: 'q6',
    question: 'Según la Iglesia, ¿puede una IA tener alma?',
    options: [
      'Sí, si es suficientemente avanzada',
      'No, el alma es un don exclusivo de Dios',
      'Depende del tipo de IA',
      'La Iglesia no tiene posición'
    ],
    correctIndex: 1,
    explanation: 'La Iglesia enseña que el alma es creada directamente por Dios para cada ser humano. La IA, por compleja que sea, procesa información pero no tiene experiencia subjetiva ni relación con lo trascendente.',
  },
  {
    id: 'q7',
    question: '¿Qué encíclica habla sobre el cuidado de la creación y sería relevante para la colonización espacial?',
    options: ['Laudato Si\'', 'Fides et Ratio', 'Rerum Novarum', 'Humanae Vitae'],
    correctIndex: 0,
    explanation: 'Laudato Si\' (2015) del Papa Francisco habla sobre nuestra responsabilidad como custodios de la creación, aplicable también al cosmos.',
  },
  {
    id: 'q8',
    question: '¿Qué es el "Libro de la Naturaleza" en la tradición católica?',
    options: [
      'Un texto apócrifo',
      'La creación como revelación de Dios',
      'El Génesis',
      'Una enciclopedia medieval'
    ],
    correctIndex: 1,
    explanation: 'San Agustín y otros Padres de la Iglesia veían la creación como un "libro" donde Dios se revela junto con la Escritura.',
  },
  {
    id: 'q9',
    question: '¿Dónde se encuentra actualmente el telescopio principal del Observatorio Vaticano?',
    options: ['Ciudad del Vaticano', 'Monte Graham, Arizona', 'Castel Gandolfo', 'Jerusalén'],
    correctIndex: 1,
    explanation: 'El Vatican Advanced Technology Telescope (VATT) está en el Monte Graham, Arizona, debido a mejores condiciones de observación.',
  },
  {
    id: 'q10',
    question: '¿Qué afirma la encíclica "Humani Generis" sobre la evolución?',
    options: [
      'La prohíbe totalmente',
      'Permite investigarla para el cuerpo, afirmando la creación directa del alma',
      'La acepta sin restricciones',
      'No menciona la evolución'
    ],
    correctIndex: 1,
    explanation: 'Humani Generis (1950) de Pío XII permite investigar la evolución del cuerpo humano, pero afirma que cada alma es creada directamente por Dios.',
  },
];

interface ApologeticsQuizProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApologeticsQuiz({ isOpen, onClose }: ApologeticsQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Randomize questions
  const shuffledQuestions = useMemo(() => {
    return [...quizQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
  }, [isOpen]);

  const question = shuffledQuestions[currentQuestion];

  const handleAnswer = (index: number) => {
    if (answered) return;
    
    setSelectedAnswer(index);
    setAnswered(true);
    setShowResult(true);
    
    if (index === question.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setAnswered(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswered(false);
    setQuizCompleted(false);
  };

  const getScoreMessage = () => {
    const percentage = (score / shuffledQuestions.length) * 100;
    if (percentage === 100) return { title: '¡Perfecto!', subtitle: 'Eres un verdadero apologista cósmico', icon: '🌟' };
    if (percentage >= 80) return { title: '¡Excelente!', subtitle: 'Conoces muy bien la fe y la ciencia', icon: '🚀' };
    if (percentage >= 60) return { title: '¡Bien hecho!', subtitle: 'Buen conocimiento, sigue explorando', icon: '✨' };
    if (percentage >= 40) return { title: 'Sigue aprendiendo', subtitle: 'Lee los artículos de Frontera Final', icon: '📚' };
    return { title: 'A seguir estudiando', subtitle: 'Explora la sección para aprender más', icon: '🔭' };
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-xl glass-cyber rounded-3xl border-amber-400/30 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="p-6 text-center border-b border-white/10">
            <Brain className="w-10 h-10 mx-auto text-amber-400 mb-2" />
            <h2 className="font-orbitron text-2xl font-bold text-white">
              Quiz de Apologética Cósmica
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Pon a prueba tus conocimientos
            </p>
          </div>

          {!quizCompleted ? (
            <div className="p-6">
              {/* Progress */}
              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <span>Pregunta {currentQuestion + 1} de {shuffledQuestions.length}</span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  {score} puntos
                </span>
              </div>

              <div className="w-full h-2 bg-slate-800 rounded-full mb-6 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestion + 1) / shuffledQuestions.length) * 100}%` }}
                />
              </div>

              {/* Question */}
              <motion.div
                key={question.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6"
              >
                <h3 className="text-white text-lg font-medium mb-4">
                  {question.question}
                </h3>

                <div className="space-y-3">
                  {question.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === question.correctIndex;
                    const showCorrectness = showResult;

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        disabled={answered}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          showCorrectness
                            ? isCorrect
                              ? 'bg-green-500/20 border-green-500 text-white'
                              : isSelected
                                ? 'bg-red-500/20 border-red-500 text-white'
                                : 'bg-slate-800/50 border-white/10 text-gray-400'
                            : isSelected
                              ? 'bg-cyan-400/20 border-cyan-400 text-white'
                              : 'bg-slate-800/50 border-white/10 text-gray-300 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {showCorrectness && isCorrect && (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          )}
                          {showCorrectness && isSelected && !isCorrect && (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Explanation */}
              <AnimatePresence>
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <div className="glass-cyber rounded-xl p-4 border-amber-400/30">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-300 text-sm">
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Next button */}
              {showResult && (
                <Button
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-cyan-500 to-amber-500 hover:from-cyan-600 hover:to-amber-600 text-white"
                >
                  {currentQuestion < shuffledQuestions.length - 1 ? 'Siguiente' : 'Ver Resultados'}
                </Button>
              )}
            </div>
          ) : (
            /* Results screen */
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="text-6xl mb-4"
              >
                {getScoreMessage().icon}
              </motion.div>

              <h3 className="font-orbitron text-2xl font-bold text-white mb-2">
                {getScoreMessage().title}
              </h3>
              <p className="text-gray-400 mb-6">
                {getScoreMessage().subtitle}
              </p>

              <div className="glass-cyber rounded-xl p-6 mb-6">
                <div className="text-4xl font-orbitron font-bold text-amber-400 mb-2">
                  {score} / {shuffledQuestions.length}
                </div>
                <p className="text-gray-400 text-sm">
                  {Math.round((score / shuffledQuestions.length) * 100)}% de aciertos
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleRestart}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reintentar
                </Button>
                <Button
                  onClick={onClose}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-amber-500"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}