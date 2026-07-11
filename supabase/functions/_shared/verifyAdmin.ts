import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * Verify the caller is EITHER:
 *   (a) the internal cron/service caller presenting the shared secret via
 *       `X-Admin-Api-Key` (must match Deno env `ADMIN_API_KEY`), OR
 *   (b) an authenticated user whose `user_roles` row includes 'admin'.
 *
 * Any other caller (anon, or a normal logged-in user) gets 401/403.
 */
export async function verifyAdmin(req: Request, corsHeaders: Record<string, string>) {
  const json = (status: number, error: string) =>
    new Response(JSON.stringify({ error }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  // (a) Shared secret path — used by pg_cron and internal function-to-function calls.
  const providedKey = req.headers.get("X-Admin-Api-Key");
  const ADMIN_KEY = Deno.env.get("ADMIN_API_KEY");
  const CRON_KEY = Deno.env.get("CRON_ADMIN_KEY");
  if (providedKey && ((ADMIN_KEY && providedKey === ADMIN_KEY) || (CRON_KEY && providedKey === CRON_KEY))) {
    return { ok: true as const, userId: "cron" as const };
  }

  // (b) User path — requires a valid JWT AND the 'admin' role in user_roles.
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false as const, response: json(401, "Unauthorized: missing token") };
  }

  const token = authHeader.replace("Bearer ", "");
  const anonClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
  if (claimsError || !claimsData?.claims?.sub) {
    return { ok: false as const, response: json(401, "Unauthorized: invalid token") };
  }
  const userId = claimsData.claims.sub as string;

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data: roles, error: rolesError } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (rolesError) {
    return { ok: false as const, response: json(500, "Role lookup failed") };
  }
  const isAdmin = (roles ?? []).some((r: { role: string }) => r.role === "admin");
  if (!isAdmin) {
    return { ok: false as const, response: json(403, "Forbidden: admin role required") };
  }

  return { ok: true as const, userId };
}
