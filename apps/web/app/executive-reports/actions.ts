"use server";

import { tryRequireOrganizationId } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { uuidSchema } from "@/lib/validations";
import type {
  ExecutiveReport,
  ReportPeriod,
} from "@/types/executive-reports";

const SELECT =
  "id, period, week_label, title, executive_summary, risks, bottlenecks, recommendations, departments, generated_at";

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((v) => String(v)) : [];
}

function toDepartments(value: unknown): ExecutiveReport["departments"] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (d): d is { name: string; status: string } =>
        !!d &&
        typeof d === "object" &&
        typeof (d as { name?: unknown }).name === "string"
    )
    .map((d) => ({
      name: d.name,
      status:
        d.status === "healthy" || d.status === "critical"
          ? d.status
          : "watch",
    }));
}

function mapRow(row: Record<string, unknown>): ExecutiveReport {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    period: (row.period as ReportPeriod) ?? "weekly",
    weekLabel: String(row.week_label ?? ""),
    generatedAt: String(row.generated_at ?? ""),
    executiveSummary: String(row.executive_summary ?? ""),
    risks: toStringArray(row.risks),
    bottlenecks: toStringArray(row.bottlenecks),
    recommendations: toStringArray(row.recommendations),
    departments: toDepartments(row.departments),
  };
}

export async function getLatestExecutiveReportAction(
  period: ReportPeriod
): Promise<ExecutiveReport | null> {
  if (!isSupabaseConfigured()) return null;

  const organizationId = await tryRequireOrganizationId();
  if (!organizationId) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("executive_reports")
    .select(SELECT)
    .eq("organization_id", organizationId)
    .eq("period", period)
    .order("period_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[getLatestExecutiveReport]", error.message);
    return null;
  }

  return data ? mapRow(data) : null;
}

export async function listExecutiveReportsAction(): Promise<ExecutiveReport[]> {
  if (!isSupabaseConfigured()) return [];

  const organizationId = await tryRequireOrganizationId();
  if (!organizationId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("executive_reports")
    .select(SELECT)
    .eq("organization_id", organizationId)
    .order("generated_at", { ascending: false });

  if (error) {
    console.error("[listExecutiveReports]", error.message);
    return [];
  }

  return (data ?? []).map(mapRow);
}

export async function getExecutiveReportByIdAction(
  id: string
): Promise<ExecutiveReport | null> {
  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) return null;

  if (!isSupabaseConfigured()) return null;

  const organizationId = await tryRequireOrganizationId();
  if (!organizationId) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("executive_reports")
    .select(SELECT)
    .eq("organization_id", organizationId)
    .eq("id", parsedId.data)
    .maybeSingle();

  if (error) {
    console.error("[getExecutiveReportById]", error.message);
    return null;
  }

  return data ? mapRow(data) : null;
}
