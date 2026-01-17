import { useNavigate } from "react-router-dom";
import { BookOpen, ChevronRight, Clock, Target, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface NextStepCardProps {
  currentLevel?: number;
  completedLessons?: number;
  totalLessons?: number;
}

const getLevelData = (level: number) => {
  const levels = [
    {
      name: "El Curioso",
      description: "Comenzando a explorar los fundamentos de la fe",
      nextLesson: "¿Qué es la apologética?",
      lessonDescription: "Descubre el arte de dar razón de tu esperanza",
      estimatedTime: 15,
      icon: "🔍",
    },
    {
      name: "El Estudiante", 
      description: "Aprendiendo los argumentos fundamentales",
      nextLesson: "Los grandes apologistas de la historia",
      lessonDescription: "Conoce a los maestros que defendieron la fe",
      estimatedTime: 20,
      icon: "📚",
    },
    {
      name: "El Practicante",
      description: "Practicando el diálogo respetuoso",
      nextLesson: "Tu primera conversación difícil",
      lessonDescription: "Técnicas para un diálogo efectivo y amoroso",
      estimatedTime: 25,
      icon: "💬",
    },
    {
      name: "El Apologista",
      description: "Defendiendo con conocimiento profundo",
      nextLesson: "Argumentos avanzados",
      lessonDescription: "Profundiza en temas complejos de la fe",
      estimatedTime: 30,
      icon: "🎓",
    },
    {
      name: "El Maestro",
      description: "Formando a otros en la defensa de la fe",
      nextLesson: "Cómo enseñar apologética",
      lessonDescription: "Transmite tu conocimiento a otros",
      estimatedTime: 35,
      icon: "✨",
    },
  ];
  
  const index = Math.min(Math.floor((level - 1) / 5), levels.length - 1);
  return levels[index];
};

export function NextStepCard({ 
  currentLevel = 1, 
  completedLessons = 0,
  totalLessons = 10 
}: NextStepCardProps) {
  const navigate = useNavigate();
  const levelData = getLevelData(currentLevel);
  const progress = (completedLessons / totalLessons) * 100;

  return (
    <motion.section 
      className="px-5 py-2 lg:px-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <motion.div 
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/95 via-primary to-primary/90 border border-secondary/20 p-5 lg:p-6"
        whileHover={{ scale: 1.005 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary/5 rounded-full blur-2xl" />
        
        {/* Sparkle animation */}
        <motion.div 
          className="absolute top-4 right-4"
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Sparkles className="w-5 h-5 text-secondary/50" />
        </motion.div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center text-2xl">
                {levelData.icon}
              </div>
              <div>
                <p className="text-secondary/80 text-xs font-medium uppercase tracking-wider">
                  Tu próximo paso
                </p>
                <h3 className="font-heading text-lg font-bold text-white">
                  {levelData.name}
                </h3>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
              <Target className="w-3.5 h-3.5 text-secondary" />
              <span className="text-xs font-medium text-white/80">Nivel {currentLevel}</span>
            </div>
          </div>

          {/* Next Lesson Info */}
          <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white text-sm mb-1">
                  {levelData.nextLesson}
                </h4>
                <p className="text-white/60 text-xs line-clamp-2">
                  {levelData.lessonDescription}
                </p>
              </div>
              <div className="flex items-center gap-1 text-white/50">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs">{levelData.estimatedTime} min</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-white/60">Progreso del nivel</span>
              <span className="text-secondary font-medium">{completedLessons}/{totalLessons} lecciones</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/10" />
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => navigate("/library")}
            className="w-full bg-secondary hover:bg-secondary-hover text-primary font-semibold rounded-xl py-3 transition-all group"
          >
            <span>Continuar Formación</span>
            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </motion.div>
    </motion.section>
  );
}