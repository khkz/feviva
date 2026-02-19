import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Verifica que el usuario esté autenticado antes de llamar funciones protegidas.
 * Muestra un toast de error y redirige al login si no está autenticado.
 * @returns true si el usuario está autenticado, false si no.
 */
export async function requireAuth(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    toast.error("Inicia sesión para usar esta función", {
      description: "Serás redirigido al login en 2 segundos",
    });
    setTimeout(() => {
      window.location.href = '/auth';
    }, 2000);
    return false;
  }
  return true;
}
