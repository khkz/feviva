import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Sun, 
  Moon, 
  BookOpen, 
  Church,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Flame
} from "lucide-react";

interface Mission {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  points: number;
  timeOfDay: "morning" | "afternoon" | "evening" | "anytime";
}

const missions: Mission[] = [
  {
    id: "matutino",
    title: "Ritual Matutino",
    description: "Comienza tu día con oración y reflexión",
    icon: <Sun className="w-5 h-5" />,
    path: "/morning",
    points: 30,
    timeOfDay: "morning"
  },
  {
    id: "rosario",
    title: "Rosario del Día",
    description: "Medita los misterios con María",
    icon: <Church className="w-5 h-5" />,
    path: "/rosario",
    points: 50,
    timeOfDay: "anytime"
  },
  {
    id: "lectura",
    title: "Lectura Bíblica",
    description: "Continúa tu plan de lectura",
    icon: <BookOpen className="w-5 h-5" />,
    path: "/bible-plan",
    points: 25,
    timeOfDay: "afternoon"
  },
  {
    id: "nocturno",
    title: "Examen Nocturno",
    description: "Reflexiona sobre tu día",
    icon: <Moon className="w-5 h-5" />,
    path: "/evening",
    points: 30,
    timeOfDay: "evening"
  }
];

const getTimeOfDay = (): "morning" | "afternoon" | "evening" => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening";
};

const getRecommendedMission = (): Mission => {
  const timeOfDay = getTimeOfDay();
  const recommended = missions.find(m => m.timeOfDay === timeOfDay);
  return recommended || missions.find(m => m.timeOfDay === "anytime") || missions[0];
};

interface DailyMissionProps {
  completedToday?: string[];
}

export const DailyMission = ({ completedToday = [] }: DailyMissionProps) => {
  const navigate = useNavigate();
  const [mission, setMission] = useState<Mission>(getRecommendedMission());
  const [isCompleted, setIsCompleted] = useState(false);
  
  const completedCount = completedToday.length;
  const totalMissions = 4;
  const progressPercent = (completedCount / totalMissions) * 100;

  useEffect(() => {
    const recommended = getRecommendedMission();
    // If recommended is completed, find next incomplete
    if (completedToday.includes(recommended.id)) {
      const nextMission = missions.find(m => !completedToday.includes(m.id));
      if (nextMission) {
        setMission(nextMission);
      } else {
        setIsCompleted(true);
      }
    } else {
      setMission(recommended);
    }
  }, [completedToday]);

  const timeGreeting = () => {
    const time = getTimeOfDay();
    if (time === "morning") return "Buenos días";
    if (time === "afternoon") return "Buenas tardes";
    return "Buenas noches";
  };

  if (isCompleted) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 lg:px-0 mb-6"
      >
        <Card className="overflow-hidden bg-gradient-to-br from-secondary/20 to-primary/10 border-secondary/30">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-secondary/20">
                <CheckCircle2 className="w-8 h-8 text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
                  ¡Misiones Completadas!
                  <Sparkles className="w-5 h-5 text-secondary" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  Has completado todas las prácticas de hoy. ¡Excelente trabajo!
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">{completedCount}/{totalMissions} prácticas</span>
                <span className="text-secondary font-semibold flex items-center gap-1">
                  <Flame className="w-4 h-4" />
                  ¡Racha activa!
                </span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-5 lg:px-0 mb-6"
    >
      <Card className="overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 hover:border-primary/40 transition-colors">
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary text-primary-foreground">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm text-muted-foreground">{timeGreeting()}</span>
                <h3 className="font-heading font-bold text-foreground">
                  Tu Misión del Momento
                </h3>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Progreso</span>
              <span className="text-sm font-semibold text-primary">{completedCount}/{totalMissions}</span>
            </div>
          </div>

          {/* Progress bar */}
          <Progress value={progressPercent} className="h-1.5 mb-4" />

          {/* Mission Card */}
          <div 
            className="p-4 rounded-xl bg-card border border-border cursor-pointer hover:border-primary/50 transition-all group"
            onClick={() => navigate(mission.path)}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {mission.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {mission.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {mission.description}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-semibold text-secondary flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  +{mission.points} XP
                </span>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 mt-4">
            <Button 
              variant="default"
              size="sm"
              className="flex-1 bg-primary hover:bg-primary-hover"
              onClick={() => navigate(mission.path)}
            >
              Comenzar ahora
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => {
                const idx = missions.findIndex(m => m.id === mission.id);
                const nextIdx = (idx + 1) % missions.length;
                setMission(missions[nextIdx]);
              }}
            >
              Otra misión
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
};

export default DailyMission;
