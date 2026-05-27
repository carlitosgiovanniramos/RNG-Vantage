import "server-only";

/**
 * Envio de correos transaccionales via Resend (https://resend.com).
 *
 * Diseno defensivo: el envio de correo NUNCA debe romper un flujo de
 * pago. Si falta la configuracion o Resend falla, se registra el
 * problema y se devuelve `false` sin lanzar excepciones.
 */

type EmailConfig = { apiKey: string; from: string };

function getEmailConfig(): EmailConfig | null {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return null;
  return { apiKey, from };
}

/**
 * Envia un correo. Nunca lanza: devuelve `true` si se envio,
 * `false` si no habia configuracion o si Resend fallo.
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const config = getEmailConfig();
  if (!config) {
    console.warn(
      "[email] RESEND_API_KEY / EMAIL_FROM no configurados; correo omitido:",
      params.subject,
    );
    return false;
  }
  if (!params.to) {
    console.warn("[email] Destinatario vacio; correo omitido:", params.subject);
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.from,
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
      // Evita que un Resend lento bloquee el flujo de pago.
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.error(
        `[email] Resend respondio ${response.status} para: ${params.subject}`,
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error(
      "[email] Error enviando correo:",
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}
