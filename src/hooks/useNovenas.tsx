import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NovenaDia {
  dia: number;
  titulo: string;
  oracion: string;
  reflexion: string;
}

export interface Novena {
  id: string;
  titulo: string;
  descripcion: string;
  intencion: string;
  dias: NovenaDia[];
  imagen_url: string | null;
  categoria: string;
  orden: number;
}

export interface UserNovenaProgress {
  id: string;
  user_id: string;
  novena_id: string;
  dia_actual: number;
  dias_completados: number[];
  fecha_inicio: string;
  ultima_actividad: string;
  completada: boolean;
}

export const useNovenas = () => {
  const [novenas, setNovenas] = useState<Novena[]>([]);
  const [userProgress, setUserProgress] = useState<UserNovenaProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNovenas();
    fetchUserProgress();
  }, []);

  const fetchNovenas = async () => {
    try {
      const { data, error } = await supabase
        .from("novenas")
        .select("*")
        .order("orden", { ascending: true });

      if (error) throw error;
      
      const formattedNovenas = (data || []).map(novena => ({
        ...novena,
        dias: Array.isArray(novena.dias) ? novena.dias : JSON.parse(novena.dias as string)
      })) as Novena[];
      
      setNovenas(formattedNovenas);
    } catch (error) {
      console.error("Error fetching novenas:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_novena_progress")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      
      const formattedProgress = (data || []).map(progress => ({
        ...progress,
        dias_completados: Array.isArray(progress.dias_completados) 
          ? progress.dias_completados 
          : JSON.parse(progress.dias_completados as string)
      })) as UserNovenaProgress[];
      
      setUserProgress(formattedProgress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
    }
  };

  const startNovena = async (novenaId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Inicia sesión",
          description: "Debes iniciar sesión para comenzar una novena",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from("user_novena_progress")
        .upsert({
          user_id: user.id,
          novena_id: novenaId,
          dia_actual: 1,
          dias_completados: [],
          fecha_inicio: new Date().toISOString().split("T")[0],
          ultima_actividad: new Date().toISOString(),
          completada: false,
        }, {
          onConflict: 'user_id,novena_id'
        })
        .select()
        .single();

      if (error) throw error;

      await fetchUserProgress();
      
      toast({
        title: "¡Novena iniciada!",
        description: "Que Dios te bendiga en estos 9 días de oración",
      });

      return data;
    } catch (error) {
      console.error("Error starting novena:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la novena",
        variant: "destructive",
      });
      return null;
    }
  };

  const completeDia = async (novenaId: string, diaNum: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const progress = userProgress.find(p => p.novena_id === novenaId);
      if (!progress) return;

      const newDiasCompletados = [...progress.dias_completados];
      if (!newDiasCompletados.includes(diaNum)) {
        newDiasCompletados.push(diaNum);
      }

      const nextDia = diaNum < 9 ? diaNum + 1 : 9;
      const completada = newDiasCompletados.length === 9;

      const { error } = await supabase
        .from("user_novena_progress")
        .update({
          dia_actual: nextDia,
          dias_completados: newDiasCompletados,
          ultima_actividad: new Date().toISOString(),
          completada,
        })
        .eq("id", progress.id);

      if (error) throw error;

      await fetchUserProgress();

      if (completada) {
        toast({
          title: "¡Novena completada!",
          description: "Has completado los 9 días. ¡Que Dios escuche tus oraciones!",
        });
      } else {
        toast({
          title: `Día ${diaNum} completado`,
          description: `Continúa mañana con el día ${nextDia}`,
        });
      }
    } catch (error) {
      console.error("Error completing day:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el progreso",
        variant: "destructive",
      });
    }
  };

  const getProgressForNovena = (novenaId: string) => {
    return userProgress.find(p => p.novena_id === novenaId);
  };

  return {
    novenas,
    userProgress,
    loading,
    startNovena,
    completeDia,
    getProgressForNovena,
    refetch: fetchUserProgress,
    refetchNovenas: fetchNovenas,
  };
};
