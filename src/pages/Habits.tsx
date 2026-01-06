import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Target, Flame, Award, Check, BookOpen, Heart, Users, Coffee, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, isToday, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";

interface Habit {
  id: string;
  tipo: string;
  meta_semanal: number;
  racha_actual: number;
  racha_maxima: number;
  ultima_actividad: string | null;
}

interface HabitLog {
  id: string;
  habit_id: string;
  fecha: string;
  completado: boolean;
  notas: string | null;
}

const habitIcons = {
  oracion: BookOpen,
  gratitud: Heart,
  servicio: Users,
  lectura_biblica: BookOpen,
  descanso: Moon,
};

const habitLabels = {
  oracion: "Oración",
  gratitud: "Gratitud",
  servicio: "Servicio",
  lectura_biblica: "Lectura Bíblica",
  descanso: "Descanso",
};

const habitDevotionals = {
  oracion: "\"Oren sin cesar.\" - 1 Tesalonicenses 5:17. La oración es tu respiración espiritual.",
  gratitud: "\"Dad gracias en todo.\" - 1 Tesalonicenses 5:18. La gratitud transforma tu perspectiva.",
  servicio: "\"Sírvanse unos a otros con amor.\" - Gálatas 5:13. El servicio refleja el corazón de Cristo.",
  lectura_biblica: "\"Tu palabra es lámpara a mis pies.\" - Salmos 119:105. La Palabra ilumina tu camino.",
  descanso: "\"Vengan a mí... y yo les daré descanso.\" - Mateo 11:28. El descanso es un regalo de Dios.",
};

