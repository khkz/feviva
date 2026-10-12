import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MISTERIOS, ORACIONES_ROSARIO, TipoMisterio, Misterio } from "@/lib/rosarioData";

interface MisterioGroup {
  nombre: string;
  dia: string;
  misterios: Misterio[];
}

export function useRosarioData() {
  // Fetch misterios from DB
  const { data: dbMisterios } = useQuery({
    queryKey: ["rosario-misterios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rosario_misterios")
        .select("*")
        .order("numero", { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });

  // Fetch oraciones from DB
  const { data: dbOraciones } = useQuery({
    queryKey: ["rosario-oraciones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rosario_oraciones")
        .select("*")
        .order("orden", { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 60,
  });

  // Transform DB data to match existing structure, fallback to static.
  // Memoized: the rosary context re-renders with every playback tick of the global player.
  const misterios: Record<TipoMisterio, MisterioGroup> = useMemo(() => {
    if (!dbMisterios || dbMisterios.length === 0) return MISTERIOS;

    const grouped: Record<string, MisterioGroup> = {};
    for (const row of dbMisterios) {
      if (!grouped[row.tipo]) {
        grouped[row.tipo] = { nombre: row.nombre, dia: row.dia, misterios: [] };
      }
      grouped[row.tipo].misterios.push({
        numero: row.numero,
        titulo: row.titulo,
        fruto: row.fruto,
        meditacion: row.meditacion,
      });
    }
    return grouped as Record<TipoMisterio, MisterioGroup>;
  }, [dbMisterios]);

  const oraciones = useMemo(() => {
    if (!dbOraciones || dbOraciones.length === 0) return ORACIONES_ROSARIO;

    const map: Record<string, string> = {};
    for (const row of dbOraciones) {
      map[row.clave] = row.texto;
    }
    return {
      padreNuestro: map.padreNuestro || ORACIONES_ROSARIO.padreNuestro,
      aveMaria: map.aveMaria || ORACIONES_ROSARIO.aveMaria,
      gloria: map.gloria || ORACIONES_ROSARIO.gloria,
      salveRegina: map.salveRegina || ORACIONES_ROSARIO.salveRegina,
      credo: map.credo || ORACIONES_ROSARIO.credo,
    };
  }, [dbOraciones]);

  return { misterios, oraciones };
}
