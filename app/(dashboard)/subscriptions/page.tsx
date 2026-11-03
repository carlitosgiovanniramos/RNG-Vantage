import { createClient } from "@/lib/supabase/server";
import { CheckCircle2, Clock3, Repeat } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { DataCard } from "@/components/data-card";
import { SubscriptionsTable } from "@/app/(dashboard)/subscriptions/subscriptions-table";
import { RealtimeRefresher } from "@/components/realtime-refresher";
import type { Database } from "@/types/database";

type ServiceJoin = {
  id: string;
  type: string;
  name: string;
  price: number;
};

type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"] & {
  services: ServiceJoin | ServiceJoin[] | null;
  profiles: { id: string; first_name: string; last_name: string } | null;
};

function normalizeService(
  service: ServiceJoin | ServiceJoin[] | null,
): ServiceJoin | null {
  if (!service) {
    return null;
  }
  return Array.isArray(service) ? (service[0] ?? null) : service;
}

export default async function SubscriptionsPage() {
  const supabase = await createClient();

  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select(
      "id, user_id, created_at, starts_at, ends_at, status, auto_renew, services:services(id, type, name, price)",
    )
    .order("created_at", { ascending: false });

  const safeSubscriptions = error ? [] : subscriptions ?? [];

  const userIds = Array.from(
    new Set(
      (safeSubscriptions as SubscriptionRow[])
        .map((sub) => sub.user_id)
        .filter(Boolean),
    ),
  );

  const { data: profiles } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", userIds)
    : { data: [] };

  const profilesById = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile]),
  );

  const subscriptionRows = (safeSubscriptions as SubscriptionRow[]).map(
    (sub) => {
      const service = normalizeService(sub.services);
      const profile = profilesById.get(sub.user_id ?? "") ?? null;
      const clientName = profile
        ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
        : "";
      return {
        id: sub.id,
        created_at: sub.created_at,
        ends_at: sub.ends_at,
        status: sub.status,
        auto_renew: sub.auto_renew,
        clientName: clientName || "Sin cliente",
        clientEmail: "—",
        serviceName: service?.name ?? "Servicio desconocido",
        price: service?.price ?? 0,
      };
    },
  );

  const activeCount = subscriptionRows.filter(
    (sub) => sub.status === "active",
  ).length;
  const pendingCount = subscriptionRows.filter(
    (sub) => sub.status === "pending",
  ).length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-6 py-10 md:py-12">
      <AdminPageHeader eyebrow="Ciclo comercial" title="Suscripciones" />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <DataCard
          title="Total"
          value={subscriptionRows.length}
          icon={<Repeat className="size-4" />}
          delay={80}
        />
        <DataCard
          title="Activas"
          value={activeCount}
          icon={<CheckCircle2 className="size-4" />}
          delay={140}
        />
        <DataCard
          title="Pendientes"
          value={pendingCount}
          icon={<Clock3 className="size-4" />}
          delay={200}
          highlight
        />
      </section>

      <RealtimeRefresher tables={["subscriptions"]} />
      <div className="animate-rise" style={{ animationDelay: "260ms" }}>
        <SubscriptionsTable rows={subscriptionRows} />
      </div>
    </div>
  );
}
