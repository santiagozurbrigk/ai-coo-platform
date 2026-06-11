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
};

const VALID_DEPARTMENTS = new Set([
  "sales",
  "marketing",
  "delivery",
  "operations",
  "finance",
  "general",
]);

function formatLastUpdated(iso: string): string {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
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
  };
}
