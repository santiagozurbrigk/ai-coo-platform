export type PlanDurationSource = "rag" | "manual" | "unknown";

export type PlanDuration = {
  id: string;
  planName: string;
  durationDays: number | null;
  source: PlanDurationSource;
  sourceDetail?: string;
  resolvedAt: string;
  updatedAt: string;
};
