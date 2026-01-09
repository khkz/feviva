import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const getInvitationEmailHtml = (
  recipientName: string,
  senderName: string,
  personalMessage: string | null,
  inviteCode: string
) => {
  const appUrl = Deno.env.get("APP_URL") || "https://elrugido.com";
  const inviteUrl = `${appUrl}/auth?invite=${inviteCode}`;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitación a ElRugido</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #ffffff; letter-spacing: -0.5px;">
                🦁 ElRugido
              </h1>
              <p style="margin: 10px 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.8);">
                Ruge tu fe con verdad y amor
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; font-size: 24px; color: #1a365d; text-align: center;">
                ¡Has recibido una invitación!
              </h2>
              
              <p style="margin: 0 0 20px; font-size: 16px; color: #374151; line-height: 1.6; text-align: center;">
                ${recipientName ? `Hola <strong>${recipientName}</strong>,` : '¡Hola!'}
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; color: #374151; line-height: 1.6; text-align: center;">
                <strong>${senderName}</strong> te ha invitado a unirte a <strong>ElRugido</strong>, 
                una plataforma diseñada para fortalecer tu fe cristiana.
              </p>

              ${personalMessage ? `
              <div style="margin: 24px 0; padding: 20px; background-color: #f8fafc; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; font-size: 14px; color: #6b7280; font-style: italic;">
                  Mensaje de ${senderName}:
                </p>
                <p style="margin: 8px 0 0; font-size: 16px; color: #374151; line-height: 1.6;">
                  "${personalMessage}"
                </p>
              </div>
              ` : ''}
              
              <!-- Benefits -->
              <div style="margin: 30px 0; padding: 20px; background-color: #fef9c3; border-radius: 12px;">
                <p style="margin: 0 0 15px; font-size: 14px; font-weight: 600; color: #1a365d; text-transform: uppercase; letter-spacing: 0.5px;">
                  ¿Qué encontrarás en ElRugido?
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                  <li>📖 Plan de lectura bíblica de 365 días</li>
                  <li>🙏 Oraciones diarias y rituales espirituales</li>
                  <li>🎯 Coach de apologética para defender tu fe</li>
                  <li>📿 Rosario y novenas guiadas</li>
                  <li>🌙 Historias bíblicas para dormir</li>
                  <li>👥 Comunidad de apoyo cristiano</li>
                </ul>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #1a365d; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 50px; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);">
                  Unirme a ElRugido
                </a>
              </div>
              
              <p style="margin: 30px 0 0; font-size: 13px; color: #9ca3af; text-align: center; line-height: 1.5;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                <a href="${inviteUrl}" style="color: #2563eb; word-break: break-all;">${inviteUrl}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">
                Con amor en Cristo,<br>
                <strong>El equipo de ElRugido</strong>
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} ElRugido. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY no configurada");
    }

    const { invitationId, recipientEmail, recipientName, personalMessage, senderName } = await req.json();

    if (!invitationId || !recipientEmail) {
      throw new Error("invitationId y recipientEmail son requeridos");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get invite code from database
    const { data: invitation, error: fetchError } = await supabase
      .from("gift_invitations")
      .select("invite_code")
      .eq("id", invitationId)
      .single();

    if (fetchError || !invitation) {
      throw new Error("Invitación no encontrada");
    }

    const emailHtml = getInvitationEmailHtml(
      recipientName || "",
      senderName || "Un amigo",
      personalMessage,
      invitation.invite_code
    );

    // Send email via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ElRugido <noreply@elrugido.com>",
        to: [recipientEmail],
        subject: `${senderName || 'Un amigo'} te invita a unirte a ElRugido 🦁`,
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error("Resend error:", errorData);
      throw new Error(`Error enviando email: ${resendResponse.status}`);
    }

    // Update invitation status
    const { error: updateError } = await supabase
      .from("gift_invitations")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .eq("id", invitationId);

    if (updateError) {
      console.error("Error updating invitation status:", updateError);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-gift-invitation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
