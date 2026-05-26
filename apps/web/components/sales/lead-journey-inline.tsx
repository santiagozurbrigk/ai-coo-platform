"use client";

import Link from "next/link";
import { ArrowRight, MessageSquare, Sparkles } from "lucide-react";
import { Badge, Caption, cn } from "@ai-coo/ui";
import { paths } from "@/routes";
import { getContentById } from "@/mocks/marketing-insights";
import type { JourneyStep, LeadJourney } from "@/types/marketing-insights";
import { ContentThumbnail } from "@/components/marketing-insights/content-thumbnail";

function InlineStep({ step }: { step: JourneyStep }) {
  const content = step.contentId ? getContentById(step.contentId) : undefined;
  const isDm = step.type === "dm";
  const isBooking = step.type === "booking";
  const isSale = step.type === "sale";

  if (content) {
    return (
      <Link
        href={paths.platform.sales.marketingInsights.content(content.id)}
        className="group flex w-[100px] shrink-0 flex-col gap-1.5"
      >
        <ContentThumbnail content={content} size="sm" className="h-16 w-full" />
        <p className="text-2xs font-medium line-clamp-2 group-hover:text-primary transition-colors">
          {step.label}
        </p>
        {step.date && (
          <span className="text-2xs text-muted-foreground">{step.date}</span>
        )}
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "flex h-16 w-[100px] shrink-0 flex-col items-center justify-center gap-1 rounded-lg border px-2 text-center",
        isDm && "border-ai/30 bg-ai/5",
        isBooking && "border-primary/30 bg-primary/5",
        isSale && "border-success/30 bg-success/5",
        !isDm && !isBooking && !isSale && "border-border bg-muted/20"
      )}
    >
      {isDm && <MessageSquare className="h-4 w-4 text-ai" />}
      <p className="text-2xs font-medium leading-tight line-clamp-2">{step.label}</p>
      {step.date && (
        <span className="text-[10px] text-muted-foreground">{step.date}</span>
      )}
    </div>
  );
}

export function LeadJourneyInline({ journey }: { journey: LeadJourney }) {
  return (
    <div className="shrink-0 overflow-hidden border-t border-white/[0.06] bg-white/[0.02]">
      <div className="flex items-center justify-between gap-2 px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-ai" />
          <Caption className="normal-case font-medium text-foreground truncate">
            Recorrido de contenido antes de esta conversación
          </Caption>
        </div>
        {journey.revenue && (
          <Badge variant="success" className="shrink-0 text-2xs">
            {journey.revenue}
          </Badge>
        )}
      </div>
      <div className="flex max-w-full items-center gap-2 overflow-x-auto overflow-y-hidden px-4 pb-4 pt-1 [scrollbar-width:thin]">
        {journey.steps.map((step, i) => (
          <div key={`${step.type}-${i}`} className="flex shrink-0 items-center gap-2">
            <InlineStep step={step} />
            {i < journey.steps.length - 1 && (
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
            )}
          </div>
        ))}
      </div>
      <p className="px-4 pb-3 text-[10px] text-muted-foreground">
        Contenido → interacción → agendamiento → venta. Miniaturas desde Google Drive (mock).
      </p>
    </div>
  );
}
