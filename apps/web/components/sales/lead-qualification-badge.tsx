"use client";

import { Badge, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ai-coo/ui";
import type { LeadQualificationScore } from "@/types/sales";
import { getQualificationTierLabel } from "@/lib/sales/qualification-score";

const TIER_VARIANT = {
  high: "success",
  medium: "warning",
  low: "destructive",
} as const;

export function LeadQualificationBadge({
  score,
  compact = false,
}: {
  score: LeadQualificationScore;
  compact?: boolean;
}) {
  const variant = TIER_VARIANT[score.tier];

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={variant} className="shrink-0 tabular-nums">
            {compact ? score.overall : `${score.overall} · ${getQualificationTierLabel(score.tier)}`}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[220px] text-left">
          Score basado en engagement, respuestas y señales de compra detectadas.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
