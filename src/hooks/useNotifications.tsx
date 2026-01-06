import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReminderSettings {
  enabled: boolean;
  hour: string;
}

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if notifications are supported
    if ("Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      toast({
        title: "No soportado",
        description: "Tu navegador no soporta notificaciones",
        variant: "destructive",
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        toast({
          title: "Notificaciones activadas",
          description: "Recibirás recordatorios para tus novenas",
        });
        return true;
      } else {
        toast({
          title: "Permiso denegado",
          description: "No podrás recibir recordatorios",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  };

  const showNotification = useCallback((title: string, body: string, onClick?: () => void) => {
    if (permission !== "granted") return;

    const notification = new Notification(title, {
      body,
      icon: "/favicon.ico",
      tag: "novena-reminder",
    });

    if (onClick) {
      notification.onclick = () => {
        window.focus();
        onClick();
        notification.close();
      };
    }

    // Auto close after 10 seconds
    setTimeout(() => notification.close(), 10000);
  }, [permission]);

  const saveReminderPreference = async (novenaId: string, enabled: boolean, hora: string = "20:00") => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from("user_novena_progress")
        .update({
          recordatorio_activo: enabled,
          hora_recordatorio: hora,
        })
        .eq("novena_id", novenaId)
        .eq("user_id", user.id);

      if (error) throw error;

      if (enabled) {
        toast({
          title: "Recordatorio activado",
          description: `Te recordaremos a las ${hora} cada día`,
        });
      } else {
        toast({
          title: "Recordatorio desactivado",
          description: "No recibirás más recordatorios para esta novena",
        });
      }

      return true;
    } catch (error) {
      console.error("Error saving reminder preference:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la preferencia",
        variant: "destructive",
      });
      return false;
    }
  };

  // Check for pending novena reminders
  const checkPendingReminders = useCallback(async () => {
    if (permission !== "granted") return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: progress } = await supabase
        .from("user_novena_progress")
        .select(`
          *,
          novenas:novena_id (titulo)
        `)
        .eq("user_id", user.id)
        .eq("completada", false)
        .eq("recordatorio_activo", true);

      if (!progress || progress.length === 0) return;

      // Check if we should show a reminder (once per day)
      const today = new Date().toISOString().split("T")[0];
      const lastReminderKey = `lastReminder_${today}`;
      
      if (localStorage.getItem(lastReminderKey)) return;

      // Check each novena for pending days
      for (const p of progress) {
        const lastActivity = new Date(p.ultima_actividad).toISOString().split("T")[0];
        
        if (lastActivity !== today) {
          const novenaTitle = (p as any).novenas?.titulo || "tu novena";
          showNotification(
            "¡Es hora de orar! 🙏",
            `Continúa con el día ${p.dia_actual} de ${novenaTitle}`,
            () => {
              window.location.href = "/novenas";
            }
          );
          
          localStorage.setItem(lastReminderKey, "true");
          break; // Only show one reminder at a time
        }
      }
    } catch (error) {
      console.error("Error checking reminders:", error);
    }
  }, [permission, showNotification]);

  // Set up reminder check interval
  useEffect(() => {
    if (permission !== "granted") return;

    // Check immediately on load
    checkPendingReminders();

    // Check every hour
    const interval = setInterval(checkPendingReminders, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [permission, checkPendingReminders]);

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    saveReminderPreference,
    checkPendingReminders,
  };
};
