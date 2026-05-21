import { Badge } from "@ai-coo/ui";
import type { ConversationStatus } from "@ai-coo/types";
import { es } from "@/lib/locale/es";

const CONFIG: Record<
  ConversationStatus,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" }
> = {
  active: { label: es.status.conversation.active, variant: "default" },
  ghosted: { label: es.status.conversation.ghosted, variant: "destructive" },
  booked: { label: es.status.conversation.booked, variant: "success" },
  closed: { label: es.status.conversation.closed, variant: "secondary" },
};

export function ConversationStatusBadge({ status }: { status: ConversationStatus }) {
  const { label, variant } = CONFIG[status];
  return <Badge variant={variant}>{label}</Badge>;
}
