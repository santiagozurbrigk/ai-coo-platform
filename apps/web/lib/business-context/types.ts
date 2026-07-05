import type {
  ContextDocument,
  DocumentCategory,
  DocumentStatus,
  KnowledgeSource,
} from "@/types/business-context";

export type BusinessContextDocumentRow = {
  id: string;
  organization_id: string;
  title: string;
  category: DocumentCategory;
  source: string;
  content_text: string | null;
  content_markdown: string | null;
  storage_path: string | null;
  mime_type: string | null;
  status: DocumentStatus;
  index_error: string | null;
  external_source_id: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
};

function preview(text: string | null, max: number): string {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
}

function mapSourceFields(row: BusinessContextDocumentRow): {
  source: string;
  sourceType: KnowledgeSource;
  externalUrl?: string;
} {
  if (row.source === "google_doc") {
    const id = row.external_source_id;
    return {
      source: "Google Docs",
      sourceType: "google_docs",
      externalUrl: id
        ? `https://docs.google.com/document/d/${id}/edit`
        : undefined,
    };
  }
  if (row.source === "google_sheet") {
    const id = row.external_source_id;
    return {
      source: "Google Sheets",
      sourceType: "sheets",
      externalUrl: id
        ? `https://docs.google.com/spreadsheets/d/${id}/edit`
        : undefined,
    };
  }
  const isPdf = Boolean(row.storage_path);
  return {
    source: isPdf ? "PDF subido" : "Nota escrita",
    sourceType: "manual",
  };
}

/**
 * Mapea una fila real de `business_context_documents` al shape `ContextDocument`
 * reutilizado por el grid, las cards y el visor de detalle. Sin datos ficticios:
 * todo proviene de la fila guardada.
 */
export function mapDocumentRowToContextDocument(
  row: BusinessContextDocumentRow
): ContextDocument {
  const isPdf = Boolean(row.storage_path);
  const { source, sourceType, externalUrl } = mapSourceFields(row);
  const updatedAt = new Date(row.updated_at ?? row.created_at).toLocaleDateString(
    "es",
    { day: "numeric", month: "short", year: "numeric" }
  );

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    source,
    sourceType,
    summary: preview(row.content_text, 280) || "Documento de contexto.",
    preview:
      preview(row.content_text, 160) ||
      (isPdf ? "PDF en procesamiento…" : "Nota sin contenido."),
    updatedAt,
    linkedSops: [],
    status: row.status,
    indexError: row.index_error ?? undefined,
    externalUrl,
    storagePath: row.storage_path ?? undefined,
    mimeType: row.mime_type ?? undefined,
    transcript: row.content_text ?? undefined,
    contentMarkdown: row.content_markdown ?? undefined,
  };
}
