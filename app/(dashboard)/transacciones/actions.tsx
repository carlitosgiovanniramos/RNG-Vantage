"use server";

import { createClient } from "@/lib/supabase/server";
import { createTransactionSchema } from "@/lib/validators/transaction";
import type {
  Database,
  PaymentMethod,
  TransactionStatus,
} from "@/types/database";

export type TransactionRow =
  Database["public"]["Tables"]["transactions"]["Row"];

type ProfileRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "first_name" | "last_name"
>;

type ServiceRow = Pick<
  Database["public"]["Tables"]["services"]["Row"],
  "id" | "name" | "price"
>;

type SubscriptionRow = Pick<
  Database["public"]["Tables"]["subscriptions"]["Row"],
  "id" | "user_id" | "service_id" | "status"
>;

export type AdminTransactionRow = TransactionRow & {
  client_name: string;
};

export type PaymentSubscriptionOption = {
  id: string;
  user_id: string;
  client_name: string;
  service_name: string;
  price: number;
  status: string;
};

export type CreatePaymentInput = {
  subscription_id?: string;
  amount: number;
  payment_method: PaymentMethod;
  status: TransactionStatus;
  notes?: string;
};

function getClientName(profile?: ProfileRow): string {
  if (!profile) {
    return "Cliente sin perfil";
  }

  const fullName = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || "Cliente sin nombre";
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, error: "No autorizado" };
  }

  return { supabase, error: null };
}

export async function getTransactions() {
  const { supabase, error: authError } = await requireUser();
  if (authError) {
    return { error: authError };
  }

  const transactionsResult = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false });

  if (transactionsResult.error) {
    return { error: transactionsResult.error.message };
  }

  const transactions = (transactionsResult.data ?? []) as TransactionRow[];
  const userIds = Array.from(
    new Set(
      transactions
        .map((transaction) => transaction.user_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  let profilesById = new Map<string, ProfileRow>();

  if (userIds.length > 0) {
    const profilesResult = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", userIds);

    if (profilesResult.error) {
      return { error: profilesResult.error.message };
    }

    profilesById = new Map(
      ((profilesResult.data ?? []) as ProfileRow[]).map((profile) => [
        profile.id,
        profile,
      ]),
    );
  }

  return {
    data: transactions.map((transaction) => ({
      ...transaction,
      client_name: transaction.user_id
        ? getClientName(profilesById.get(transaction.user_id))
        : "Sin cliente",
    })) satisfies AdminTransactionRow[],
  };
}

export async function getPaymentFormOptions() {
  const { supabase, error: authError } = await requireUser();
  if (authError) {
    return { error: authError };
  }

  const subscriptionsResult = await supabase
    .from("subscriptions")
    .select("id, user_id, service_id, status")
    .order("created_at", { ascending: false });

  if (subscriptionsResult.error) {
    return { error: subscriptionsResult.error.message };
  }

  const subscriptions = (subscriptionsResult.data ?? []) as SubscriptionRow[];
  const userIds = Array.from(new Set(subscriptions.map((item) => item.user_id)));
  const serviceIds = Array.from(
    new Set(subscriptions.map((item) => item.service_id)),
  );

  const [profilesResult, servicesResult] = await Promise.all([
    userIds.length > 0
      ? supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", userIds)
      : Promise.resolve({ data: [], error: null }),
    serviceIds.length > 0
      ? supabase.from("services").select("id, name, price").in("id", serviceIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const error = profilesResult.error ?? servicesResult.error;
  if (error) {
    return { error: error.message };
  }

  const profilesById = new Map(
    ((profilesResult.data ?? []) as ProfileRow[]).map((profile) => [
      profile.id,
      profile,
    ]),
  );
  const servicesById = new Map(
    ((servicesResult.data ?? []) as ServiceRow[]).map((service) => [
      service.id,
      service,
    ]),
  );

  return {
    data: subscriptions.map((subscription) => {
      const service = servicesById.get(subscription.service_id);

      return {
        id: subscription.id,
        user_id: subscription.user_id,
        client_name: getClientName(profilesById.get(subscription.user_id)),
        service_name: service?.name ?? "Servicio no disponible",
        price: Number(service?.price ?? 0),
        status: subscription.status,
      };
    }) satisfies PaymentSubscriptionOption[],
  };
}

export async function createPayment(input: CreatePaymentInput) {
  const { supabase, error: authError } = await requireUser();
  if (authError) {
    return { error: authError };
  }

  let userId: string | null = null;

  if (input.subscription_id) {
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("id", input.subscription_id)
      .single();

    if (error) {
      return { error: error.message };
    }

    userId = subscription.user_id;
  }

  const parsed = createTransactionSchema.safeParse({
    user_id: userId ?? undefined,
    subscription_id: input.subscription_id || undefined,
    amount: input.amount,
    payment_method: input.payment_method,
    status: input.status,
    notes: input.notes?.trim() || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Pago invalido" };
  }

  const { error } = await supabase.from("transactions").insert(parsed.data);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updateTransactionStatus(
  id: string,
  status: TransactionStatus,
) {
  const { supabase, error: authError } = await requireUser();
  if (authError) {
    return { error: authError };
  }

  const { error } = await supabase
    .from("transactions")
    .update({ status })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
