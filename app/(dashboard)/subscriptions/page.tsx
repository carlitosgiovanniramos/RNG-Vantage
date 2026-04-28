import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SubscriptionsTable } from "@/app/(dashboard)/subscriptions/subscriptions-table";
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
  const expiredCount = subscriptionRows.filter(
    (sub) => sub.status === "expired",
  ).length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-6 py-8 md:py-10">
      <header className="flex flex-col gap-3 border border-border/60 bg-card/85 p-6 backdrop-blur-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.22em] text-primary">
            Ciclo comercial
          </p>
          <h1 className="font-spaceGrotesk text-3xl font-black uppercase tracking-tight text-foreground">
            Suscripciones
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vista general de renovaciones, estados y fechas de vencimiento.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex h-10 items-center gap-2 border border-border/70 bg-background/80 px-3 font-spaceGrotesk text-[0.65rem] font-bold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
          Volver
        </Link>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Total", value: subscriptionRows.length },
          { label: "Activas", value: activeCount },
          { label: "Pendientes", value: pendingCount },
        ].map((stat) => (
          <article
            key={stat.label}
            className="border border-border/60 bg-card/80 p-4 text-sm backdrop-blur-sm"
          >
            <p className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-2 font-spaceGrotesk text-2xl font-black text-foreground">
              {stat.value}
            </p>
          </article>
        ))}
      </section>

      <SubscriptionsTable rows={subscriptionRows} />
    </div>
  );
}
