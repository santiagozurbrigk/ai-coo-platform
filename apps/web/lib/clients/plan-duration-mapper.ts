import type { PlanDuration, PlanDurationSource } from "@/types/plan-durations";

export type PlanDurationRow = {
  id: string;
  organization_id: string;
  plan_name: string;
  duration_days: number | null;
  source: PlanDurationSource;
  source_detail: string | null;
  resolved_at: string;
  updated_at: string;
};

export function rowToPlanDuration(row: PlanDurationRow): PlanDuration {
  return {
    id: row.id,
    planName: row.plan_name,
    durationDays: row.duration_days,
    source: row.source,
    sourceDetail: row.source_detail ?? undefined,
    resolvedAt: row.resolved_at,
    updatedAt: row.updated_at,
  };
}
