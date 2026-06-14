import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/auth/bootstrap";
import type { SopDepartment } from "@/types/sops";

export type SOPOpportunity = {
  suggestedTitle: string;
  goal: string;
  department: SopDepartment;
  reason: string;
  potentialSaving: string;
};

const AREA_TO_DEPARTMENT: Record<string, SopDepartment> = {
  ventas: "sales",
  marketing: "marketing",
  operaciones: "operations",
  clientes: "delivery",
  finanzas: "finance",
  general: "general",
};

function mapAreaToDepartment(area: string): SopDepartment {
  return AREA_TO_DEPARTMENT[area.toLowerCase()] ?? "operations";
}

export async function detectSOPOpportunities(
  organizationId: string
): Promise<SOPOpportunity[]> {
  const supabase = createAdminClient();

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: tasks, error } = await supabase
    .from("workboard_tasks")
    .select("title, area, actual_minutes")
    .eq("organization_id", organizationId)
    .eq("status", "done")
    .gte("created_at", since);

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error(error.message);
  }

  if (!tasks?.length) return [];

  const titleCounts = tasks.reduce<
    Record<
      string,
      { title: string; area: string; count: number; totalMinutes: number }
    >
  >((acc, task) => {
    const key = task.title.toLowerCase().trim();
    if (!acc[key]) {
      acc[key] = {
        title: task.title,
        area: task.area,
        count: 0,
        totalMinutes: 0,
      };
    }
    acc[key].count++;
    acc[key].totalMinutes += task.actual_minutes ?? 0;
    return acc;
  }, {});

  return Object.values(titleCounts)
    .filter((t) => t.count >= 3)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((t) => ({
      suggestedTitle: `SOP: ${t.title}`,
      goal: t.title,
      department: mapAreaToDepartment(t.area),
      reason: `Esta tarea se completó ${t.count} veces en los últimos 30 días`,
      potentialSaving: `${Math.round(t.totalMinutes / 60)}hs de trabajo documentadas`,
    }));
}