const Habits = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [notes, setNotes] = useState("");
  const [showDevotional, setShowDevotional] = useState("");

  useEffect(() => {
    checkAuth();
    loadHabits();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadHabits = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Get or create habits
    const { data: existingHabits } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", session.user.id);

    if (!existingHabits || existingHabits.length === 0) {
      // Create default habits
      const defaultHabits: Array<"oracion" | "gratitud" | "servicio" | "lectura_biblica" | "descanso"> = 
        ["oracion", "gratitud", "servicio", "lectura_biblica", "descanso"];
      const newHabits = defaultHabits.map(tipo => ({
        user_id: session.user.id,
        tipo,
        meta_semanal: 7,
      }));

      const { data: created } = await supabase
        .from("habits")
        .insert(newHabits)
        .select();

      setHabits(created || []);
    } else {
      setHabits(existingHabits);
    }

    // Get logs for current week
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    const { data: weekLogs } = await supabase
      .from("habit_logs")
      .select("*")
      .gte("fecha", format(weekStart, "yyyy-MM-dd"))
      .lte("fecha", format(weekEnd, "yyyy-MM-dd"));

    setLogs(weekLogs || []);
    setLoading(false);
  };

  const toggleHabit = async (habit: Habit) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const existingLog = logs.find(
      (log) => log.habit_id === habit.id && log.fecha === today
    );

    if (existingLog) {
      // Toggle existing log
      const { error } = await supabase
        .from("habit_logs")
        .update({ completado: !existingLog.completado })
        .eq("id", existingLog.id);

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo actualizar el hábito",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Create new log
      const { error } = await supabase
        .from("habit_logs")
        .insert({
          habit_id: habit.id,
          fecha: today,
          completado: true,
        });

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo marcar el hábito",
          variant: "destructive",
        });
        return;
      }

      // Show devotional
      setShowDevotional(habit.tipo);
    }

    // Update streak
    const newRacha = habit.racha_actual + 1;
    await supabase
      .from("habits")
      .update({
        racha_actual: newRacha,
        racha_maxima: Math.max(newRacha, habit.racha_maxima),
        ultima_actividad: today,
      })
      .eq("id", habit.id);

    loadHabits();

    toast({
      title: "¡Bien hecho!",
      description: `Hábito completado. Racha: ${newRacha} días`,
    });
  };

  const saveNotes = async () => {
    if (!selectedHabit || !notes.trim()) return;

    const today = format(new Date(), "yyyy-MM-dd");
    const existingLog = logs.find(
      (log) => log.habit_id === selectedHabit.id && log.fecha === today
    );

    if (existingLog) {
      await supabase
        .from("habit_logs")
        .update({ notas: notes })
        .eq("id", existingLog.id);
    }

    toast({
      title: "Notas guardadas",
      description: "Tus reflexiones han sido guardadas",
    });

    setSelectedHabit(null);
    setNotes("");
  };

  const isHabitCompletedToday = (habitId: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const log = logs.find((l) => l.habit_id === habitId && l.fecha === today);
    return log?.completado || false;
  };

  const getWeekProgress = (habitId: string) => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const completedDays = weekDays.filter((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const log = logs.find((l) => l.habit_id === habitId && l.fecha === dateStr);
      return log?.completado;
    }).length;

    return completedDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Target className="w-12 h-12 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary/60" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-5" />
        
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 container mx-auto px-4 py-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="glass-button text-foreground hover:bg-background/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary/20 backdrop-blur-sm flex items-center justify-center">
              <Target className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold text-white">Hábitos de Luz</h1>
              <p className="text-white/80">Mantén tu disciplina espiritual diaria</p>
            </div>
          </div>
        </motion.header>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-4xl -mt-4 relative z-10">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {habits.map((habit, index) => {
            const Icon = habitIcons[habit.tipo as keyof typeof habitIcons];
            const completed = isHabitCompletedToday(habit.id);
            const weekProgress = getWeekProgress(habit.id);
            const progressPercent = (weekProgress / habit.meta_semanal) * 100;

            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <Card className={`glass-card border-border/50 ${completed ? "ring-2 ring-secondary shadow-glow" : ""}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        completed ? "bg-secondary/20" : "bg-primary/10"
                      }`}>
                        <Icon className={`w-6 h-6 ${completed ? "text-secondary" : "text-primary"}`} />
                      </div>
                      {habit.racha_actual > 0 && (
                        <Badge variant="secondary" className="gap-1">
                          <Flame className="w-3 h-3" />
                          {habit.racha_actual}
                        </Badge>
                      )}
                    </div>
                    <CardTitle>{habitLabels[habit.tipo as keyof typeof habitLabels]}</CardTitle>
                    <CardDescription>
                      {weekProgress} de {habit.meta_semanal} esta semana
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Progress value={progressPercent} className="h-2" />
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => toggleHabit(habit)}
                        disabled={completed}
                        className={`flex-1 ${completed ? "" : "shadow-glow"}`}
                        variant={completed ? "secondary" : "default"}
                      >
                        {completed ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Completado
                          </>
                        ) : (
                          "Marcar"
                        )}
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="glass-button"
                            onClick={() => {
                              setSelectedHabit(habit);
                              const today = format(new Date(), "yyyy-MM-dd");
                              const log = logs.find(
                                (l) => l.habit_id === habit.id && l.fecha === today
                              );
                              setNotes(log?.notas || "");
                            }}
                          >
                            <BookOpen className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-background/95 backdrop-blur-xl border-border/50">
                          <DialogHeader>
                            <DialogTitle>Reflexión de Hoy</DialogTitle>
                            <DialogDescription>
                              Escribe tus pensamientos sobre este hábito
                            </DialogDescription>
                          </DialogHeader>
                          <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="¿Qué aprendiste hoy? ¿Por qué estás agradecido?"
                            rows={4}
                            className="glass-button bg-background/50"
                          />
                          <Button onClick={saveNotes} className="shadow-glow">Guardar Reflexión</Button>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {habit.racha_maxima > 0 && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Racha máxima: {habit.racha_maxima} días
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Devotional Dialog */}
        <Dialog open={!!showDevotional} onOpenChange={() => setShowDevotional("")}>
          <DialogContent className="bg-background/95 backdrop-blur-xl border-border/50">
            <DialogHeader>
              <DialogTitle>¡Excelente trabajo!</DialogTitle>
              <DialogDescription>
                Has completado tu hábito de {habitLabels[showDevotional as keyof typeof habitLabels]?.toLowerCase()}
              </DialogDescription>
            </DialogHeader>
            <div className="glass-card p-4 rounded-lg">
              <p className="text-sm italic">
                {habitDevotionals[showDevotional as keyof typeof habitDevotionals]}
              </p>
            </div>
            <Button onClick={() => setShowDevotional("")} className="shadow-glow">Continuar</Button>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Habits;
