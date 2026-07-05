"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AiCard,
  Badge,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@ai-coo/ui";
import { ArrowLeft, RefreshCw } from "lucide-react";
import type { ContextDocument, DocumentStatus } from "@/types/business-context";
import { useBusinessContextDocumentRealtime } from "@/lib/business-context/use-documents-realtime";
import {
  resyncDocumentMarkdownAction,
} from "@/app/business-context/actions";
import { paths } from "@/routes";
import { useToast } from "@/providers/toast-provider";
import { DocumentViewerSidebar } from "./document-viewer-sidebar";

const CATEGORY_LABEL: Record<ContextDocument["category"], string> = {
  meetings: "Reuniones",
  frameworks: "Frameworks",
  training: "Training",
  sales: "Ventas",
  operations: "Operaciones",
};

// Tailwind Typography classes for the document body — renders headings,
// paragraphs, lists and inline formatting with proper hierarchy.
// Uses foreground colors instead of muted so text is clearly readable.
const proseClassName =
  "prose prose-sm dark:prose-invert max-w-none " +
  "prose-headings:text-foreground prose-headings:font-semibold " +
  "prose-h1:text-xl prose-h1:mt-6 prose-h1:mb-3 " +
  "prose-h2:text-lg prose-h2:mt-5 prose-h2:mb-2 " +
  "prose-h3:text-base prose-h3:mt-4 prose-h3:mb-1.5 " +
  "prose-p:text-foreground prose-p:leading-relaxed prose-p:my-2 " +
  "prose-li:text-foreground prose-li:my-0.5 " +
  "prose-strong:text-foreground " +
  "prose-a:text-violet-600 dark:prose-a:text-violet-400 " +
  "prose-ul:my-2 prose-ol:my-2 " +
  "prose-table:text-sm prose-th:text-foreground prose-td:text-foreground " +
  "prose-code:text-foreground prose-pre:my-3 " +
  "first:prose-headings:mt-0 first:prose-p:mt-0";

function statusLabel(status?: DocumentStatus): string | null {
  if (!status) return null;
  if (status === "indexed") return "Indexado en RAG";
  if (status === "processing") return "Indexando en RAG…";
  return "Error al indexar";
}

function DocumentContent({
  document,
  onMarkdownRefreshed,
}: {
  document: ContextDocument;
  onMarkdownRefreshed: (doc: ContextDocument) => void;
}) {
  const { push } = useToast();
  const [resyncing, startResync] = useTransition();

  const markdown = document.contentMarkdown?.trim();
  const plainText = document.transcript?.trim();

  const isGoogleDoc = document.sourceType === "google_docs";
  const canResync = isGoogleDoc && !markdown;

  function handleResync() {
    startResync(async () => {
      const res = await resyncDocumentMarkdownAction(document.id);
      if (!res.success) {
        push({ title: "No se pudo regenerar", description: res.error });
        return;
      }
      push({
        title: "Formato regenerado",
        description: "El documento ahora muestra su estructura original.",
        variant: "success",
      });
      // The page will revalidate via revalidatePath; force a local state update
      // by bouncing through the callback (caller re-fetches on server revalidation).
      onMarkdownRefreshed({ ...document });
    });
  }

  if (!markdown && !plainText) {
    return (
      <p className="text-sm text-muted-foreground">
        {document.status === "processing"
          ? "El documento se está procesando e indexando en la base de conocimiento de la IA."
          : document.status === "error"
            ? document.indexError ??
              "No se pudo extraer o indexar el contenido de este documento."
            : "Sin contenido de texto disponible."}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {canResync && (
        <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
          <span>
            Este documento fue importado sin formato estructurado. Podés
            regenerarlo para ver títulos y listas correctamente.
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-3 shrink-0 gap-1.5 border-amber-500/40 text-amber-700 hover:bg-amber-500/10 dark:text-amber-300"
            disabled={resyncing}
            onClick={handleResync}
          >
            <RefreshCw className={`h-3 w-3 ${resyncing ? "animate-spin" : ""}`} />
            {resyncing ? "Regenerando…" : "Regenerar formato"}
          </Button>
        </div>
      )}

      {/* Document body — rendered as a "page" with constrained width and generous margins */}
      <div className="rounded-xl border border-border/60 bg-background px-8 py-8 shadow-sm dark:border-glass dark:bg-card/60 dark:backdrop-blur-md sm:px-12">
        {markdown ? (
          <div className={proseClassName}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
          </div>
        ) : (
          // Fallback for PDFs, Sheets, or pre-migration plain-text documents
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {plainText}
          </p>
        )}
      </div>
    </div>
  );
}

export function ContextViewer({ document: initial }: { document: ContextDocument }) {
  const [document, setDocument] = useState(initial);

  useEffect(() => {
    setDocument(initial);
  }, [initial]);

  useBusinessContextDocumentRealtime(document.id, setDocument);

  const statusText = statusLabel(document.status);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-5 lg:col-span-3">
        <div className="space-y-3">
          <Button variant="ghost" size="sm" className="gap-2" asChild>
            <Link href={paths.platform.businessContext.documents}>
              <ArrowLeft className="h-4 w-4" />
              Volver a documentos
            </Link>
          </Button>
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
            <DocumentContent
              document={document}
              onMarkdownRefreshed={setDocument}
            />
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
