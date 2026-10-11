import { supabase } from "@/integrations/supabase/client";

export interface DashboardProfile {
  id: string;
  nombre: string;
  perfil_doctrinal: string;
  edad_segmento: string;
  country_code: string | null;
  ftue_completed_at: string | null;
}

export async function getDashboardProfile(): Promise<DashboardProfile | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, nombre, perfil_doctrinal, edad_segmento, country_code, ftue_completed_at")
    .eq("id", session.user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function completeDashboardFtue(userId: string): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ ftue_completed_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) throw error;
}