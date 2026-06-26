import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExecutiveReport, ReportPeriod } from "@/types/executive-reports";

export const executiveReportAiResponseSchema = z.object({
  executiveSummary: z.string().min(1),
  risks: z.array(z.string().min(1)).max(6),
  bottlenecks: z.array(z.string().min(1)).max(6),
  recommendations: z.array(z.string().min(1)).max(6),
});

export type ExecutiveReportAiResponse = z.infer<
  typeof executiveReportAiResponseSchema
>;

export type ExecutiveReportRecord = {
  period: ReportPeriod;
  weekLabel: string;
  periodStart: string;
  periodEnd: string;
  title: string;
  executiveSummary: string;
  risks: string[];
  bottlenecks: string[];
  recommendations: string[];
  departments: ExecutiveReport["departments"];
  generatedAt: string;
};

export async function saveExecutiveReport(
  admin: SupabaseClient,
  organizationId: string,
  record: ExecutiveReportRecord
): Promise<void> {
  const { error } = await admin.from("executive_reports").insert({
    organization_id: organizationId,
    period: record.period,
    week_label: record.weekLabel,
    period_start: record.periodStart,
    period_end: record.periodEnd,
    title: record.title,
    executive_summary: record.executiveSummary,
    risks: record.risks,
    bottlenecks: record.bottlenecks,
    recommendations: record.recommendations,
    departments: record.departments,
    generated_at: record.generatedAt,
  });

  if (error) {
    throw new Error(error.message);
  }
}
