"use client";

import {
  AiCard,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@ai-coo/ui";
import type { ContextDocument, DocumentStatus } from "@/types/business-context";
import { DocumentViewerSidebar } from "./document-viewer-sidebar";

const CATEGORY_LABEL: Record<ContextDocument["category"], string> = {
  meetings: "Reuniones",
  frameworks: "Frameworks",
  training: "Training",
  sales: "Ventas",
  operations: "Operaciones",
};

function statusLabel(status?: DocumentStatus): string | null {
  if (!status) return null;
  if (status === "indexed") return "Indexado en RAG";
  if (status === "processing") return "Indexando en RAG…";
  return "Error al indexar";
}

export function ContextViewer({ document }: { document: ContextDocument }) {
  const body = document.transcript?.trim() ?? "";
  const statusText = statusLabel(document.status);

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
            {statusText ? (
              <>
                <span>·</span>
                <Badge
                  variant={
                    document.status === "error"
                      ? "outline"
                      : document.status === "processing"
                        ? "outline"
                        : "success"
                  }
                  className="text-[10px]"
                >
                  {statusText}
                </Badge>
              </>
            ) : null}
          </div>
        </div>

        <Tabs defaultValue="contenido">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="contenido">Contenido</TabsTrigger>
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
          </TabsList>

          <TabsContent value="contenido" className="mt-4">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 dark:border-glass dark:bg-glass dark:backdrop-blur-md">
              {body ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {document.status === "processing"
                    ? "El documento se está procesando e indexando en la base de conocimiento de la IA."
                    : document.status === "error"
                      ? document.indexError ??
                        "No se pudo extraer o indexar el contenido de este documento."
                      : "Sin contenido de texto disponible."}
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="resumen" className="mt-4">
            <AiCard title="Resumen" source={document.source}>
              {document.summary || "Sin resumen disponible."}
            </AiCard>
          </TabsContent>
        </Tabs>
      </div>

      <div className="lg:col-span-2">
        <DocumentViewerSidebar document={document} />
      </div>
    </div>
  );
}
