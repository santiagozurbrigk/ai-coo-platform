"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AiCard, Badge, Button, GlassPanel } from "@ai-coo/ui";
import { paths } from "@/routes";
import type { ContentAsset } from "@/types/marketing-insights";
import { CONTENT_TYPE_LABEL } from "@/components/marketing-insights/content-labels";
import { ContentThumbnail } from "@/components/marketing-insights/content-thumbnail";
import { useMarketingData } from "@/providers";
import { InstagramEmptyState } from "./instagram-empty-state";

const MOCK_CONVERSATIONS = [
  { name: "María González", date: "14 may", tag: "closeado" },
  { name: "James Chen", date: "12 may", tag: "agendado" },
  { name: "Diego Fernández", date: "10 may", tag: "calificado" },
];

const MOCK_BOOKINGS = [
  { name: "Laura Gómez", date: "20 may", outcome: "Cerrado" },
  { name: "Carlos Vega", date: "12 may", outcome: "Cerrado" },
  { name: "Ana Torres", date: "7 may", outcome: "No cerrado" },
];

export function MarketingContentDetail({ content }: { content: ContentAsset }) {
  const { instagramConnected } = useMarketingData();
  if (!instagramConnected) return <InstagramEmptyState />;

  const touch = content.journeyTouch ?? {
    firstTouchPct: 34,
    middleTouchPct: 48,
    lastBeforeDmPct: 18,
  };

  return (
    <div className="space-y-8">
      <Button variant="ghost" size="sm" className="gap-2 -ml-2" asChild>
        <Link href={paths.platform.marketing.content}>
          <ArrowLeft className="h-4 w-4" />
          Contenido
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <ContentThumbnail content={content} size="lg" className="h-56 lg:h-72 aspect-video" />
        <div className="space-y-3">
          <Badge variant="secondary">{CONTENT_TYPE_LABEL[content.type]}</Badge>
          <h2 className="text-2xl font-semibold">{content.title}</h2>
          <p className="text-sm text-muted-foreground">Publicado {content.publishDate}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Alcance", value: content.reach.toLocaleString("es-ES") },
          { label: "Impresiones", value: content.impressions.toLocaleString("es-ES") },
          { label: "Likes", value: content.likes.toLocaleString("es-ES") },
          { label: "Comentarios", value: String(content.comments) },
          { label: "Saves", value: String(content.saves) },
          { label: "Shares", value: String(content.shares) },
        ].map((m) => (
          <GlassPanel key={m.label} className="p-3 text-center">
            <p className="text-2xs text-muted-foreground">{m.label}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{m.value}</p>
          </GlassPanel>
        ))}
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-medium">Conversaciones generadas</h3>
        <div className="rounded-xl border border-border divide-y divide-border">
          {MOCK_CONVERSATIONS.map((c) => (
            <div key={c.name} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{c.tag}</Badge>
                <Button size="sm" variant="ghost" asChild>
                  <Link href={paths.platform.sales.inbox}>Abrir en bandeja</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium">Bookings influenciados</h3>
        <div className="rounded-xl border border-border divide-y divide-border">
          {MOCK_BOOKINGS.map((b) => (
            <div key={b.name} className="flex justify-between px-4 py-3 text-sm">
              <span className="font-medium">{b.name}</span>
              <span className="text-muted-foreground">
                {b.date} · {b.outcome}
              </span>
            </div>
          ))}
        </div>
      </section>

      <GlassPanel className="p-6 text-center" glow>
        <p className="text-sm text-muted-foreground">Revenue influenciado</p>
        <p className="text-4xl font-semibold mt-2 text-primary tabular-nums">
          ${content.revenueInfluencedAmount.toLocaleString("es-ES")}
        </p>
      </GlassPanel>

      <section className="space-y-4">
        <h3 className="text-sm font-medium">Participación en el journey</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { label: "First touch", pct: touch.firstTouchPct },
            { label: "Middle touch", pct: touch.middleTouchPct },
            { label: "Last touch antes del DM", pct: touch.lastBeforeDmPct },
          ].map((t) => (
            <GlassPanel key={t.label} className="p-4">
              <p className="text-xs text-muted-foreground">{t.label}</p>
              <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${t.pct}%` }}
                />
              </div>
              <p className="mt-1 text-lg font-semibold">{t.pct}%</p>
            </GlassPanel>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium">Insights de IA — esta pieza</h3>
        <div className="space-y-2">
          {[
            `Este ${CONTENT_TYPE_LABEL[content.type]} tiene el mayor alcance de los últimos 30 días entre piezas similares.`,
            `Aparece como primer punto de contacto en el ${touch.firstTouchPct}% de los journeys de compra.`,
            `El ${((content.conversationsGenerated / content.interactions) * 100).toFixed(1)}% de quienes interactuaron escribieron por DM — muy por encima del promedio de 2.1%.`,
          ].map((text) => (
            <div
              key={text}
              className="text-sm border-l-4 border-l-primary/50 pl-3 py-1 text-muted-foreground"
            >
              {text}
            </div>
          ))}
        </div>
      </section>

      <AiCard title="Siguiente paso" variant="recommendation" confidence={0.87}>
        Replicá el hook de esta pieza en 2 Reels esta semana — el patrón de conversión es el más alto del mes.
      </AiCard>
    </div>
  );
}
