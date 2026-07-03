import type {
  LaunchDetail,
  LaunchLinkedTask,
  LaunchMetric,
  LaunchPostMortem,
  LaunchProductSummary,
  LaunchStatus,
  LaunchSummary,
} from "@/types/launches";

const LAUNCH_STATUSES = new Set<LaunchStatus>([
  "planning",
  "active",
  "completed",
  "cancelled",
]);

type LaunchRow = Record<string, unknown>;

function parseStatus(value: unknown): LaunchStatus {
  if (typeof value === "string" && LAUNCH_STATUSES.has(value as LaunchStatus)) {
    return value as LaunchStatus;
  }
  return "planning";
}

function parseProduct(row: LaunchRow): LaunchProductSummary | null {
  const product = row.product;
  if (!product || typeof product !== "object") return null;
  const p = product as Record<string, unknown>;
  return {
    name: String(p.name ?? "Producto"),
    type: (p.type as string) ?? null,
    price: p.price != null ? Number(p.price) : null,
    currency: (p.currency as string) ?? null,
  };
}

function parseTaskCount(row: LaunchRow): number {
  const tasks = row.workboard_tasks;
  if (Array.isArray(tasks) && tasks[0] && typeof tasks[0] === "object") {
    const count = (tasks[0] as { count?: number }).count;
    if (typeof count === "number") return count;
  }
  if (Array.isArray(row.tasks)) return row.tasks.length;
  return 0;
}

export function parsePostMortem(raw: string | null | undefined): LaunchPostMortem | null {
  if (!raw?.trim()) return null;
  try {
    return JSON.parse(raw) as LaunchPostMortem;
  } catch {
    return null;
  }
}

export function rowToLaunchSummary(row: LaunchRow): LaunchSummary {
  return {
    id: String(row.id),
    name: String(row.name),
    description: (row.description as string) ?? null,
    status: parseStatus(row.status),
    launchDate: (row.launch_date as string) ?? null,
    endDate: (row.end_date as string) ?? null,
    goalRevenue: row.goal_revenue != null ? Number(row.goal_revenue) : null,
    actualRevenue: Number(row.actual_revenue ?? 0),
    goalClients: row.goal_clients != null ? Number(row.goal_clients) : null,
    actualClients: Number(row.actual_clients ?? 0),
    product: parseProduct(row),
    taskCount: parseTaskCount(row),
    hasPostMortem: Boolean(row.post_mortem),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
  };
}

function rowToLaunchMetric(row: Record<string, unknown>): LaunchMetric {
  return {
    id: String(row.id),
    date: String(row.date),
    revenue: Number(row.revenue ?? 0),
    newClients: Number(row.new_clients ?? 0),
    conversationsStarted: Number(row.conversations_started ?? 0),
    bookings: Number(row.bookings ?? 0),
  };
}

function rowToLinkedTask(row: Record<string, unknown>): LaunchLinkedTask {
  const assignee = row.assignee as
    | { full_name?: string | null; email?: string }
    | null
    | undefined;

  const assigneeRows = row.assignees as
    | Array<{ profile?: { full_name?: string | null; email?: string } | null }>
    | null
    | undefined;

  const assigneeNames = (assigneeRows ?? [])
    .map((entry) => {
      const profile = entry.profile;
      return (
        profile?.full_name?.trim() ||
        profile?.email?.split("@")[0] ||
        null
      );
    })
    .filter((name): name is string => Boolean(name));

  const legacyName =
    assignee?.full_name?.trim() ||
    assignee?.email?.split("@")[0] ||
    null;

  return {
    id: String(row.id),
    title: String(row.title),
    area: String(row.area),
    status: String(row.status),
    assigneeName:
      assigneeNames.length > 0
        ? assigneeNames.join(", ")
        : legacyName,
    actualMinutes:
      row.actual_minutes != null ? Number(row.actual_minutes) : null,
  };
}

export function rowToLaunchDetail(row: LaunchRow): LaunchDetail {
  const summary = rowToLaunchSummary(row);
  const metricsRaw = row.metrics ?? row.launch_metrics;
  const tasksRaw = row.tasks ?? row.workboard_tasks;

  return {
    ...summary,
    productId: (row.product_id as string) ?? null,
    postMortem: parsePostMortem(row.post_mortem as string | undefined),
    postMortemGeneratedAt: (row.post_mortem_generated_at as string) ?? null,
    metrics: Array.isArray(metricsRaw)
      ? metricsRaw.map((m) => rowToLaunchMetric(m as Record<string, unknown>))
      : [],
    tasks: Array.isArray(tasksRaw)
      ? tasksRaw
          .filter((t) => t && typeof t === "object" && "title" in (t as object))
          .map((t) => rowToLinkedTask(t as Record<string, unknown>))
      : [],
  };
}
