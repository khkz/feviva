import { useState } from "react";
import { Bell, BellOff, Clock, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function PracticeRemindersCard() {
  const {
    isSupported,
    permission,
    requestPermission,
    practiceReminders,
    savePracticeReminder,
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [editingPractice, setEditingPractice] = useState<string | null>(null);
  const [editHour, setEditHour] = useState("");

  const handleToggle = async (practice: string, currentEnabled: boolean) => {
    // Request permission but don't block if denied
    if (permission !== "granted" && !currentEnabled) {
      await requestPermission();
    }

    // Always allow saving the reminder preference
    const reminder = practiceReminders.find(r => r.practice === practice);
    if (reminder) {
      savePracticeReminder(practice, !currentEnabled, reminder.hour);
    }
  };

  const handleSaveHour = (practice: string) => {
    const reminder = practiceReminders.find(r => r.practice === practice);
    if (reminder && editHour) {
      savePracticeReminder(practice, reminder.enabled, editHour);
    }
    setEditingPractice(null);
  };

  const enabledCount = practiceReminders.filter(r => r.enabled).length;

  const practiceIcons: Record<string, string> = {
    laudes: "☀️",
    rosario: "🙏",
    examen: "🌙",
    biblia: "📖",
    gratitud: "❤️",
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.button
          className="w-full px-5 py-3 lg:px-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-border/50 p-4 hover:border-primary/30 transition-colors cursor-pointer">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Recordatorios</h3>
                  <p className="text-xs text-muted-foreground">
                    {enabledCount > 0 
                      ? `${enabledCount} práctica${enabledCount > 1 ? 's' : ''} configurada${enabledCount > 1 ? 's' : ''}`
                      : "Configura tus notificaciones"
                    }
                  </p>
                </div>
              </div>
              <Settings className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </motion.button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Recordatorios de Prácticas
          </DialogTitle>
        </DialogHeader>

        {!isSupported && (
          <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
            Tu navegador no soporta notificaciones push.
          </div>
        )}

        {isSupported && permission === "denied" && (
          <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
            Las notificaciones están bloqueadas. Habilítalas en la configuración de tu navegador.
          </div>
        )}

        <div className="space-y-3">
          <AnimatePresence>
            {practiceReminders.map((reminder, index) => (
              <motion.div
                key={reminder.practice}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{practiceIcons[reminder.practice]}</span>
                  <div>
                    <p className="font-medium text-sm">{reminder.label}</p>
                    {editingPractice === reminder.practice ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="time"
                          value={editHour}
                          onChange={(e) => setEditHour(e.target.value)}
                          className="h-7 w-24 text-xs"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="px-2 text-xs"
                          onClick={() => handleSaveHour(reminder.practice)}
                        >
                          Guardar
                        </Button>
                      </div>
                    ) : (
                      <button
                        className="flex min-h-11 items-center gap-1 px-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                        onClick={() => {
                          setEditingPractice(reminder.practice);
                          setEditHour(reminder.hour);
                        }}
                      >
                        <Clock className="w-3 h-3" />
                        {reminder.hour}
                      </button>
                    )}
                  </div>
                </div>

                <Switch
                  checked={reminder.enabled}
                  onCheckedChange={() => handleToggle(reminder.practice, reminder.enabled)}
                  disabled={!isSupported || permission === "denied"}
                  aria-label={`${reminder.enabled ? "Desactivar" : "Activar"} recordatorio de ${reminder.practice}`}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {permission !== "granted" && isSupported && (
          <Button 
            onClick={requestPermission} 
            className="w-full mt-2"
            variant="outline"
          >
            <Bell className="w-4 h-4 mr-2" />
            Permitir notificaciones
          </Button>
        )}

        <p className="text-xs text-muted-foreground text-center mt-2">
          Las notificaciones solo funcionan cuando la app está abierta en tu navegador.
        </p>
      </DialogContent>
    </Dialog>
  );
}
