import type { Database, ServiceType } from "@/types/database";

type ServiceRow = Database["public"]["Tables"]["services"]["Row"];

export type PublicService = Omit<ServiceRow, "type"> & { type: ServiceType };

const SERVICE_TYPES: ServiceType[] = ["manejo_redes", "auditoria", "capacitacion", "otro"];

/** Descarta servicios con un tipo desconocido y tipa el resto. */
export function toPublicServices(rows: ServiceRow[] | null | undefined): PublicService[] {
  return (rows ?? []).flatMap((row) =>
    SERVICE_TYPES.includes(row.type as ServiceType)
      ? [{ ...row, type: row.type as ServiceType }]
      : [],
  );
}

export function isHourlyService(service: PublicService): boolean {
  return /precio por hora/i.test(service.description ?? "");
}

/**
 * Nombre para mostrar, separado en título y detalle, sin repetir lo que ya
 * dice el precio:
 * "Redes Sociales - Paquete Inicial" → "Inicial"
 * "Sesión Audiovisual (6 videos)" → "Sesión Audiovisual" + "6 videos"
 * "Curso (3 meses)" → "Curso" (la duración va junto al precio)
 * "Modelo (1 hora)" → "Modelo" cuando se cobra por hora
 */
export function getServiceDisplayName(service: PublicService): { title: string; detail: string | null } {
  let name = service.name;
  if (service.type === "manejo_redes") {
    name = name.replace(/^redes sociales\s*-\s*(paquete\s+)?/i, "");
  }
  if (service.type !== "manejo_redes" && service.duration_months > 1) {
    name = name.replace(/\s*\(\d+\s*meses\)\s*$/i, "");
  }
  if (isHourlyService(service)) {
    name = name.replace(/\s*\(1\s*hora\)\s*$/i, "");
  }

  const match = name.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  const title = (match ? match[1] : name).trim();
  const detail = match ? match[2].trim() : null;
  return { title: title || service.name, detail: detail || null };
}

/** Precio y su unidad: "/mes" en redes, "/hora" si se cobra por hora, duración en planes largos. */
export function getServicePrice(service: PublicService): { amount: string; unit: string | null } {
  if (service.price === 0) return { amount: "Gratis", unit: null };
  const amount = `$${service.price}`;
  if (service.type === "manejo_redes") return { amount, unit: "/mes" };
  if (isHourlyService(service)) return { amount, unit: "/hora" };
  if (service.duration_months > 1) return { amount, unit: `· ${service.duration_months} meses` };
  return { amount, unit: null };
}

/**
 * Viñetas a partir de la descripción: primero los elementos de la lista
 * "Incluye: a, b, c" y luego las demás oraciones. Se omiten las
 * aclaraciones ("No incluye…", "Precios no incluyen…", "Precio por hora", que ya
 * muestra el precio).
 */
export function getServiceHighlights(service: PublicService, max = 3): string[] {
  const sentences = (service.description ?? "")
    .split(/\.\s+/)
    .map((sentence) => sentence.replace(/\.$/, "").trim())
    .filter(Boolean);

  // Primero lo que incluye (lo más concreto) y después el resto de oraciones.
  const included: string[] = [];
  const others: string[] = [];
  for (const sentence of sentences) {
    if (/^(no incluye|precios no incluyen|precio por hora)/i.test(sentence)) continue;
    if (/^incluye:/i.test(sentence)) {
      included.push(...sentence.replace(/^incluye:\s*/i, "").split(/,\s*/));
    } else {
      others.push(sentence);
    }
  }

  return [...included, ...others]
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, max)
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1));
}
