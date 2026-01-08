import { useState } from "react";
import { Bell, BellOff, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

type PracticeType = 'laudes' | 'rosario' | 'examen' | 'biblia' | 'gratitud';

interface ReminderButtonProps {
  practice: PracticeType;
  variant?: 'icon' | 'full';
  className?: string;
}

const PRACTICE_LABELS: Record<PracticeType, string> = {
  laudes: 'Ritual Matutino',
  rosario: 'Santo Rosario',
  examen: 'Examen de Conciencia',
  biblia: 'Lectura Bíblica',
  gratitud: 'Diario de Gratitud',
};

const PRACTICE_DEFAULTS: Record<PracticeType, string> = {
  laudes: '07:00',
  rosario: '12:00',
  examen: '21:00',
  biblia: '08:00',
  gratitud: '22:00',
};

export function ReminderButton({ practice, variant = 'icon', className }: ReminderButtonProps) {
  const [open, setOpen] = useState(false);
  const [localHour, setLocalHour] = useState(PRACTICE_DEFAULTS[practice]);
  
  const { 
    isSupported, 
    permission, 
    requestPermission, 
    practiceReminders,
    savePracticeReminder 
  } = useNotifications();

  const reminder = practiceReminders.find(p => p.practice === practice);
  const isEnabled = reminder?.enabled || false;
  const currentHour = reminder?.hour || PRACTICE_DEFAULTS[practice];

  const handleOpen = () => {
    setLocalHour(currentHour);
    setOpen(true);
  };

  const handleToggle = async (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }
    
    savePracticeReminder(practice, enabled, localHour);
  };

  const handleSaveHour = () => {
    savePracticeReminder(practice, isEnabled, localHour);
    setOpen(false);
  };

  if (variant === 'icon') {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleOpen}
          className={cn("rounded-full relative", className)}
          title={`Recordatorio: ${PRACTICE_LABELS[practice]}`}
        >
          {isEnabled ? (
            <>
              <Bell className="h-5 w-5 text-primary" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
            </>
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Recordatorio
              </DialogTitle>
              <DialogDescription>
                {PRACTICE_LABELS[practice]}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {!isSupported && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                  Tu navegador no soporta notificaciones
                </div>
              )}
              
              {permission === 'denied' && (
                <div className="bg-amber-500/10 text-amber-600 p-3 rounded-lg text-sm">
                  Has bloqueado las notificaciones. Actívalas en la configuración del navegador.
                </div>
              )}
              
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <Label htmlFor="reminder-toggle" className="font-medium cursor-pointer">
                  Activar recordatorio
                </Label>
                <Switch
                  id="reminder-toggle"
                  checked={isEnabled}
                  onCheckedChange={handleToggle}
                  disabled={!isSupported || permission === 'denied'}
                />
              </div>
              
              {isEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="reminder-hour" className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Hora del recordatorio
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="reminder-hour"
                      type="time"
                      value={localHour}
                      onChange={(e) => setLocalHour(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleSaveHour}>
                      Guardar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Full variant
  return (
    <Button
      variant={isEnabled ? "default" : "outline"}
      size="sm"
      onClick={handleOpen}
      className={cn("gap-2", className)}
    >
      {isEnabled ? (
        <>
          <Bell className="h-4 w-4" />
          <span>{currentHour}</span>
        </>
      ) : (
        <>
          <BellOff className="h-4 w-4" />
          <span>Recordatorio</span>
        </>
      )}
    </Button>
  );
}
