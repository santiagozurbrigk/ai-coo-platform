import { ArrowDown } from "lucide-react";
import { GlassPanel, cn } from "@ai-coo/ui";
import type { BuyerJourneyPattern } from "@/types/marketing-insights";
import { CONTENT_TYPE_LABEL } from "./content-labels";

function stepLabel(type: BuyerJourneyPattern["steps"][0]["type"]): string {
  if (type === "dm") return "DM";
  if (type === "booking") return "Agendamiento";
  if (type === "sale") return "Venta";
  return CONTENT_TYPE_LABEL[type] ?? type;
}

export function JourneyFlowVisual({
  pattern,
  className,
}: {
  pattern: BuyerJourneyPattern;
  className?: string;
}) {
  return (
    <GlassPanel className={cn("p-5", className)}>
      <p className="text-sm font-medium">{pattern.label}</p>
      <p className="mt-1 text-2xs text-muted-foreground">
        {pattern.percentage}% de recorridos con agendamiento
      </p>
      <div className="mt-6 flex flex-col items-center gap-2">
        {pattern.steps.map((step, i) => (
          <div key={`${step.type}-${i}`} className="flex flex-col items-center gap-2">
            <div
              className={cn(
                "min-w-[140px] rounded-lg border px-4 py-2.5 text-center text-sm font-medium",
                step.type === "dm" && "border-ai/40 bg-ai/10 text-ai",
                step.type === "booking" && "border-primary/40 bg-primary/10",
                step.type === "sale" && "border-success/40 bg-success/10 text-success",
                !["dm", "booking", "sale"].includes(step.type) &&
                  "border-border bg-muted/30"
              )}
            >
              {stepLabel(step.type)}
            </div>
            {i < pattern.steps.length - 1 && (
              <ArrowDown className="h-4 w-4 text-muted-foreground/60" />
            )}
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
