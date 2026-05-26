import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AiCard, Badge, Button, GlassPanel } from "@ai-coo/ui";
import { paths } from "@/routes";
import type { ContentAsset } from "@/types/marketing-insights";
import { CONTENT_TYPE_LABEL } from "./content-labels";
import { ContentThumbnail } from "./content-thumbnail";
import { Panel } from "@/components/shared/panel";

export function ContentDetailView({ content }: { content: ContentAsset }) {
  return (
    <div className="space-y-8">
      <Button variant="ghost" size="sm" className="gap-2 -ml-2" asChild>
        <Link href={paths.platform.sales.marketingInsights.library}>
          <ArrowLeft className="h-4 w-4" />
          Biblioteca de contenido
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
        <ContentThumbnail content={content} size="lg" className="h-64 lg:h-80" />
        <div className="space-y-4">
          <div>
            <Badge variant="secondary" className="mb-2">
              {CONTENT_TYPE_LABEL[content.type]}
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight">{content.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Publicado {content.publishDate} · {content.driveSource}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Conversaciones", value: String(content.conversationsGenerated) },
              { label: "Agendamientos", value: String(content.bookingsInfluenced) },
              { label: "Ventas", value: String(content.salesInfluenced) },
            ].map((m) => (
              <GlassPanel key={m.label} className="p-3 text-center">
                <p className="text-2xs text-muted-foreground">{m.label}</p>
                <p className="mt-1 text-lg font-semibold">{m.value}</p>
              </GlassPanel>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Participación en recorridos">
          <p className="text-sm">
            Este contenido aparece en el{" "}
            <span className="font-semibold text-primary">
              {content.journeyParticipationPct}%
            </span>{" "}
            de los recorridos de compradores que agendaron.
          </p>
          <Button variant="outline" size="sm" className="mt-3" asChild>
            <Link href={paths.platform.sales.inbox}>
              Ver en bandeja de ventas
            </Link>
          </Button>
        </Panel>

        <Panel title="Impacto en conversaciones">
          <p className="text-sm text-muted-foreground">
            {content.conversationsGenerated} conversaciones en DM vinculadas a interacciones
            con esta pieza (comentarios en reel, respuestas a story, CTA en carrusel).
          </p>
          <Button variant="outline" size="sm" className="mt-3" asChild>
            <Link href={paths.platform.sales.inbox}>Abrir bandeja de ventas</Link>
          </Button>
        </Panel>

        <Panel title="Influencia en agendamientos">
          <p className="text-sm text-muted-foreground">
            {content.bookingsInfluenced} agendamientos donde esta pieza fue consumida en las
            72h previas al calendario enviado.
          </p>
        </Panel>

        <Panel title="Influencia en ingresos">
          <p className="text-2xl font-semibold text-success">{content.revenueInfluenced}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ingresos atribuidos conceptualmente a compradores que interactuaron con este
            asset (no es tracking de ads).
          </p>
        </Panel>
      </div>

      <AiCard
        title="Insight de contenido"
        confidence={0.89}
        source="Frame extraction · Drive"
      >
        Los leads que ven este {CONTENT_TYPE_LABEL[content.type].toLowerCase()} suelen
        entrar a DM en menos de 24h. Considera replicar el gancho del primer frame en la
        próxima pieza del mismo formato.
      </AiCard>
    </div>
  );
}
