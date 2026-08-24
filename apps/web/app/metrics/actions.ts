"use server";

import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { MetricSnapshotInput } from "@/lib/metrics/parse-metrics-import";
import {
  applyOperation,
  formatMetricValue,
  resolveSourceValue,
  type ComputedCustomMetric,
  type CustomMetric,
  type MetricDisplayFormat,
  type MetricDisplayLocation,
  type MetricOperation,
  type MetricSource,
} from "@/lib/metrics/custom-metrics";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import type { SnapshotLocation } from "@/lib/metrics/snapshot-locations";

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getCustomMetricsAction(
  location?: MetricDisplayLocation
): Promise<ComputedCustomMetric[]> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  let query = supabase
    .from("custom_metrics")
    .select("*")
    .eq("organization_id", organizationId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (location) {
    query = query.eq("display_location", location);
  }

  const { data, error } = await query;

  if (error || !data) return [];

  const computed = await Promise.all(
    (data as CustomMetric[]).map(async (metric) => {
      const valueA = await resolveSourceValue(
        metric.source_a,
        supabase,
        organizationId
      );

      let valueB = 0;
      if (metric.operation !== "none") {
        if (metric.source_b) {
          valueB = await resolveSourceValue(
            metric.source_b,
            supabase,
            organizationId
          );
        } else if (metric.constant_b != null) {
          valueB = Number(metric.constant_b);
        }
      }

      const raw_value = applyOperation(valueA, metric.operation, valueB);
      const formatted_value = formatMetricValue(raw_value, metric.display_format);

      return { ...metric, raw_value, formatted_value };
    })
  );

  return computed;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export type CreateCustomMetricInput = {
  name: string;
  description?: string;
  source_a: MetricSource;
  operation: MetricOperation;
  source_b?: MetricSource;
  constant_b?: number;
  display_format: MetricDisplayFormat;
  display_location: MetricDisplayLocation;
};

export async function createCustomMetricAction(
  input: CreateCustomMetricInput
): Promise<MutationResult<{ id: string }>> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  return runMutation(async () => {
    // Get current max sort_order
    const { data: existing } = await supabase
      .from("custom_metrics")
      .select("sort_order")
      .eq("organization_id", organizationId)
      .order("sort_order", { ascending: false })
      .limit(1);

    const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

    const { data, error } = await supabase
      .from("custom_metrics")
      .insert({
        organization_id: organizationId,
        name: input.name.trim(),
        description: input.description?.trim() ?? null,
        source_a: input.source_a,
        operation: input.operation,
        source_b: input.source_b ?? null,
        constant_b: input.constant_b ?? null,
        display_format: input.display_format,
        display_location: input.display_location,
        sort_order: nextOrder,
      })
      .select("id")
      .single();

    if (error || !data) throw new Error(error?.message ?? "Error creando métrica");
    return { id: data.id };
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateCustomMetricAction(
  id: string,
  input: Partial<CreateCustomMetricInput>
): Promise<MutationResult<void>> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  return runMutation(async () => {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.name !== undefined) update.name = input.name.trim();
    if (input.description !== undefined) update.description = input.description?.trim() ?? null;
    if (input.source_a !== undefined) update.source_a = input.source_a;
    if (input.operation !== undefined) update.operation = input.operation;
    if (input.source_b !== undefined) update.source_b = input.source_b ?? null;
    if (input.constant_b !== undefined) update.constant_b = input.constant_b ?? null;
    if (input.display_format !== undefined) update.display_format = input.display_format;
    if (input.display_location !== undefined) update.display_location = input.display_location;

    const { error } = await supabase
      .from("custom_metrics")
      .update(update)
      .eq("id", id)
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteCustomMetricAction(
  id: string
): Promise<MutationResult<void>> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  return runMutation(async () => {
    const { error } = await supabase
      .from("custom_metrics")
      .delete()
      .eq("id", id)
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
  });
}

// ─── Metric Snapshots (importación histórica desde Excel) ─────────────────────

// Re-export do tipo para consumidores que já importam de actions.ts
export type { SnapshotLocation } from "@/lib/metrics/snapshot-locations";

export type MetricSnapshotRow = {
  id: string;
  organization_id: string;
  period: string;              // YYYY-MM-DD
  metric_key: string;
  value: number;
  source: string;
  display_location: SnapshotLocation;
  created_at: string;
};

export type ImportMetricSnapshotsResult = {
  upsertedCount: number;
  errors: { row: number; message: string }[];
};

export async function importMetricSnapshotsAction(
  snapshots: MetricSnapshotInput[],
  display_location: SnapshotLocation = "dashboard"
): Promise<ImportMetricSnapshotsResult> {
  if (!isSupabaseConfigured()) throw new Error("Supabase no configurado");
  if (snapshots.length === 0) return { upsertedCount: 0, errors: [] };

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const rows = snapshots.map((s) => ({
    organization_id: organizationId,
    period: s.period,
    metric_key: s.metric_key,
    value: s.value,
    source: "import" as const,
    display_location,
    updated_at: new Date().toISOString(),
  }));

  // Upsert: si ya existe (mismo org + period + metric_key), actualiza el valor y la location
  const { data, error } = await supabase
    .from("metric_snapshots")
    .upsert(rows, { onConflict: "organization_id,period,metric_key" })
    .select("id");

  if (error) throw new Error(error.message);
  return { upsertedCount: data?.length ?? 0, errors: [] };
}

export async function getMetricSnapshotsAction(
  location?: SnapshotLocation
): Promise<MetricSnapshotRow[]> {
  if (!isSupabaseConfigured()) return [];

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  let query = supabase
    .from("metric_snapshots")
    .select("*")
    .eq("organization_id", organizationId)
    .order("period", { ascending: false })
    .order("metric_key", { ascending: true });

  if (location) {
    query = query.eq("display_location", location);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as MetricSnapshotRow[];
}

export async function deleteMetricSnapshotsByPeriodAction(
  period: string,
  location?: SnapshotLocation
): Promise<MutationResult<void>> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  return runMutation(async () => {
    let query = supabase
      .from("metric_snapshots")
      .delete()
      .eq("organization_id", organizationId)
      .eq("period", period);

    if (location) {
      query = query.eq("display_location", location);
    }

    const { error } = await query;
    if (error) throw new Error(error.message);
  });
}
