import { AlertTriangle, Info, TriangleAlert } from "lucide-react";
import { cn } from "@ai-coo/ui";
import type { IntegrationIssue } from "@/lib/integrations/health";

const LEVEL_STYLE = {
  error: {
    icon: AlertTriangle,
    box: "border-red-500/30 bg-red-500/5",
    icono: "text-red-500",
  },
  warning: {
    icon: TriangleAlert,
    box: "border-amber-500/30 bg-amber-500/5",
    icono: "text-amber-500",
  },
  info: {
    icon: Info,
    box: "border-border/60 bg-muted/40",
    icono: "text-muted-foreground",
  },
} as const;

/**
 * Lo que hay que hacer con esta integración, arriba de todo.
 *
 * Antes esta información existía pero estaba enterrada: el error del último
 * intento se veía sólo abriendo el panel del proveedor, y los avisos de
 * configuración faltante (el pitch time, el segundo de la oferta) sólo si
 * scrolleabas hasta el panel correspondiente al final de la página.
 */
export function IntegrationIssues({ issues }: { issues: IntegrationIssue[] }) {
  if (issues.length === 0) return null;

  return (
    <ul className="space-y-2">
      {issues.map((issue, index) => {
        const style = LEVEL_STYLE[issue.level];
        const Icon = style.icon;

        return (
          <li
            key={`${issue.level}-${index}`}
            className={cn("flex gap-2.5 rounded-xl border p-3", style.box)}
          >
            <Icon
              className={cn("mt-0.5 h-4 w-4 shrink-0", style.icono)}
              aria-hidden
            />
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-medium text-foreground">
                {issue.message}
              </p>
              {issue.action ? (
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {issue.action}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
