import { Badge, cn } from "@ai-coo/ui";
import {
  LAUNCH_STATUS_CLASS,
  LAUNCH_STATUS_LABEL,
} from "@/lib/launches/format";
import type { LaunchStatus } from "@/types/launches";

export function LaunchStatusBadge({ status }: { status: LaunchStatus }) {
  return (
    <Badge variant="outline" className={cn("text-[11px]", LAUNCH_STATUS_CLASS[status])}>
      {LAUNCH_STATUS_LABEL[status]}
    </Badge>
  );
}
