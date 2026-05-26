import Link from "next/link";
import { Archive, RefreshCw, Trash2 } from "lucide-react";
import { Badge, Button, GlassPanel, Text } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { paths } from "@/routes";
import type { BrainDocument } from "@/types/ai-brain";
import { BrainStatusBadge } from "./brain-status-badge";
import { BrainTypeIcon } from "./brain-type-icon";

export function BrainDocumentViewer({ document: doc }: { document: BrainDocument }) {
  const isImage = doc.type === "image";
  const isMiro = doc.type === "miro";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{doc.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <BrainTypeIcon type={doc.type} showLabel />
            <BrainStatusBadge status={doc.status} />
            <Text muted className="text-sm">
              {doc.uploadDate} · {doc.uploadedBy}
            </Text>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm">
            <Archive className="mr-1.5 h-4 w-4" />
            Archivar
          </Button>
          <Button variant="secondary" size="sm">
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Reemplazar documento
          </Button>
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-1.5 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <GlassPanel className="min-h-[220px] p-6" glow>
        {isImage ? (
          <div className="flex aspect-video max-w-lg items-center justify-center rounded-lg bg-muted/30 border border-border/50">
            <Text muted>Vista previa de imagen (mock)</Text>
          </div>
        ) : isMiro ? (
          <div className="flex aspect-video max-w-2xl items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-muted/20 border border-primary/20">
            <div className="text-center">
              <Text className="font-medium">Miniatura Miro Board</Text>
              <Text muted className="mt-2 text-sm">
                {doc.previewText}
              </Text>
            </div>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none">
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {doc.previewText}
            </p>
          </div>
        )}
      </GlassPanel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Contribución al cerebro">
          <p className="text-sm text-muted-foreground mb-3">
            Áreas de cobertura que aporta este documento:
          </p>
          <ul className="flex flex-wrap gap-2">
            {doc.coverageAreas.length > 0 ? (
              doc.coverageAreas.map((area) => (
                <Badge key={area} variant="secondary">
                  {area}
                </Badge>
              ))
            ) : (
              <Text muted className="text-sm">
                Sin áreas asignadas (revisar indexación)
              </Text>
            )}
          </ul>
        </Panel>

        <Panel title="Uso por IA (mock)">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Referencias en generación de SOPs</dt>
              <dd className="font-medium tabular-nums">{doc.usageStats.sops}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Referencias en análisis de ventas</dt>
              <dd className="font-medium tabular-nums">{doc.usageStats.sales}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Referencias en reportes</dt>
              <dd className="font-medium tabular-nums">{doc.usageStats.reports}</dd>
            </div>
            <div className="flex justify-between border-t border-border/50 pt-2">
              <dt className="text-muted-foreground">Última referencia</dt>
              <dd className="font-medium">{doc.usageStats.lastReferenced}</dd>
            </div>
          </dl>
        </Panel>
      </div>

      <Panel title="Organizaciones vinculadas">
        <Badge variant="success" className="text-sm">
          Todas las organizaciones (global)
        </Badge>
        <Text muted className="mt-2 block text-sm">
          Este contenido pertenece a la capa global del cerebro y no está limitado a un
          cliente.
        </Text>
      </Panel>

      <Button variant="ghost" size="sm" asChild>
        <Link href={paths.superAdmin.aiBrain.library}>← Volver a la biblioteca</Link>
      </Button>
    </div>
  );
}
