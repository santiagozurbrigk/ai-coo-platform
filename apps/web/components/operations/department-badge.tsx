import { Badge } from "@ai-coo/ui";
import type { Department } from "@/types/operations";

const LABELS: Record<Department, string> = {
  sales: "Ventas",
  delivery: "Delivery",
  operations: "Operaciones",
  marketing: "Marketing",
  founder: "Fundador",
};

export function DepartmentBadge({ department }: { department: Department }) {
  return <Badge variant="secondary">{LABELS[department]}</Badge>;
}
