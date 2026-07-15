import { supabase } from "@/integrations/supabase/client";

/**
 * Async, one-shot admin check for gating client-side calls that would
 * hit an admin-only edge function. Non-admins get `false` so the caller
 * can skip the generation attempt entirely (no 403 toast, no cost).
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}
