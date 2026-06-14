import type { SopStatus } from "@ai-coo/types";
import type { Sop, SopDepartment } from "@/types/sops";

export type SopRow = {
  id: string;
  organization_id: string;
  title: string;
  department: string;
  content: string;
  goal: string | null;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  expected_outcome?: string | null;
  additional_context?: string | null;
  generated_by_ai?: boolean;
  ai_model?: string | null;
  version?: number;
  author_user_id?: string | null;
  tags?: string[] | null;
  estimated_duration_minutes?: number | null;
};

const VALID_DEPARTMENTS = new Set([
  "sales",
  "marketing",
  "delivery",
  "operations",
  "finance",
  "general",
  "founder",
]);

function formatLastUpdated(iso: string): string {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function parseTags(raw: SopRow["tags"]): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((t) => typeof t === "string");
  return [];
}

export function rowToSop(row: SopRow): Sop {
  const department = VALID_DEPARTMENTS.has(row.department)
    ? (row.department as SopDepartment)
    : "general";

  const status = (["draft", "active", "outdated"].includes(row.status)
    ? row.status
    : "draft") as SopStatus;

  return {
    id: row.id,
    title: row.title,
    department,
    status,
    lastUpdated: formatLastUpdated(row.updated_at),
    goal: row.goal ?? row.title,
    generatedByAI: row.generated_by_ai ?? false,
    estimatedDurationMinutes: row.estimated_duration_minutes ?? undefined,
    version: row.version ?? 1,
    tags: parseTags(row.tags),
  };
}
