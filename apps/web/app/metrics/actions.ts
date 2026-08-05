"use server";

import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import {
  applyOperation,
  formatMetricValue,
  resolveSourceValue,
  type ComputedCustomMetric,
  type CustomMetric,
  type MetricDisplayFormat,
  type MetricOperation,
  type MetricSource,
} from "@/lib/metrics/custom-metrics";
import { runMutation, type MutationResult } from "@/lib/server/action-result";

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getCustomMetricsAction(): Promise<ComputedCustomMetric[]> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("custom_metrics")
    .select("*")
    .eq("organization_id", organizationId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

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
