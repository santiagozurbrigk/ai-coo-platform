import { Badge } from "@ai-coo/ui";
import type { SopStatus } from "@ai-coo/types";
import { es } from "@/lib/locale/es";

const MAP: Record<SopStatus, { label: string; variant: "default" | "secondary" | "warning" }> = {
  active: { label: es.status.sop.active, variant: "default" },
  outdated: { label: es.status.sop.outdated, variant: "warning" },
  draft: { label: es.status.sop.draft, variant: "secondary" },
};

export function SopStatusBadge({ status }: { status: SopStatus }) {
  const { label, variant } = MAP[status];
  return <Badge variant={variant}>{label}</Badge>;
}
