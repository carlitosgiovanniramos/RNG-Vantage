/**
 * Plantillas de correo transaccional de RGL Estudio.
 * HTML simple con estilos inline (mejor compatibilidad entre clientes
 * de correo).
 */

export type EmailContent = { subject: string; html: string };

function formatUsd(value: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

/** Escapa cadenas que vienen de la BD antes de inyectarlas como HTML. */
function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout(title: string, bodyHtml: string): string {
  return `<div style="font-family: Arial, Helvetica, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
  <h2 style="text-transform: uppercase; letter-spacing: -0.5px; font-size: 20px;">${title}</h2>
  ${bodyHtml}
  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
  <p style="font-size: 12px; color: #888888;">RGL Estudio &middot; Ecuador</p>
</div>`;
}

/** Pago unico confirmado (tarjeta o transferencia). */
export function paymentConfirmedEmail(p: {
  serviceName?: string;
  amount: number;
}): EmailContent {
  const servicio = p.serviceName
    ? ` del servicio <strong>${escape(p.serviceName)}</strong>`
    : "";
  return {
    subject: "Pago confirmado - RGL Estudio",
    html: layout(
      "Pago confirmado",
      `<p>Hemos confirmado tu pago${servicio} por <strong>${formatUsd(p.amount)}</strong>.</p>
       <p>Tu suscripcion ya esta activa. Gracias por confiar en RGL Estudio.</p>`,
    ),
  };
}

/** Pago no completado / rechazado. */
export function paymentFailedEmail(p: { serviceName?: string }): EmailContent {
  const servicio = p.serviceName
    ? ` del servicio <strong>${escape(p.serviceName)}</strong>`
    : "";
  return {
    subject: "Tu pago no se completo - RGL Estudio",
    html: layout(
      "Pago no completado",
      `<p>No pudimos confirmar tu pago${servicio}.</p>
       <p>Si crees que es un error o ya realizaste el pago, responde a este correo y lo revisamos.</p>`,
    ),
  };
}

/** Suscripcion recurrente con tarjeta activada. */
export function subscriptionActivatedEmail(p: {
  serviceName: string;
  amount: number;
}): EmailContent {
  return {
    subject: "Suscripcion activada - RGL Estudio",
    html: layout(
      "Suscripcion activada",
      `<p>Tu suscripcion a <strong>${escape(p.serviceName)}</strong> esta activa.</p>
       <p>Se cobrara <strong>${formatUsd(p.amount)}</strong> a tu tarjeta cada mes de forma automatica. Te enviaremos un recibo en cada cobro.</p>`,
    ),
  };
}

/** Recibo de un cobro mensual exitoso. */
export function recurringChargeReceiptEmail(p: {
  serviceName?: string;
  amount: number;
}): EmailContent {
  const servicio = p.serviceName ? ` de <strong>${escape(p.serviceName)}</strong>` : "";
  return {
    subject: "Recibo de tu cobro mensual - RGL Estudio",
    html: layout(
      "Cobro mensual procesado",
      `<p>Procesamos el cobro mensual${servicio} por <strong>${formatUsd(p.amount)}</strong>.</p>
       <p>Tu suscripcion sigue activa. Gracias por continuar con RGL Estudio.</p>`,
    ),
  };
}

/** Aviso de cobro recurrente rechazado (dunning). */
export function recurringChargeFailedEmail(p: {
  serviceName?: string;
}): EmailContent {
  const servicio = p.serviceName ? ` de <strong>${escape(p.serviceName)}</strong>` : "";
  return {
    subject: "No pudimos cobrar tu suscripcion - RGL Estudio",
    html: layout(
      "Cobro rechazado",
      `<p>No pudimos procesar el cobro mensual${servicio} de tu suscripcion.</p>
       <p>Suele deberse a una tarjeta vencida o sin fondos. Por favor revisa tu metodo de pago para no perder el servicio.</p>
       <p>Si no se regulariza en los proximos dias, la suscripcion se dara de baja automaticamente. Si necesitas ayuda, responde a este correo.</p>`,
    ),
  };
}
