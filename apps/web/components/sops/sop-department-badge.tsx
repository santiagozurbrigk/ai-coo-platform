import { Badge } from "@ai-coo/ui";
import type { SopDepartment } from "@/types/sops";

const LABELS: Record<SopDepartment, string> = {
  sales: "Ventas",
  delivery: "Delivery",
  operations: "Operaciones",
  founder: "Founder",
  marketing: "Marketing",
  general: "General",
};

export function SopDepartmentBadge({
  department,
}: {
  department: SopDepartment;
}) {
  return (
    <Badge variant="outline" className="text-[10px]">
      {LABELS[department]}
    </Badge>
  );
}
