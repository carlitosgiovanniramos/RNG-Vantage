/**
 * PLACEHOLDER: Webhook para pasarela de pago
 * 
 * Este endpoint está diseñado para recibir notificaciones HTTP (Webhooks)
 * de pasarelas de pago externas (por ejemplo: Stripe, MercadoPago, PayPal).
 * 
 * ─────────────────────────────────────────────────────────────
 * FLUJO ESPERADO CUANDO SE INTEGRE UNA PASARELA REAL:
 * ─────────────────────────────────────────────────────────────
 * 
 * 1. El cliente paga a través de la pasarela.
 * 2. La pasarela emite un POST request a este webhook indicando éxito o fracaso.
 * 3. Este webhook verifica la firma (security signature) del payload.
 * 4. Extrae el `transaction_id` que se mandó originalmente en los metadata.
 * 5. Si fue un éxito:
 *    - Cambia `transactions.status` de 'pending' a 'completed'.
 *    - Cambia `subscriptions.status` asociado a 'active'.
 * 6. Si fue rechazado:
 *    - Cambia `transactions.status` a 'failed'.
 * 
 * EJEMPLO DE PAYLOAD ESPERADO (Formato tipo Stripe):
 * {
 *   "type": "charge.succeeded",
 *   "data": {
 *     "object": {
 *       "id": "ch_1xxx...",
 *       "amount": 5000,
 *       "metadata": {
 *         "transaction_id": "UUID-AQUI"
 *       },
 *       "status": "succeeded"
 *     }
 *   }
 * }
 */



declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: { get: (key: string) => string | undefined; };
};

Deno.serve(async (req: Request) => {
  // Manejo de peticiones CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
      }
    });
  }

  // Validar el método
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { 
      status: 405, 
      headers: { "Content-Type": "application/json" } 
    });
  }

  /*
  ===========================================
    TODO: IMPLEMENTACIÓN FUTURA
  ===========================================

  // 1. Obtener la firma del webhook desde los headers de la pasarela
  // const signature = req.headers.get("Stripe-Signature");
  // const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  
  // 2. Leer el payload raw y verificar la firma
  // const rawBody = await req.text();
  // const event = stripe.webhooks.constructEvent(rawBody, signature, secret);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const body = await req.json(); // Esto cambiará a parsear el `event`
  
  // 3. Localizar el Transaction ID asociado en la Metadata
  const transactionId = body?.data?.object?.metadata?.transaction_id;

  if (body.type === 'charge.succeeded') {
    // 4. Actualizar la transacción
    await supabase.from('transactions').update({ status: 'completed' }).eq('id', transactionId);

    // 5. Activar la suscripción asociada seleccionando primero el subscription_id de la tabla
    const { data: tx } = await supabase.from('transactions').select('subscription_id').eq('id', transactionId).single();
    if (tx?.subscription_id) {
      await supabase.from('subscriptions').update({ status: 'active' }).eq('id', tx.subscription_id);
    }
    
    return new Response(JSON.stringify({ received: true, success: true }), { status: 200 });
  }
  */

  // Respuesta de placeholder mientras no haya pasarela
  return new Response(
    JSON.stringify({ 
      message: 'Payment webhook is not implemented yet. This is a placeholder for future integrations.',
      received_payload: await req.text(),
    }),
    { 
      status: 501, // 501 Not Implemented
      headers: { "Content-Type": "application/json" } 
    }
  );
});