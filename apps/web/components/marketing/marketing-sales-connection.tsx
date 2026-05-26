"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Badge, cn, GlassPanel } from "@ai-coo/ui";
import { getContentById } from "@/mocks/marketing-insights";
import {
  mockClosedBuyerJourneys,
  mockSalesConnectionPatterns,
  mockSalesContentRank,
} from "@/mocks/marketing";
import { paths } from "@/routes";
import { ContentThumbnail } from "@/components/marketing-insights/content-thumbnail";
import { CONTENT_TYPE_LABEL } from "@/components/marketing-insights/content-labels";
import { useMarketingData } from "@/providers";
import { InstagramEmptyState } from "./instagram-empty-state";

export function MarketingSalesConnection() {
  const { instagramConnected } = useMarketingData();
  if (!instagramConnected) return <InstagramEmptyState />;

  const maxRevenue = Math.max(...mockSalesContentRank.map((r) => r.revenue));

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          ¿Qué contenido está generando tus ventas?
        </h2>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Visualizá el camino completo de cada cliente, desde el primer contenido que vio hasta
          que compró.
        </p>
      </div>

      <section className="space-y-4">
        <h3 className="text-sm font-medium">Top contenido por ventas generadas</h3>
        <div className="space-y-4">
          {mockSalesContentRank.map((rank, i) => {
            const content = getContentById(rank.contentId);
            if (!content) return null;
            const pct = (rank.revenue / maxRevenue) * 100;
            return (
              <GlassPanel key={rank.contentId} className="p-4 flex flex-wrap gap-4 items-center">
                <span className="text-xl font-bold text-muted-foreground w-8">#{i + 1}</span>
                <Link href={paths.platform.marketing.contentDetail(content.id)}>
                  <ContentThumbnail content={content} size="sm" className="h-16 w-16" />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{content.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {CONTENT_TYPE_LABEL[content.type]} · {content.publishDate}
                  </p>
                  <p className="text-sm mt-1">
                    {rank.salesCount} ventas influenciadas · $
                    {rank.revenue.toLocaleString("es-ES")} revenue
                  </p>
                  <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden max-w-md">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </GlassPanel>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-medium">Journeys de compradores</h3>
        <div className="space-y-3">
          {mockClosedBuyerJourneys.map((journey) => (
            <BuyerJourneyRow key={journey.id} journey={journey} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium">Patrones de contenido</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {mockSalesConnectionPatterns.map((text) => (
            <div
              key={text}
              className="rounded-lg border border-border border-l-4 border-l-violet-500/60 bg-muted/20 px-4 py-3 text-sm"
            >
              {text}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function BuyerJourneyRow({
  journey,
}: {
  journey: (typeof mockClosedBuyerJourneys)[number];
}) {
  const [open, setOpen] = useState(true);

  return (
    <GlassPanel className="overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-muted/20"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex flex-wrap items-center gap-2">
          {journey.clientId ? (
            <Link
              href={paths.platform.clients.detail(journey.clientId)}
              className="font-medium hover:text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              {journey.leadName}
            </Link>
          ) : (
            <span className="font-medium">{journey.leadName}</span>
          )}
          <Badge variant="success">Cerrado</Badge>
          <span className="text-sm text-muted-foreground tabular-nums">
            ${journey.closedAmount.toLocaleString("es-ES")}
          </span>
        </div>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="overflow-x-auto px-4 pb-4">
          <div className="flex items-center gap-2 min-w-max">
            {journey.steps.map((step, i) => {
              const content = step.contentId ? getContentById(step.contentId) : undefined;
              const isMilestone = step.type === "dm" || step.type === "booking" || step.type === "sale";
              return (
                <div key={`${step.type}-${i}`} className="flex items-center gap-2">
                  {i > 0 && (
                    <div className="h-px w-6 bg-border shrink-0" aria-hidden />
                  )}
                  {content ? (
                    <Link
                      href={paths.platform.marketing.contentDetail(content.id)}
                      className="w-28 shrink-0 rounded-lg border border-border p-2 hover:border-primary/40"
                    >
                      <ContentThumbnail content={content} size="sm" className="h-14 w-full" />
                      <p className="text-[10px] font-medium mt-1 line-clamp-2">{step.label}</p>
                      <p className="text-[9px] text-muted-foreground">{step.date}</p>
                    </Link>
                  ) : (
                    <div
                      className={cn(
                        "w-20 shrink-0 rounded-full px-2 py-3 text-center text-[10px] font-medium border",
                        step.type === "dm" && "border-ai/40 bg-ai/10 text-ai",
                        step.type === "booking" && "border-primary/40 bg-primary/10",
                        step.type === "sale" && "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                      )}
                    >
                      {step.label}
                      {step.date && (
                        <p className="text-[9px] opacity-70 mt-0.5">{step.date}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </GlassPanel>
  );
}
