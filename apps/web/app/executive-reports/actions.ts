"use server";

import { requireOrganizationId } from "@/lib/auth/bootstrap";
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

/**
 * El último reporte de cada cadencia, en una sola consulta.
 *
 * Es lo que alimenta el panel de la topbar. Se trae todo junto y no una
 * consulta por pestaña porque el panel muestra las tres de entrada: pedirlas
 * de a una haría que cambiar de pestaña tenga latencia, sobre algo que ya
 * está en la base.
 *
 * Una cadencia sin reportes devuelve `null`, que la UI muestra como "todavía
 * no se generó" — distinto de un reporte vacío.
 */
export async function getLatestReportsByCadenceAction(): Promise<
  Record<ReportPeriod, ExecutiveReport | null>
> {
  const empty: Record<ReportPeriod, ExecutiveReport | null> = {
    daily: null,
    weekly: null,
    monthly: null,
  };

  if (!isSupabaseConfigured()) return empty;

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  // Se traen los últimos de la org y se toma el primero de cada cadencia. Con
  // el índice (organization_id, period, period_start DESC) es una sola pasada.
  const { data, error } = await supabase
    .from("executive_reports")
    .select(SELECT)
    .eq("organization_id", organizationId)
    .order("period_start", { ascending: false })
    .limit(60);

  if (error) {
    console.error("[getLatestReportsByCadence]", error.message);
    return empty;
  }

  for (const row of data ?? []) {
    const report = mapRow(row);
    if (empty[report.period] === null) empty[report.period] = report;
  }

  return empty;
}

export async function listExecutiveReportsAction(): Promise<ExecutiveReport[]> {
  if (!isSupabaseConfigured()) return [];

  const organizationId = await requireOrganizationId();
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

  const organizationId = await requireOrganizationId();

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
