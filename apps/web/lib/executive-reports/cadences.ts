/**
 * lib/executive-reports/cadences.ts
 *
 * Las tres cadencias de reporte, en un solo lugar.
 *
 * Salen de la §06 del `Funnel Metrics Standard v1.0`, que no las trata como
 * "el mismo reporte con distinta frecuencia" sino como **tres lecturas con
 * propósitos distintos**:
 *
 * | Cadencia | Título | Para qué |
 * |---|---|---|
 * | Diario | Pulse | Detectar roturas obvias. **No se decide con un día** |
 * | Semanal | Steering | Mover presupuesto, cortar creativos |
 * | Mensual | Truth | Los números que ve el cliente |
 *
 * ⭐ Esa diferencia es la razón de que el diario tenga su propia advertencia en
 * la UI y en el prompt. Un reporte diario que sugiere cambiar la estrategia por
 * un mal martes es peor que no tenerlo: el ruido de un solo día es enorme y el
 * documento lo dice explícitamente.
 *
 * Puro: se testea sin base ni red.
 */

import type { ReportPeriod } from "@/types/executive-reports";

export type ReportCadence = {
  id: ReportPeriod;
  /** Cómo se llama en la UI. */
  label: string;
  /** El nombre que le da el documento fuente. */
  title: string;
  /** Qué mira esta cadencia. */
  watches: string;
  /** La advertencia de lectura, si la tiene. */
  caution: string | null;
  /** Cuándo se genera, en palabras. */
  schedule: string;
};

export const REPORT_CADENCES: ReportCadence[] = [
  {
    id: "daily",
    label: "Diario",
    title: "Pulso",
    watches: "Gasto, leads, costo por lead, agendas y roturas obvias",
    caution:
      "Lectura de cinco minutos. Un solo día tiene demasiado ruido para decidir: si algo parece roto, confirmalo con el semanal.",
    schedule: "Todos los días a la mañana",
  },
  {
    id: "weekly",
    label: "Semanal",
    title: "Dirección",
    watches: "Show rate, close rate, costo por adquisición y ROAS",
    caution: null,
    schedule: "Los lunes",
  },
  {
    id: "monthly",
    label: "Mensual",
    title: "Verdad",
    watches: "ROAS general, LTV:CAC, retención y cobrado contra contratado",
    caution: null,
    schedule: "El día 1 de cada mes",
  },
];

const BY_ID = new Map(REPORT_CADENCES.map((c) => [c.id, c]));

export function getReportCadence(id: ReportPeriod): ReportCadence {
  const cadence = BY_ID.get(id);
  if (!cadence) throw new Error(`Cadencia de reporte desconocida: ${id}`);
  return cadence;
}

export function isReportPeriod(value: string): value is ReportPeriod {
  return BY_ID.has(value as ReportPeriod);
}

/**
 * ¿Un reporte de esta cadencia sigue siendo el vigente?
 *
 * Sirve para avisar en la UI cuando el último reporte quedó viejo — que casi
 * siempre significa que el cron falló o que la org no tiene datos suficientes.
 * Se da un día de gracia sobre el ciclo: un semanal generado el lunes no está
 * "vencido" el lunes siguiente a las 00:01, sino cuando ya pasó el margen.
 */
export function isStale(
  period: ReportPeriod,
  generatedAt: string,
  now: Date = new Date()
): boolean {
  const generated = Date.parse(generatedAt);
  if (!Number.isFinite(generated)) return false;

  const days = (now.getTime() - generated) / (24 * 60 * 60 * 1000);
  if (days < 0) return false;

  switch (period) {
    case "daily":
      return days > 2;
    case "weekly":
      return days > 8;
    case "monthly":
      return days > 32;
    default:
      return false;
  }
}
