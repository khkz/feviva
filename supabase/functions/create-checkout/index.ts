// Crea una sesión de Stripe Checkout para el plan solicitado.
// No bloquea contenido: solo prepara el pago. El estado Premium se marca en el webhook.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type PlanKey = "apostol_mensual" | "apostol_anual" | "mecenas_mensual";

const PLANS: Record<PlanKey, {
  tier: string;
  cycle: "mensual" | "anual";
  amount: number; // CLP (zero-decimal)
  interval: "month" | "year";
  name: string;
}> = {
  apostol_mensual: { tier: "Apostol", cycle: "mensual", amount: 3990, interval: "month", name: "ElRugido Apóstol (Mensual)" },
  apostol_anual:   { tier: "Apostol", cycle: "anual",   amount: 29990, interval: "year",  name: "ElRugido Apóstol (Anual)" },
  mecenas_mensual: { tier: "Mecenas", cycle: "mensual", amount: 9990, interval: "month", name: "ElRugido Mecenas (Mensual)" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY no configurada");

    const { plan, origin } = await req.json();
    const planCfg = PLANS[plan as PlanKey];
    if (!planCfg) throw new Error("Plan inválido");

    // Autenticar usuario
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Falta autenticación");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user?.email) throw new Error("Usuario no autenticado");
    const user = userData.user;

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

    // Reutilizar customer si existe
    const existing = await stripe.customers.list({ email: user.email!, limit: 1 });
    const customerId = existing.data[0]?.id;

    const siteUrl = origin || req.headers.get("origin") || "https://elrugido.com";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      mode: "subscription",
      line_items: [{
        price_data: {
          currency: "clp",
          product_data: { name: planCfg.name },
          unit_amount: planCfg.amount,
          recurring: { interval: planCfg.interval },
        },
        quantity: 1,
      }],
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          user_id: user.id,
          tier: planCfg.tier,
          billing_cycle: planCfg.cycle,
        },
      },
      metadata: {
        user_id: user.id,
        tier: planCfg.tier,
        billing_cycle: planCfg.cycle,
      },
      success_url: `${siteUrl}/planes?checkout=success`,
      cancel_url: `${siteUrl}/planes?checkout=cancel`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[create-checkout]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
