import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, BellOff, Clock } from "lucide-react";
import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  novenaId: string;
  novenaTitulo: string;
  currentEnabled: boolean;
  currentHora: string;
  onSave: (enabled: boolean, hora: string) => void;
}

export const ReminderModal = ({
  isOpen,
  onClose,
  novenaId,
  novenaTitulo,
  currentEnabled,
  currentHora,
  onSave,
}: ReminderModalProps) => {
  const [enabled, setEnabled] = useState(currentEnabled);
  const [hora, setHora] = useState(currentHora || "20:00");
  const { isSupported, permission, requestPermission } = useNotifications();

  const handleToggle = async (value: boolean) => {
    if (value && permission !== "granted") {
      const granted = await requestPermission();
      if (!granted) return;
    }
    setEnabled(value);
  };

  const handleSave = () => {
    onSave(enabled, hora);
    onClose();
  };

  const horasOptions = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
    "20:00", "21:00", "22:00",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Recordatorio Diario
          </DialogTitle>
          <DialogDescription>
            Configura un recordatorio para continuar con tu novena "{novenaTitulo}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!isSupported ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm">
              <BellOff className="h-5 w-5 mb-2" />
              Tu navegador no soporta notificaciones. Intenta desde otro navegador o dispositivo.
            </div>
          ) : (
            <>
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reminder-toggle" className="text-base font-medium">
                    Activar recordatorio
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe una notificación diaria
                  </p>
                </div>
                <Switch
                  id="reminder-toggle"
                  checked={enabled}
                  onCheckedChange={handleToggle}
                />
              </div>

              {/* Time Selector */}
              {enabled && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Hora del recordatorio
                  </Label>
                  <Select value={hora} onValueChange={setHora}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {horasOptions.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Recibirás el recordatorio cuando abras la app cerca de esta hora
                  </p>
                </div>
              )}

              {/* Permission Info */}
              {permission === "denied" && (
                <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 p-3 rounded-lg text-sm">
                  Has bloqueado las notificaciones. Para activar recordatorios, habilita las notificaciones en la configuración de tu navegador.
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="flex-1" disabled={!isSupported}>
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
