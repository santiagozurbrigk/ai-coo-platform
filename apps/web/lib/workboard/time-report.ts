import { initialsFromName } from "@/lib/workboard/mapper";
import type { MemberTimeReport, TaskTimeKind, TaskArea } from "@/types/workboard";
import { brandColors } from "@/lib/brand";

const STRATEGIC_AREAS = new Set<TaskArea>(["marketing", "ventas"]);

const AVATAR_COLORS = [
  brandColors.primary,
  "#2563EB",
  "#059669",
  "#D97706",
  "#DB2777",
  "#0891B2",
];

function avatarColorForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i) * (i + 1)) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS[hash] ?? AVATAR_COLORS[0];
}

export type TimeByMemberRow = {
  assignee_id: string;
  member_name: string | null;
  avatar_url: string | null;
  hourly_rate: number | null;
  hourly_rate_currency: string | null;
  task_id: string;
  task_title: string;
  area: string;
  estimated_minutes: number | null;
  actual_minutes: number | null;
  task_cost_usd: number | null;
};

export function buildMemberTimeReports(rows: TimeByMemberRow[]): MemberTimeReport[] {
  const byMember = new Map<
    string,
    {
      memberId: string;
      name: string;
      avatarUrl: string | null;
      hourlyRate: number | null;
      currency: string;
      totalMinutes: number;
      totalCost: number;
      tasks: Array<{
        taskId: string;
        title: string;
        minutes: number;
        estimatedMinutes: number | null;
        area: string;
      }>;
    }
  >();

  for (const row of rows) {
    const key = row.assignee_id;
    const name = row.member_name?.trim() || "Miembro";
    if (!byMember.has(key)) {
      byMember.set(key, {
        memberId: key,
        name,
        avatarUrl: row.avatar_url,
        hourlyRate: row.hourly_rate != null ? Number(row.hourly_rate) : null,
        currency: row.hourly_rate_currency ?? "USD",
        totalMinutes: 0,
        totalCost: 0,
        tasks: [],
      });
    }
    const member = byMember.get(key)!;
    const minutes = row.actual_minutes ?? 0;
    member.totalMinutes += minutes;
    member.totalCost += Number(row.task_cost_usd ?? 0);
    member.tasks.push({
      taskId: row.task_id,
      title: row.task_title,
      minutes,
      estimatedMinutes: row.estimated_minutes,
      area: row.area,
    });
  }

  return Array.from(byMember.values())
    .map((member) => {
      const strategicMinutes = member.tasks
        .filter((t) => STRATEGIC_AREAS.has(t.area as TaskArea))
        .reduce((sum, t) => sum + t.minutes, 0);
      const strategicPercent =
        member.totalMinutes > 0
          ? Math.round((strategicMinutes / member.totalMinutes) * 100)
          : 0;

      const topTasks = [...member.tasks]
        .sort((a, b) => b.minutes - a.minutes)
        .slice(0, 3)
        .map((task) => {
          const kind: TaskTimeKind = STRATEGIC_AREAS.has(task.area as TaskArea)
            ? "strategic"
            : "operational";
          let variancePercent: number | undefined;
          if (task.estimatedMinutes && task.estimatedMinutes > 0) {
            variancePercent = Math.round(
              ((task.minutes - task.estimatedMinutes) / task.estimatedMinutes) *
                100
            );
          }
          return {
            taskId: task.taskId,
            title: task.title,
            hours: Math.round((task.minutes / 60) * 10) / 10,
            kind,
            estimatedMinutes: task.estimatedMinutes ?? undefined,
            variancePercent,
          };
        });

      return {
        memberId: member.memberId,
        name: member.name,
        initials: initialsFromName(member.name),
        avatarColor: avatarColorForId(member.memberId),
        avatarUrl: member.avatarUrl ?? undefined,
        totalHours: Math.round((member.totalMinutes / 60) * 10) / 10,
        strategicPercent,
        operationalPercent: 100 - strategicPercent,
        topTasks,
        totalCostUsd: member.totalCost > 0 ? member.totalCost : undefined,
        hourlyRate: member.hourlyRate ?? undefined,
        currency: member.currency,
      };
    })
    .sort((a, b) => b.totalHours - a.totalHours);
}

export type AutomationInsight = {
  id: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
};

export function buildAutomationInsights(
  reports: MemberTimeReport[]
): AutomationInsight[] {
  const insights: AutomationInsight[] = [];
  const titleCounts = new Map<string, number>();

  for (const report of reports) {
    for (const task of report.topTasks) {
      const key = task.title.trim().toLowerCase();
      titleCounts.set(key, (titleCounts.get(key) ?? 0) + 1);
    }
  }

  for (const [titleKey, count] of titleCounts) {
    if (count >= 3) {
      const title =
        reports
          .flatMap((r) => r.topTasks)
          .find((t) => t.title.trim().toLowerCase() === titleKey)?.title ??
        titleKey;
      insights.push({
        id: `repeat-${titleKey}`,
        message: `"${title}" se repite frecuentemente. ¿Crear un SOP?`,
        actionLabel: "Crear SOP",
        actionHref: `/sops/create?title=${encodeURIComponent(title)}`,
      });
    }
  }

  for (const report of reports) {
    if (report.totalHours <= 0) continue;
    const dominant = report.topTasks[0];
    if (!dominant) continue;
    const share = (dominant.hours / report.totalHours) * 100;
    if (share > 30) {
      insights.push({
        id: `dominant-${report.memberId}-${dominant.taskId}`,
        message: `${report.name} dedica el ${Math.round(share)}% de su tiempo a "${dominant.title}". Considerar delegar o automatizar.`,
      });
    }

    const withEstimates = report.topTasks.filter(
      (t) => t.estimatedMinutes != null && t.estimatedMinutes > 0
    );
    if (withEstimates.length >= 2) {
      const avgVariance =
        withEstimates.reduce((sum, t) => sum + (t.variancePercent ?? 0), 0) /
        withEstimates.length;
      if (avgVariance > 100) {
        insights.push({
          id: `optimistic-${report.memberId}`,
          message: `Las estimaciones de ${report.name} suelen ser muy optimistas. Sus tareas toman en promedio más del doble del tiempo estimado.`,
        });
      }
    }
  }

  return insights.slice(0, 6);
}
