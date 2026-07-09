// Webhook de Stripe: al completar checkout / renovar / cancelar,
// actualiza la tabla `subscribers` con el estado Premium y fecha de expiración.
// verify_jwt = false (Stripe no envía JWT). Validamos con la firma del webhook.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    return new Response("Missing Stripe config", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret);
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const upsertFromSubscription = async (subscription: Stripe.Subscription, emailFallback?: string | null) => {
    const meta = subscription.metadata || {};
    const userId = meta.user_id || null;
    const tier = meta.tier || "Apostol";
    const cycle = meta.billing_cycle || null;

    // Resolver email
    let email = emailFallback ?? null;
    if (!email && typeof subscription.customer === "string") {
      const customer = await stripe.customers.retrieve(subscription.customer);
      if (!(customer as any).deleted) email = (customer as Stripe.Customer).email;
    }
    if (!email) return;

    const active = ["active", "trialing"].includes(subscription.status);
    const endUnix = subscription.current_period_end || subscription.trial_end || null;

    await supabase.from("subscribers").upsert({
      user_id: userId,
      email,
      stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : null,
      stripe_subscription_id: subscription.id,
      subscribed: active,
      subscription_tier: tier,
      billing_cycle: cycle,
      subscription_end: endUnix ? new Date(endUnix * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "email" });
  };

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await upsertFromSubscription(sub, session.customer_email ?? undefined);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await upsertFromSubscription(sub);
        break;
      }
      default:
        break;
    }
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("[stripe-webhook] handler error", err);
    return new Response("Handler error", { status: 500 });
  }
});
