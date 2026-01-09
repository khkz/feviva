import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Oracion {
  id: string;
  nombre: string;
  texto: string;
  categoria: string;
  subcategoria: string | null;
  historia: string | null;
  audio_url: string | null;
  orden: number | null;
  // New fields for enhanced UX
  tagline: string | null;
  es_fundamental: boolean | null;
  cita_celebre: string | null;
  cita_autor: string | null;
}

export function useOraciones() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  // Fetch all prayers
  const { data: oraciones = [], isLoading: isLoadingOraciones } = useQuery({
    queryKey: ["oraciones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oraciones")
        .select("*")
        .order("orden", { ascending: true });
      
      if (error) throw error;
      return data as Oracion[];
    },
  });

  // Fetch user favorites
  const { data: favoritos = [] } = useQuery({
    queryKey: ["oraciones-favoritas", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("user_oraciones_favoritas")
        .select("oracion_id")
        .eq("user_id", userId);
      
      if (error) throw error;
      return data.map((f) => f.oracion_id);
    },
    enabled: !!userId,
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (oracionId: string) => {
      if (!userId) throw new Error("Not authenticated");
      
      const isFavorite = favoritos.includes(oracionId);
      
      if (isFavorite) {
        const { error } = await supabase
          .from("user_oraciones_favoritas")
          .delete()
          .eq("user_id", userId)
          .eq("oracion_id", oracionId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_oraciones_favoritas")
          .insert({ user_id: userId, oracion_id: oracionId });
        
        if (error) throw error;
      }
      
      return { oracionId, isFavorite: !isFavorite };
    },
    onSuccess: ({ isFavorite }) => {
      queryClient.invalidateQueries({ queryKey: ["oraciones-favoritas"] });
      toast({
        title: isFavorite ? "Añadido a favoritos" : "Eliminado de favoritos",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar favoritos",
        variant: "destructive",
      });
    },
  });

  // Get unique categories
  const categorias = [...new Set(oraciones.map((o) => o.categoria))];

  // Group by category
  const oracionesByCategoria = categorias.reduce((acc, cat) => {
    acc[cat] = oraciones.filter((o) => o.categoria === cat);
    return acc;
  }, {} as Record<string, Oracion[]>);

  // Get fundamental prayers (sorted by importance)
  const oracionesFundamentales = oraciones
    .filter((o) => o.es_fundamental === true)
    .sort((a, b) => {
      // Custom order: Padre Nuestro, Ave María, Gloria, Credo
      const order: Record<string, number> = {
        "padre nuestro": 1,
        "ave": 2,
        "gloria": 3,
        "credo": 4,
      };
      
      const getOrder = (name: string) => {
        const lower = name.toLowerCase();
        for (const [key, value] of Object.entries(order)) {
          if (lower.includes(key)) return value;
        }
        return 999;
      };
      
      return getOrder(a.nombre) - getOrder(b.nombre);
    });

  return {
    oraciones,
    favoritos,
    categorias,
    oracionesByCategoria,
    oracionesFundamentales,
    isLoading: isLoadingOraciones,
    toggleFavorite: (id: string) => toggleFavoriteMutation.mutate(id),
    isFavorite: (id: string) => favoritos.includes(id),
    isAuthenticated: !!userId,
  };
}
