import { supabase } from "@/integrations/supabase/client";

export async function getDashboardOraciones() {
  const { data, error } = await supabase
    .from("oraciones")
    .select("*")
    .order("orden", { ascending: true })
    .limit(3000);
  if (error) throw error;
  return data ?? [];
}

export async function getRosarioMisterios() {
  const { data, error } = await supabase.from("rosario_misterios").select("*");
  if (error) throw error;
  return data ?? [];
}

export async function getRosarioOraciones() {
  const { data, error } = await supabase.from("rosario_oraciones").select("*");
  if (error) throw error;
  return data ?? [];
}