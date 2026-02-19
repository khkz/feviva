/// <reference lib="webworker" />
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const VAPID_PUBLIC_KEY = "BLAgbEAsVRMbMsBnWEBqSAf5VdMez5TNmJFIRhbNfjqVjMzphJOMdkHl9bXHhULQo0jUJN7Wkx-VgMOjUfBnxOc";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from(rawData, (c) => c.charCodeAt(0));
}

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const supported = "serviceWorker" in navigator && "PushManager" in window;
    setIsSupported(supported);

    if (supported) {
      checkExistingSubscription();
    }
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch {
      setIsSubscribed(false);
    }
  };

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: "No soportado",
        description: "Tu navegador no soporta notificaciones push",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast({
          title: "Permiso denegado",
          description: "Activa las notificaciones en la configuración de tu navegador",
        });
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const subJson = subscription.toJSON();
      await supabase.functions.invoke("push-subscribe", {
        body: {
          subscription: {
            endpoint: subJson.endpoint,
            keys: subJson.keys,
          },
          action: "subscribe",
        },
      });

      setIsSubscribed(true);
      toast({
        title: "🔔 Notificaciones activadas",
        description: "Recibirás recordatorios de tus prácticas de fe",
      });
      return true;
    } catch (error) {
      console.error("Push subscription error:", error);
      toast({
        title: "Error",
        description: "No se pudieron activar las notificaciones",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, toast]);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const subJson = subscription.toJSON();
        await supabase.functions.invoke("push-subscribe", {
          body: {
            subscription: { endpoint: subJson.endpoint },
            action: "unsubscribe",
          },
        });
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      toast({ title: "Notificaciones desactivadas" });
    } catch (error) {
      console.error("Push unsubscribe error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  };
};
