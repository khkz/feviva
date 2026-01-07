import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: "welcome" | "password_reset" | "confirmation";
  email: string;
  name?: string;
  resetLink?: string;
  confirmLink?: string;
}

const getWelcomeEmailHtml = (name: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a ElRugido</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0F1419;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #1A1F2E; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #C8A217 0%, #8B6914 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">🦁</div>
              <h1 style="color: #FFFFFF; margin: 0; font-size: 32px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">ElRugido</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Entrena tu fe. Defiende tu verdad.</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #C8A217; margin: 0 0 20px 0; font-size: 24px;">¡Bienvenido, ${name}!</h2>
              <p style="color: #E5E7EB; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Has dado el primer paso en tu camino de formación como apologista católico. ElRugido está diseñado para ayudarte a:
              </p>
              <ul style="color: #E5E7EB; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0; padding-left: 20px;">
                <li>🎯 <strong>Debatir con IA</strong> - Practica contra diferentes perfiles de oponentes</li>
                <li>📖 <strong>Plan de Biblia en 1 año</strong> - Lectura guiada diaria con reflexiones</li>
                <li>🙏 <strong>Oraciones y Novenas</strong> - Crece en tu vida espiritual</li>
                <li>📚 <strong>Biblioteca Apologética</strong> - Recursos para defender tu fe</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://elrugido.com/dashboard" style="background: linear-gradient(135deg, #C8A217 0%, #8B6914 100%); color: #FFFFFF; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                  Comenzar mi Entrenamiento
                </a>
              </div>
              
              <p style="color: #9CA3AF; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
                "Estad siempre dispuestos a dar razón de vuestra esperanza" - 1 Pedro 3:15
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0F1419; padding: 30px; text-align: center; border-top: 1px solid #374151;">
              <p style="color: #6B7280; font-size: 12px; margin: 0 0 10px 0;">
                © 2024 ElRugido. Todos los derechos reservados.
              </p>
              <p style="color: #6B7280; font-size: 12px; margin: 0;">
                <a href="https://elrugido.com" style="color: #C8A217; text-decoration: none;">elrugido.com</a>
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

const getPasswordResetEmailHtml = (name: string, resetLink: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recupera tu cuenta - ElRugido</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0F1419;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #1A1F2E; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #C8A217 0%, #8B6914 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">🦁</div>
              <h1 style="color: #FFFFFF; margin: 0; font-size: 32px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">ElRugido</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #C8A217; margin: 0 0 20px 0; font-size: 24px;">Recupera tu cuenta</h2>
              <p style="color: #E5E7EB; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hola${name ? ` ${name}` : ''},
              </p>
              <p style="color: #E5E7EB; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en ElRugido. Haz clic en el siguiente botón para crear una nueva contraseña:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background: linear-gradient(135deg, #C8A217 0%, #8B6914 100%); color: #FFFFFF; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                  Restablecer Contraseña
                </a>
              </div>
              
              <p style="color: #9CA3AF; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                Este enlace expirará en 1 hora por seguridad.
              </p>
              
              <p style="color: #9CA3AF; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Si no solicitaste este cambio, puedes ignorar este correo. Tu cuenta permanecerá segura.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0F1419; padding: 30px; text-align: center; border-top: 1px solid #374151;">
              <p style="color: #6B7280; font-size: 12px; margin: 0 0 10px 0;">
                © 2024 ElRugido. Todos los derechos reservados.
              </p>
              <p style="color: #6B7280; font-size: 12px; margin: 0;">
                <a href="https://elrugido.com" style="color: #C8A217; text-decoration: none;">elrugido.com</a>
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

const handler = async (req: Request): Promise<Response> => {
  console.log("send-auth-email function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set");
    return new Response(
      JSON.stringify({ success: false, error: "Email service not configured" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const { type, email, name, resetLink }: EmailRequest = await req.json();
    console.log(`Processing ${type} email for ${email}`);

    let subject: string;
    let html: string;

    switch (type) {
      case "welcome":
        subject = "🦁 Bienvenido a ElRugido - Tu entrenamiento de fe comienza hoy";
        html = getWelcomeEmailHtml(name || "Guerrero de la Fe");
        break;
      case "password_reset":
        subject = "🔐 Recupera tu cuenta de ElRugido";
        html = getPasswordResetEmailHtml(name || "", resetLink || "https://elrugido.com/auth");
        break;
      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    // Send email using Resend API directly
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ElRugido <noreply@elrugido.com>",
        to: [email],
        subject,
        html,
      }),
    });

    const emailResponse = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
