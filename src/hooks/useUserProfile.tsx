import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  nombre: string | null;
  email: string | null;
}

/**
 * Fuente única del perfil del usuario autenticado.
 * Usar en toda la app en lugar de fallbacks como "Peregrino" / "Usuario".
 * Mientras carga, `profile` es null y `isLoading` es true — la UI debe
 * mostrar un skeleton del nombre, nunca un fallback estático.
 */
export function useUserProfile() {
  const query = useQuery({
    queryKey: ["user-profile"],
    queryFn: async (): Promise<UserProfile | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("profiles")
        .select("id, nombre, email")
        .eq("id", user.id)
        .maybeSingle();

      if (data) return data as UserProfile;

      return {
        id: user.id,
        nombre: (user.user_metadata as any)?.nombre ?? null,
        email: user.email ?? null,
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const profile = query.data ?? null;
  const displayName = profile?.nombre?.trim() || null;
  const firstName = displayName ? displayName.split(" ")[0] : null;

  return {
    profile,
    displayName,
    firstName,
    isLoading: query.isLoading,
    isAuthenticated: !!profile,
  };
}
