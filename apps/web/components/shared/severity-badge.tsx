import { Badge } from "@ai-coo/ui";
import { es } from "@/lib/locale/es";

export function SeverityBadge({
  severity,
}: {
  severity: "high" | "medium" | "low";
}) {
  const variant =
    severity === "high"
      ? "destructive"
      : severity === "medium"
        ? "warning"
        : "secondary";
  return (
    <Badge variant={variant}>{es.status.severity[severity]}</Badge>
  );
}
