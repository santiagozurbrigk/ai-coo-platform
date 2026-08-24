import type { SupabaseClient } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────

export const METRIC_SOURCES = [
  // Clientes
  { value: "clients_total",     label: "Clientes totales",          group: "Clientes" },
  { value: "clients_active",    label: "Clientes activos",          group: "Clientes" },
  { value: "clients_mrr",       label: "MRR (suma total_amount)",   group: "Clientes" },
  { value: "clients_new_month", label: "Nuevos clientes (mes)",     group: "Clientes" },
  // Conversaciones
  { value: "conversations_total",   label: "DMs totales",             group: "Ventas" },
  { value: "conversations_active",  label: "Conversaciones activas",  group: "Ventas" },
  { value: "conversations_booked",  label: "Agendados (DMs)",         group: "Ventas" },
  { value: "conversations_ghosted", label: "Ghosteados",              group: "Ventas" },
  // Closing
  { value: "closing_total",         label: "Llamadas totales",        group: "Closing" },
  { value: "closing_closed",        label: "Llamadas cerradas",       group: "Closing" },
  { value: "closing_scheduled",     label: "Llamadas agendadas",      group: "Closing" },
  // Contenido
  { value: "content_total",         label: "Piezas de contenido",     group: "Marketing" },
] as const;

/**
 * MetricSource puede ser:
 *  - uno de los valores hardcodeados en METRIC_SOURCES (live desde DB)
 *  - "snapshot:{key}" → último valor importado del registro OTC para ese key
 */
export type MetricSource = (typeof METRIC_SOURCES)[number]["value"] | `snapshot:${string}`;

export const METRIC_DISPLAY_LOCATIONS = [
  { value: "dashboard",  label: "Panel General",  icon: "LayoutDashboard" },
  { value: "clients",    label: "Clientes",        icon: "Users"           },
  { value: "sales",      label: "Ventas",          icon: "MessageSquare"   },
  { value: "closing",    label: "Closing",         icon: "Phone"           },
  { value: "marketing",  label: "Marketing",       icon: "TrendingUp"      },
  { value: "finance",    label: "Finanzas",        icon: "DollarSign"      },
] as const;

export type MetricDisplayLocation = (typeof METRIC_DISPLAY_LOCATIONS)[number]["value"];

export const METRIC_OPERATIONS = [
  { value: "none",     label: "Sin operación (valor directo)" },
  { value: "multiply", label: "Multiplicar  (A × B)"          },
  { value: "divide",   label: "Dividir       (A ÷ B)"         },
  { value: "add",      label: "Sumar         (A + B)"         },
  { value: "subtract", label: "Restar        (A − B)"         },
] as const;

export type MetricOperation = (typeof METRIC_OPERATIONS)[number]["value"];

export const METRIC_DISPLAY_FORMATS = [
  { value: "number",       label: "Número entero"   },
  { value: "decimal",      label: "Decimal (0.00)"  },
  { value: "currency_usd", label: "Moneda USD ($)"  },
  { value: "currency_ars", label: "Moneda ARS ($)"  },
  { value: "percentage",   label: "Porcentaje (%)"  },
] as const;

export type MetricDisplayFormat = (typeof METRIC_DISPLAY_FORMATS)[number]["value"];

export type CustomMetric = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  source_a: MetricSource;
  operation: MetricOperation;
  source_b: MetricSource | null;
  constant_b: number | null;
  display_format: MetricDisplayFormat;
  display_location: MetricDisplayLocation;
  sort_order: number;
  created_at: string;
};

export type ComputedCustomMetric = CustomMetric & {
  raw_value: number;
  formatted_value: string;
};

// ─── Source resolver ──────────────────────────────────────────────────────────

export async function resolveSourceValue(
  source: MetricSource,
  supabase: SupabaseClient,
  organizationId: string
): Promise<number> {
  // Valor importado desde Excel — busca el snapshot más reciente para ese key
  if (source.startsWith("snapshot:")) {
    const metric_key = source.slice(9);
    const { data } = await supabase
      .from("metric_snapshots")
      .select("value")
      .eq("organization_id", organizationId)
      .eq("metric_key", metric_key)
      .order("period", { ascending: false })
      .limit(1)
      .single();
    return data ? Number(data.value) : 0;
  }

  switch (source) {
    case "clients_total": {
      const { count } = await supabase
        .from("clients")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId);
      return count ?? 0;
    }
    case "clients_active": {
      const { count } = await supabase
        .from("clients")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("status", "active");
      return count ?? 0;
    }
    case "clients_mrr": {
      const { data } = await supabase
        .from("clients")
        .select("total_amount")
        .eq("organization_id", organizationId)
        .eq("status", "active");
      return (data ?? []).reduce((sum, c) => sum + Number(c.total_amount ?? 0), 0);
    }
    case "clients_new_month": {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("clients")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .gte("join_date", startOfMonth.toISOString());
      return count ?? 0;
    }
    case "conversations_total": {
      const { count } = await supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId);
      return count ?? 0;
    }
    case "conversations_active": {
      const { count } = await supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("status", "active");
      return count ?? 0;
    }
    case "conversations_booked": {
      const { count } = await supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("status", "booked");
      return count ?? 0;
    }
    case "conversations_ghosted": {
      const { count } = await supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("status", "ghosted");
      return count ?? 0;
    }
    case "closing_total": {
      const { count } = await supabase
        .from("closing_calls")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId);
      return count ?? 0;
    }
    case "closing_closed": {
      const { count } = await supabase
        .from("closing_calls")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("status", "closed");
      return count ?? 0;
    }
    case "closing_scheduled": {
      const { count } = await supabase
        .from("closing_calls")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("status", "scheduled");
      return count ?? 0;
    }
    case "content_total": {
      const { count } = await supabase
        .from("content_pieces")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId);
      return count ?? 0;
    }
    default:
      return 0;
  }
}

// ─── Operation resolver ───────────────────────────────────────────────────────

export function applyOperation(
  a: number,
  operation: MetricOperation,
  b: number
): number {
  switch (operation) {
    case "multiply":  return a * b;
    case "divide":    return b !== 0 ? a / b : 0;
    case "add":       return a + b;
    case "subtract":  return a - b;
    case "none":
    default:          return a;
  }
}

// ─── Formatter ────────────────────────────────────────────────────────────────

export function formatMetricValue(
  value: number,
  format: MetricDisplayFormat
): string {
  switch (format) {
    case "currency_usd":
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    case "currency_ars":
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    case "percentage":
      return `${value.toFixed(1).replace(".", ",")}%`;
    case "decimal":
      return value.toFixed(2).replace(".", ",");
    case "number":
    default:
      return Math.round(value).toLocaleString("es-AR");
  }
}
