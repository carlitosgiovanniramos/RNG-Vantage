"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSubscriptionSchema } from "@/lib/validators/subscription";

/**
 * Crea una suscripción pendiente y una transacción inicial pendiente.
 * 
 * @param params { service_id: string, auto_renew: boolean }
 * @returns Result object con success, ids y datos básicos o un mensaje de error.
 */
export async function createSubscription(params: {
  service_id: string;
  auto_renew: boolean;
}) {
  const supabase = await createClient();

  // 3. Obtener el usuario actual
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Debes iniciar sesión para continuar." };
  }

  // 4. Consultar el servicio
  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("*")
    .eq("id", params.service_id)
    .single();

  if (serviceError || !service) {
    return { success: false, error: "El servicio no existe o no pudo ser encontrado." };
  }

  if (!service.is_active) {
    return { success: false, error: "El servicio seleccionado no está activo." };
  }

  // 5. Aplicar lógica de negocio de auto_renew
  // Solo los servicios type = "manejo_redes" admiten renovación automática.
  let autoRenew = params.auto_renew;
  if (service.type !== "manejo_redes") {
    autoRenew = false;
  }

  // 6. Calcular fechas
  const startsAt = new Date();
  const endsAt = new Date(startsAt);
  endsAt.setMonth(startsAt.getMonth() + (service.duration_months || 1));

  // 2. Validar los datos preparados según createSubscriptionSchema
  const subDataToValidate = {
    user_id: user.id,
    service_id: service.id,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    auto_renew: autoRenew,
  };

  const validation = createSubscriptionSchema.safeParse(subDataToValidate);

  if (!validation.success) {
    return {
      success: false,
      error: "Datos de suscripción inválidos.",
      details: validation.error.format(),
    };
  }

  // 7. Insertar en tabla subscriptions
  const { data: createdSubscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .insert({
      ...validation.data,
      status: "pending",
    })
    .select("id")
    .single();

  if (subscriptionError || !createdSubscription) {
    return { success: false, error: "Error al crear la suscripción." };
  }

  // 8 y 9. Insertar transacción pendiente usando SERVICE_ROLE_KEY
  // IMPORTANTE:
  // Se utiliza el cliente admin (SERVICE_ROLE_KEY) porque las políticas de RLS 
  // en la tabla "transactions" impiden que los usuarios con rol "authenticated"
  // inserten registros directamente. Solo el backend/sistema autorizado puede 
  // crear transacciones financieras para mantener la seguridad.
  const supabaseAdmin = createAdminClient();

  const { data: createdTransaction, error: transactionError } = await supabaseAdmin
    .from("transactions")
    .insert({
      user_id: user.id,
      subscription_id: createdSubscription.id,
      amount: service.price,
      payment_method: "pending",
      status: "pending",
    })
    .select("id")
    .single();

  if (transactionError || !createdTransaction) {
    return {
      success: false,
      error: "Error al crear la transacción vinculada.",
      subscription_id: createdSubscription.id,
    };
  }

  // 10. Retornar éxito
  return {
    success: true,
    subscription_id: createdSubscription.id,
    transaction_id: createdTransaction.id,
    service: {
      name: service.name,
      price: service.price,
    },
  };
}
