import { Badge } from "@ai-coo/ui";
import type { BrainContentStatus } from "@/types/ai-brain";

const LABELS: Record<BrainContentStatus, string> = {
  indexing: "Indexando",
  active: "Activo",
  error: "Error",
  archived: "Archivado",
};

const VARIANTS: Record<
  BrainContentStatus,
  "default" | "success" | "warning" | "destructive" | "secondary"
> = {
  indexing: "warning",
  active: "success",
  error: "destructive",
  archived: "secondary",
};

export function BrainStatusBadge({ status }: { status: BrainContentStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
