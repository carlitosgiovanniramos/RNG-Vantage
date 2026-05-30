import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { SubscriptionsPanel } from "./subscriptions-panel";
import { ReceiptUpload } from "./receipt-upload";

type ServiceJoin = {
  id: string;
  name: string;
  type: string;
  price: number;
};

type SubscriptionItem = {
  id: string;
  status: string | null;
  starts_at: string | null;
  ends_at: string | null;
  auto_renew: boolean | null;
  gateway_subscription_id: string | null;
  services: ServiceJoin | ServiceJoin[] | null;
};

type PaymentItem = {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  gateway: string;
  receipt_url: string | null;
  created_at: string;
};

type PerfilPageProps = {
  searchParams?: Promise<{ page?: string }>;
};

const STATUS_LABELS: Record<string, string> = {
  active: "Activa",
  pending: "Pendiente",
  completed: "Pagada",
  expired: "Vencida",
  cancelled: "Cancelada",
  failed: "Fallida",
  refunded: "Reembolsada",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  expired: "bg-slate-100 text-slate-700",
  cancelled: "bg-rose-100 text-rose-700",
  failed: "bg-rose-100 text-rose-700",
  refunded: "bg-indigo-100 text-indigo-700",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Efectivo",
  transfer: "Transferencia",
  card: "Tarjeta",
  pending: "Pendiente",
};

function normalizeService(
  service: ServiceJoin | ServiceJoin[] | null,
): ServiceJoin | null {
  if (!service) return null;
  return Array.isArray(service) ? (service[0] ?? null) : service;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-EC", {
    dateStyle: "medium",
  });
}

export default async function PerfilPage({ searchParams }: PerfilPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent("/perfil")}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = profile
    ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
    : user.email?.split("@")[0] ?? "Cliente";

  const resolvedSearchParams = await searchParams;
  const pageSize = 5;
  const rawPage = Number(resolvedSearchParams?.page ?? "1");
  const currentPage = Number.isNaN(rawPage) ? 1 : Math.max(1, rawPage);
  const rangeStart = (currentPage - 1) * pageSize;
  const rangeEnd = rangeStart + pageSize - 1;

  const { data: subscriptions, count } = await supabase
    .from("subscriptions")
    .select(
      "id, status, starts_at, ends_at, auto_renew, gateway_subscription_id, services(id, name, type, price)",
      { count: "exact" },
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(rangeStart, rangeEnd);

  const panelItems = ((subscriptions ?? []) as SubscriptionItem[]).map((item) => {
    const service = normalizeService(item.services);
    return {
      id: item.id,
      status: item.status,
      starts_at: item.starts_at,
      ends_at: item.ends_at,
      auto_renew: item.auto_renew,
      isKushkiRecurring: Boolean(item.gateway_subscription_id),
      serviceName: service?.name ?? "Servicio",
      serviceType: service?.type ?? "—",
      price: service?.price ?? 0,
    };
  });

  const { data: payments } = await supabase
    .from("transactions")
    .select("id, amount, status, payment_method, gateway, receipt_url, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const paymentItems = (payments ?? []) as PaymentItem[];

  const totalItems = count ?? panelItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6 px-6 py-10">
      <header className="flex flex-col gap-3 border border-border/60 bg-card/85 p-6 backdrop-blur-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.22em] text-primary">
            Perfil
          </p>
          <h1 className="font-spaceGrotesk text-3xl font-black uppercase tracking-tight text-foreground">
            {displayName || "Cliente"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {user.email ?? ""}
          </p>
        </div>
        <Link
          href="/catalogo"
          className="inline-flex h-10 items-center gap-2 border border-border/70 bg-background/80 px-3 font-spaceGrotesk text-[0.65rem] font-bold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
          Volver al catalogo
        </Link>
      </header>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-spaceGrotesk text-lg font-black uppercase tracking-tight text-foreground">
            Mis suscripciones
          </h2>
          <span className="font-spaceGrotesk text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {totalItems} registro(s)
          </span>
        </div>

        <SubscriptionsPanel items={panelItems} />

        {totalPages > 1 && (
          <div className="flex items-center justify-between border border-border/50 bg-card/70 px-4 py-3">
            <p className="font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">
              Pagina {currentPage} de {totalPages}
            </p>
            <div className="flex gap-2">
              <Link
                href={`/perfil?page=${Math.max(1, currentPage - 1)}`}
                className={`inline-flex h-9 items-center border border-border/70 px-3 font-spaceGrotesk text-xs font-bold uppercase tracking-wide ${
                  currentPage === 1
                    ? "pointer-events-none text-muted-foreground/50"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                Anterior
              </Link>
              <Link
                href={`/perfil?page=${Math.min(totalPages, currentPage + 1)}`}
                className={`inline-flex h-9 items-center border border-border/70 px-3 font-spaceGrotesk text-xs font-bold uppercase tracking-wide ${
                  currentPage === totalPages
                    ? "pointer-events-none text-muted-foreground/50"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                Siguiente
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="font-spaceGrotesk text-lg font-black uppercase tracking-tight text-foreground">
          Historial de pagos
        </h2>

        {paymentItems.length === 0 ? (
          <div className="border border-border/60 bg-card/80 p-6 text-sm text-muted-foreground">
            Aun no tienes pagos registrados.
          </div>
        ) : (
          <div className="space-y-2">
            {paymentItems.map((payment) => {
              const status = payment.status ?? "pending";
              const canUploadReceipt =
                payment.gateway === "manual" &&
                payment.payment_method === "transfer" &&
                status === "pending" &&
                !payment.receipt_url;
              return (
                <div
                  key={payment.id}
                  className="border border-border/60 bg-card/80 px-4 py-3 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-workSans text-foreground">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="font-workSans text-xs text-muted-foreground">
                        {formatDate(payment.created_at)} ·{" "}
                        {PAYMENT_METHOD_LABELS[payment.payment_method] ??
                          payment.payment_method}
                        {payment.gateway === "manual" &&
                          payment.payment_method === "transfer" &&
                          payment.receipt_url && (
                            <span className="ml-1 text-emerald-700 dark:text-emerald-400">
                              · comprobante enviado
                            </span>
                          )}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 font-spaceGrotesk text-[0.65rem] font-bold uppercase tracking-[0.12em] ${
                        STATUS_STYLES[status] ?? STATUS_STYLES.pending
                      }`}
                    >
                      {STATUS_LABELS[status] ?? status}
                    </span>
                  </div>
                  {canUploadReceipt && <ReceiptUpload transactionId={payment.id} />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
