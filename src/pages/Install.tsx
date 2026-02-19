import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Smartphone, Bell, Wifi, ChevronRight, CheckCircle2 } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const { isSupported, isSubscribed, isLoading, subscribe } = usePushNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsInstalled(isStandalone);

    // Check iOS
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const steps = [
    {
      icon: Download,
      title: "Instala la app",
      description: isInstalled
        ? "✅ ¡Ya tienes la app instalada!"
        : isIOS
        ? 'Toca el botón de compartir (📤) y luego "Agregar a pantalla de inicio"'
        : deferredPrompt
        ? "Toca el botón de abajo para instalar"
        : "Abre esta página en Chrome o Safari para instalar",
      done: isInstalled,
    },
    {
      icon: Bell,
      title: "Activa notificaciones",
      description: isSubscribed
        ? "✅ Notificaciones activadas"
        : "Recibe recordatorios de oración, rachas y más",
      done: isSubscribed,
    },
    {
      icon: Wifi,
      title: "Funciona sin internet",
      description: "El contenido que visites estará disponible offline",
      done: isInstalled,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Instala ElRugido</h1>
          <p className="text-muted-foreground">
            Accede más rápido, recibe recordatorios y úsala sin internet
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, i) => (
            <Card key={i} className={step.done ? "border-primary/30 bg-primary/5" : ""}>
              <CardContent className="flex items-start gap-4 p-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    step.done ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.done ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {!isInstalled && deferredPrompt && (
            <Button onClick={handleInstall} className="w-full" size="lg">
              <Download className="w-5 h-5 mr-2" />
              Instalar ElRugido
            </Button>
          )}

          {isSupported && !isSubscribed && (
            <Button
              onClick={subscribe}
              disabled={isLoading}
              variant={isInstalled ? "default" : "outline"}
              className="w-full"
              size="lg"
            >
              <Bell className="w-5 h-5 mr-2" />
              {isLoading ? "Activando..." : "Activar notificaciones"}
            </Button>
          )}

          <Button variant="ghost" className="w-full" onClick={() => navigate("/dashboard")}>
            Ir al dashboard
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Install;
