import { AiCard, Badge, Separator } from "@ai-coo/ui";
import { Panel } from "@/components/shared";
import type { ContextDocument } from "@/types/business-context";

export function ContextViewer({ document }: { document: ContextDocument }) {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{document.source}</Badge>
        <span className="text-xs text-muted-foreground">
          Actualizado {document.updatedAt}
        </span>
      </div>

      <AiCard title="Resumen" confidence={0.9}>
        {document.summary}
      </AiCard>

      <Panel title="Transcripción / contenido">
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          [Cuerpo mock — en producción se renderiza el documento completo desde el
          Motor de Contexto de Negocio.]
          {"\n\n"}
          Este documento alimenta la memoria organizacional y la generación de SOPs.
          Fragmentos indexados: 24 · Embeddings: sincronizados
        </p>
      </Panel>

      {document.linkedSops.length > 0 && (
        <>
          <Separator />
          <Panel title="SOPs vinculados">
            <ul className="text-sm space-y-1 text-primary">
              {document.linkedSops.map((id) => (
                <li key={id}>{id}</li>
              ))}
            </ul>
          </Panel>
        </>
      )}
    </div>
  );
}
