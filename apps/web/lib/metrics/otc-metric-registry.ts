/**
 * otc-metric-registry.ts
 *
 * Registro centralizado de TODAS las métricas que el software OTC conoce.
 * Cada métrica tiene un key estándar, aliases en español para auto-detectar
 * columnas de Excel, la sección donde vive y el formato de display.
 *
 * Usado por:
 *  - importMetricSnapshotsAction: mapear columnas Excel → keys estándar
 *  - MetricSnapshotsSection: mostrar labels legibles en vez de keys crudos
 *  - Custom metrics: fuente "snapshot:{key}" → último valor importado
 */

import type { SnapshotLocation } from "./snapshot-locations";
import type { MetricDisplayFormat } from "./custom-metrics";
import { normalizeKey } from "@/lib/clients/column-mapper";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type OtcMetricDef = {
  key: string;                    // key estándar en DB (snake_case)
  label: string;                  // label en español para mostrar en UI
  description: string;            // descripción breve
  aliases: string[];              // nombres alternativos que el sistema reconoce
  location: SnapshotLocation;     // sección donde aparece por defecto
  displayFormat: MetricDisplayFormat;
};

// ─── Registro ─────────────────────────────────────────────────────────────────

export const OTC_METRIC_REGISTRY: OtcMetricDef[] = [

  // ── Ventas ────────────────────────────────────────────────────────────────
  {
    key: "leads",
    label: "Leads",
    description: "Nuevos contactos / prospectos ingresados en el período",
    aliases: [
      "leads", "lead", "nuevos leads", "leads nuevos", "contactos nuevos",
      "prospectos", "nuevos prospectos", "consultas", "nuevas consultas",
      "mensajes nuevos", "ingresos leads",
    ],
    location: "sales",
    displayFormat: "number",
  },
  {
    key: "chats_abiertos",
    label: "Chats abiertos",
    description: "Conversaciones activas en DMs",
    aliases: [
      "chats abiertos", "chats", "conversaciones activas", "dms activos",
      "mensajes abiertos", "chats activos", "conversaciones abiertas",
      "dms abiertos",
    ],
    location: "sales",
    displayFormat: "number",
  },
  {
    key: "tasa_agendamiento",
    label: "Tasa de agendamiento",
    description: "% de leads que agendaron una llamada",
    aliases: [
      "tasa de agendamiento", "tasa agendamiento", "agendamiento",
      "booking rate", "scheduling rate", "tasa de agenda", "tasa agenda",
      "% agendamiento", "agendamiento %", "tasa booking",
    ],
    location: "sales",
    displayFormat: "percentage",
  },
  {
    key: "agendados",
    label: "Agendados",
    description: "Cantidad de llamadas agendadas",
    aliases: [
      "agendados", "llamadas agendadas", "citas agendadas", "appointments",
      "bookings", "demos agendadas", "reuniones agendadas",
    ],
    location: "sales",
    displayFormat: "number",
  },

  // ── Closing ───────────────────────────────────────────────────────────────
  {
    key: "llamadas_realizadas",
    label: "Llamadas realizadas",
    description: "Llamadas de cierre efectivamente realizadas",
    aliases: [
      "llamadas realizadas", "llamadas", "calls realizados", "calls",
      "reuniones realizadas", "reuniones", "llamadas hechas", "meetings",
      "demos realizadas", "calls efectivos",
    ],
    location: "closing",
    displayFormat: "number",
  },
  {
    key: "tasa_cierre",
    label: "Tasa de cierre",
    description: "% de llamadas que resultaron en venta",
    aliases: [
      "tasa de cierre", "tasa cierre", "close rate", "closing rate",
      "% cierre", "cierre", "tasa de close", "tasa close",
      "conversion llamadas", "% conversion llamadas",
    ],
    location: "closing",
    displayFormat: "percentage",
  },
  {
    key: "tasa_no_show",
    label: "Tasa no-show",
    description: "% de personas que no asistieron a la llamada",
    aliases: [
      "tasa no show", "no show", "no-show", "tasa de no show",
      "ausentes", "% no show", "no shows", "ausencias",
    ],
    location: "closing",
    displayFormat: "percentage",
  },
  {
    key: "cierres",
    label: "Cierres",
    description: "Cantidad de ventas cerradas",
    aliases: [
      "cierres", "ventas cerradas", "clientes cerrados", "closed deals",
      "deals cerrados", "ventas", "closes",
    ],
    location: "closing",
    displayFormat: "number",
  },

  // ── Finanzas ──────────────────────────────────────────────────────────────
  {
    key: "revenue",
    label: "Revenue",
    description: "Facturación total del período",
    aliases: [
      "revenue", "facturacion", "facturación", "ingresos", "ventas totales",
      "total ventas", "total ingresos", "cash collected", "cobrado",
      "factura total", "ingresos totales",
    ],
    location: "finance",
    displayFormat: "currency_ars",
  },
  {
    key: "mrr",
    label: "MRR",
    description: "Monthly Recurring Revenue",
    aliases: [
      "mrr", "monthly recurring revenue", "ingresos recurrentes",
      "membresias", "membresías", "suscripciones", "recurrente",
    ],
    location: "finance",
    displayFormat: "currency_ars",
  },
  {
    key: "ticket_promedio",
    label: "Ticket promedio",
    description: "Valor promedio por venta",
    aliases: [
      "ticket promedio", "precio promedio", "average ticket", "ticket medio",
      "valor promedio venta", "valor promedio", "precio promedio venta",
    ],
    location: "finance",
    displayFormat: "currency_ars",
  },
  {
    key: "gastos",
    label: "Gastos",
    description: "Gastos operativos del período",
    aliases: [
      "gastos", "costos", "expenses", "egresos", "costos totales",
      "gastos totales", "gastos operativos",
    ],
    location: "finance",
    displayFormat: "currency_ars",
  },

  // ── Marketing ─────────────────────────────────────────────────────────────
  {
    key: "inversion_ads",
    label: "Inversión ads",
    description: "Gasto en publicidad pagada",
    aliases: [
      "inversion ads", "inversión ads", "inversión publicidad", "ad spend",
      "gasto ads", "presupuesto ads", "publicidad pagada", "pauta",
      "inversión en publicidad", "inversion publicidad", "budget ads",
    ],
    location: "marketing",
    displayFormat: "currency_ars",
  },
  {
    key: "roas",
    label: "ROAS",
    description: "Retorno sobre inversión publicitaria",
    aliases: ["roas", "return on ad spend", "retorno ads"],
    location: "marketing",
    displayFormat: "decimal",
  },
  {
    key: "cpa",
    label: "CPA",
    description: "Costo por adquisición",
    aliases: [
      "cpa", "costo por lead", "costo por cliente", "costo por adquisicion",
      "costo por adquisición", "cost per acquisition", "cost per lead", "cpl",
    ],
    location: "marketing",
    displayFormat: "currency_ars",
  },
  {
    key: "impresiones",
    label: "Impresiones",
    description: "Total de impresiones en contenido",
    aliases: ["impresiones", "impressions", "total impresiones"],
    location: "marketing",
    displayFormat: "number",
  },
  {
    key: "alcance",
    label: "Alcance",
    description: "Personas alcanzadas por el contenido",
    aliases: ["alcance", "reach", "personas alcanzadas", "alcance total"],
    location: "marketing",
    displayFormat: "number",
  },
  {
    key: "publicaciones",
    label: "Publicaciones",
    description: "Piezas de contenido publicadas",
    aliases: [
      "publicaciones", "posts", "contenido publicado", "piezas publicadas",
      "publicaciones instagram", "piezas de contenido", "reels",
    ],
    location: "marketing",
    displayFormat: "number",
  },

  // ── Clientes ──────────────────────────────────────────────────────────────
  {
    key: "clientes_nuevos",
    label: "Clientes nuevos",
    description: "Nuevos clientes incorporados en el período",
    aliases: [
      "clientes nuevos", "nuevos clientes", "new clients", "alumnos nuevos",
      "nuevos alumnos", "incorporaciones", "ingresos clientes",
    ],
    location: "clients",
    displayFormat: "number",
  },
  {
    key: "clientes_activos",
    label: "Clientes activos",
    description: "Total de clientes vigentes",
    aliases: [
      "clientes activos", "active clients", "clientes vigentes",
      "alumnos activos", "total clientes", "clientes totales",
    ],
    location: "clients",
    displayFormat: "number",
  },
  {
    key: "churn",
    label: "Churn",
    description: "Clientes que se dieron de baja",
    aliases: ["churn", "bajas", "cancelaciones", "churned", "clientes perdidos", "abandonos"],
    location: "clients",
    displayFormat: "number",
  },
  {
    key: "nps",
    label: "NPS",
    description: "Net Promoter Score",
    aliases: ["nps", "net promoter score", "satisfaccion", "satisfacción", "nota promedio"],
    location: "clients",
    displayFormat: "number",
  },

  // ── Dashboard / general ───────────────────────────────────────────────────
  {
    key: "tasa_conversion",
    label: "Tasa de conversión",
    description: "% de leads que se convierten en clientes",
    aliases: [
      "tasa de conversion", "tasa de conversión", "conversion rate",
      "tasa conversion", "% conversion", "conversion total",
    ],
    location: "dashboard",
    displayFormat: "percentage",
  },
];

// ─── Lookup helpers ───────────────────────────────────────────────────────────

export function findOtcMetricByKey(key: string): OtcMetricDef | undefined {
  return OTC_METRIC_REGISTRY.find((m) => m.key === key);
}

// Pre-build alias map: normalizedAlias → metric key
const _aliasMap = new Map<string, string>();
for (const metric of OTC_METRIC_REGISTRY) {
  for (const alias of metric.aliases) {
    _aliasMap.set(normalizeKey(alias), metric.key);
  }
}

// ─── Mapeo de columnas Excel → métricas OTC ──────────────────────────────────

export type ColumnMapping = {
  column: string;                // nombre original de la columna en el Excel
  otcKey: string | null;         // key OTC reconocido, o null si no se detectó
  metricDef: OtcMetricDef | null;
};

/** Intenta mapear cada columna a una métrica conocida del registro OTC. */
export function mapColumnsToOtcMetrics(columns: string[]): ColumnMapping[] {
  return columns.map((column) => {
    const otcKey = _aliasMap.get(normalizeKey(column)) ?? null;
    return {
      column,
      otcKey,
      metricDef: otcKey ? (OTC_METRIC_REGISTRY.find((m) => m.key === otcKey) ?? null) : null,
    };
  });
}
