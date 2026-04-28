/**
 * ==========================================
 * WEBHOOK PLACEHOLDER PARA PAGOS CON TARJETA
 * ==========================================
 * 
 * Este endpoint está preparado para recibir notificaciones de:
 * - PayPhone
 * - Stripe
 * - MercadoPago
 * - Otros procesadores de pago
 * 
 * ESTADO ACTUAL: NO IMPLEMENTADO
 * 
 * Cuando la clienta (Ruth) en el futuro quiera cobrar con tarjeta,
 * ella integrará un servicio de pagos que enviará POST a este endpoint
 * con la información del pago completado.
 * 
 * EJEMPLO DE PAYLOAD ESPERADO (una vez implementado):
 * {
 *   "transaction_id": "550e8400-e29b-41d4-a716-446655440000",
 *   "status": "completed" | "failed",
 *   "payment_method": "card",
 *   "transaction_reference": "PAY-12345-STRIPE",
 *   "amount": 299.99,
 *   "timestamp": "2026-04-27T13:45:00Z"
 * }
 * 
 * PASOS PARA IMPLEMENTAR DESPUÉS:
 * 1. Validar la firma del webhook (para confirmar que viene de PayPhone/Stripe)
 * 2. Extraer el transaction_id
 * 3. Llamar a markTransactionAsCompleted() (el Server Action que ya existe)
 * 4. Retornar 200 OK
 * 5. En caso de error, loguear y retornar 400/500
 * 
 * RECURSOS:
 * - Documentación PayPhone: https://developers.payphonecr.com
 * - Documentación Stripe: https://stripe.com/docs/webhooks
 */

export async function POST(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _request: Request
) {
  try {
    // TODO: Implementar validación de firma del webhook
    // const signature = _request.headers.get("x-webhook-signature");
    // if (!verifyWebhookSignature(signature, body)) {
    //   return Response.json({ error: "Invalid signature" }, { status: 401 });
    // }

    // TODO: Parsear y validar payload
    // const payload = await request.json();
    // const { transaction_id, status, amount } = payload;

    // TODO: Si status === "completed", llamar a markTransactionAsCompleted
    // await markTransactionAsCompleted({ transaction_id, payment_method: "card" });

    return Response.json(
      {
        message: "Webhook placeholder - No implementado aún",
        status: "pending_implementation",
      },
      { status: 501 }
    );
  } catch (error) {
    console.error("[POST /api/transactions] Error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
