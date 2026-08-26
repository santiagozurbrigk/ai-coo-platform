/**
 * baseline-service.ts
 *
 * Servicio centralizado para leer métricas históricas (baseline) de la tabla
 * `metrics_snapshots`. Solo usar en contexto de servidor (usa adminClient).
 *
 * Cualquier módulo que necesite datos históricos de referencia debe importar
 * desde aquí, en lugar de consultar `metrics_snapshots` directamente.
 */

import { createAdminClient } from "@/lib/supabase/admin";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

export type BaselineSnapshot = {
  category: string;
  periodStart: string;   // "YYYY-MM-DD"
  periodLabel: string;   // "Enero 2025"
  metrics: Record<string, number>;
};

// ─── Funciones públicas ─────────────────────────────────────────────────────────

/**
 * Devuelve el snapshot más reciente de una categoría para la org.
 * Retorna `null` si no hay datos importados.
 */
export async function getLatestOrgBaseline(
  organizationId: string,
  category = "sales"
): Promise<BaselineSnapshot | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("metrics_snapshots")
    .select("period_start, period_label, metrics")
    .eq("organization_id", organizationId)
    .eq("category", category)
    .order("period_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    category,
    periodStart: data.period_start as string,
    periodLabel:
      (data.period_label as string | null) ??
      (data.period_start as string).slice(0, 7),
    metrics: (data.metrics as Record<string, number>) ?? {},
  };
}

/**
 * Devuelve el snapshot más reciente de **cada categoría** para la org.
 * Útil para dar contexto completo al agente de IA.
 */
export async function getAllLatestBaselines(
  organizationId: string
): Promise<BaselineSnapshot[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("metrics_snapshots")
    .select("category, period_start, period_label, metrics")
    .eq("organization_id", organizationId)
    .order("period_start", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  // Deduplicar: conservar el más reciente por categoría
  const seen = new Map<string, BaselineSnapshot>();
  for (const row of data) {
    const cat = (row.category as string) ?? "sales";
    if (!seen.has(cat)) {
      seen.set(cat, {
        category: cat,
        periodStart: row.period_start as string,
        periodLabel:
          (row.period_label as string | null) ??
          (row.period_start as string).slice(0, 7),
        metrics: (row.metrics as Record<string, number>) ?? {},
      });
    }
  }

  return Array.from(seen.values());
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Dado un snapshot de ventas, extrae los campos financieros clave
 * y los normaliza. Útil para overlays en FinanceDataProvider.
 */
export function extractFinanceBaseline(snapshot: BaselineSnapshot): {
  facturacion: number;
  gastos: number;
  cashCollected: number;
  margenPercent: number;
} {
  const m = snapshot.metrics;
  const facturacion = m["facturacion"] ?? 0;
  const gastos = m["gastos"] ?? 0;
  const cashCollected =
    m["cash_collected"] != null
      ? m["cash_collected"]
      : Math.max(0, facturacion - gastos);
  const margenPercent =
    facturacion > 0 ? ((facturacion - gastos) / facturacion) * 100 : 0;
  return { facturacion, gastos, cashCollected, margenPercent };
}
