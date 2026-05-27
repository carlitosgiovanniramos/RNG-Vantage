import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Exporta todas las transacciones a CSV para la contabilidad.
 * Solo accesible para administradores.
 */

export const runtime = "nodejs";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  completed: "Pagada",
  failed: "Fallida",
  refunded: "Reembolsada",
};

/** Escapa un valor para CSV (comillas dobles + escape de comillas internas). */
function csvCell(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET() {
  // 1. Verificar que el llamante es un admin activo.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin" || profile.is_active === false) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2. Traer todas las transacciones.
  const admin = createAdminClient();
  const { data: transactions, error } = await admin
    .from("transactions")
    .select(
      "id, user_id, amount, status, payment_method, gateway, gateway_transaction_id, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[export-transactions] Error:", error.message);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }

  const rows = transactions ?? [];

  // 3. Resolver los nombres de los clientes.
  const userIds = Array.from(
    new Set(rows.map((t) => t.user_id).filter((id): id is string => Boolean(id))),
  );
  const { data: profiles } = userIds.length
    ? await admin
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", userIds)
    : { data: [] };
  const nameById = new Map(
    (profiles ?? []).map((p) => [
      p.id,
      `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim(),
    ]),
  );

  // 4. Construir el CSV.
  const header = [
    "Fecha",
    "Cliente",
    "Monto USD",
    "Estado",
    "Metodo",
    "Pasarela",
    "ID Kushki",
    "ID Transaccion",
  ];
  const lines = [header.map(csvCell).join(",")];

  for (const t of rows) {
    lines.push(
      [
        csvCell(new Date(t.created_at).toLocaleString("es-EC")),
        csvCell(nameById.get(t.user_id ?? "") || "Sin cliente"),
        csvCell(Number(t.amount).toFixed(2)),
        csvCell(STATUS_LABELS[t.status] ?? t.status),
        csvCell(t.payment_method),
        csvCell(t.gateway),
        csvCell(t.gateway_transaction_id),
        csvCell(t.id),
      ].join(","),
    );
  }

  // BOM inicial (U+FEFF) para que Excel interprete el UTF-8 correctamente.
  const csv = "﻿" + lines.join("\r\n");
  const today = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="transacciones-${today}.csv"`,
    },
  });
}
