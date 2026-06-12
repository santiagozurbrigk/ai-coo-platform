"use client";

import {
  AiCard,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@ai-coo/ui";
import type { ContextDocument } from "@/types/business-context";
import { DocumentViewerSidebar } from "./document-viewer-sidebar";

const CATEGORY_LABEL: Record<ContextDocument["category"], string> = {
  meetings: "Reuniones",
  frameworks: "Frameworks",
  training: "Training",
  sales: "Ventas",
  operations: "Operaciones",
};

export function ContextViewer({ document }: { document: ContextDocument }) {
  const transcript =
    document.transcript ??
    `[Transcripción mock]\n\n${document.preview}\n\nEn producción se renderiza el documento completo desde el Motor de Contexto de Negocio. Fragmentos indexados: 24 · Embeddings: sincronizados.`;

  const insights = document.insights ?? [
    "Insight generado por IA a partir del contenido del documento.",
    "Revisar periódicamente para mantener la base de conocimiento actualizada.",
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-5 lg:col-span-3">
        <div>
          <h1 className="text-xl font-semibold leading-snug">{document.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">{CATEGORY_LABEL[document.category]}</Badge>
            <span>{document.source}</span>
            <span>·</span>
            <span>{document.updatedAt}</span>
            {document.duration ? (
              <>
                <span>·</span>
                <span>{document.duration}</span>
              </>
            ) : null}
            {document.status === "indexed" ? (
              <Badge variant="success" className="text-[10px]">
                Indexado
              </Badge>
            ) : null}
          </div>
        </div>

        <Tabs defaultValue="resumen">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="transcripcion">Transcripción</TabsTrigger>
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="transcripcion" className="mt-4">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 dark:border-glass dark:bg-glass dark:backdrop-blur-md">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {transcript}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="resumen" className="mt-4">
            <AiCard title="Resumen" confidence={0.91} source={document.source}>
              {document.summary}
            </AiCard>
          </TabsContent>

          <TabsContent value="insights" className="mt-4">
            <ul className="space-y-3">
              {insights.map((insight, index) => (
                <li
                  key={index}
                  className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm leading-relaxed text-foreground/90 dark:border-glass dark:bg-glass dark:backdrop-blur-md"
                >
                  {insight}
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </div>

      <div className="lg:col-span-2">
        <DocumentViewerSidebar document={document} />
      </div>
    </div>
  );
}
