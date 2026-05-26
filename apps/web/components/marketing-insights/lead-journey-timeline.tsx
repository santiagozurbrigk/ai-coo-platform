"use client";

import Link from "next/link";
import { ArrowDown, ArrowLeft, MessageSquare } from "lucide-react";
import { Badge, Button, GlassPanel, cn } from "@ai-coo/ui";
import { paths } from "@/routes";
import { getContentById } from "@/mocks/marketing-insights";
import type { JourneyStep, LeadJourney } from "@/types/marketing-insights";
import { ContentThumbnail } from "./content-thumbnail";

function TimelineStep({ step, index }: { step: JourneyStep; index: number }) {
  const content = step.contentId ? getContentById(step.contentId) : undefined;
  const isDm = step.type === "dm";
  const isBooking = step.type === "booking";
  const isSale = step.type === "sale";

  return (
    <div className="flex flex-col items-center gap-3">
      {content ? (
        <Link
          href={paths.platform.sales.marketingInsights.content(content.id)}
          className="w-full max-w-[280px] transition-opacity hover:opacity-90"
        >
          <ContentThumbnail content={content} size="md" className="h-44" />
        </Link>
      ) : (
        <GlassPanel
          className={cn(
            "flex w-full max-w-[280px] flex-col items-center justify-center gap-2 p-6 text-center",
            isDm && "border-ai/30 glow",
            isBooking && "border-primary/30",
            isSale && "border-success/30"
          )}
          glow={isDm}
        >
          {isDm && <MessageSquare className="h-8 w-8 text-ai" />}
          <p className="text-sm font-medium">{step.label}</p>
          {step.date && (
            <Badge variant="secondary" className="text-2xs">
              {step.date}
            </Badge>
          )}
        </GlassPanel>
      )}
      {content && (
        <div className="text-center">
          <p className="text-sm font-medium">{step.label}</p>
          {step.date && (
            <p className="text-2xs text-muted-foreground">{step.date}</p>
          )}
        </div>
      )}
      {index > 0 && (
        <span className="sr-only">Paso {index + 1}</span>
      )}
    </div>
  );
}

export function LeadJourneyTimeline({ journey }: { journey: LeadJourney }) {
  return (
    <div className="space-y-8">
      <Button variant="ghost" size="sm" className="gap-2 -ml-2" asChild>
        <Link href={paths.platform.sales.marketingInsights.journeys}>
          <ArrowLeft className="h-4 w-4" />
          Todos los recorridos
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{journey.leadName}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Recorrido visual desde contenido hasta conversión
          </p>
        </div>
        {journey.revenue && (
          <GlassPanel className="px-4 py-3 text-center" glow>
            <p className="text-2xs text-muted-foreground">Ingresos</p>
            <p className="text-xl font-semibold text-success">{journey.revenue}</p>
          </GlassPanel>
        )}
      </div>

      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-4">
        {journey.steps.map((step, i) => (
          <div key={`${step.type}-${i}`} className="flex flex-col items-center gap-4">
            <TimelineStep step={step} index={i} />
            {i < journey.steps.length - 1 && (
              <ArrowDown className="h-6 w-6 text-muted-foreground/50" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
