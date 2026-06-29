import type {
  ContextDocument,
  DocumentCategory,
  DocumentStatus,
} from "@/types/business-context";

export type BusinessContextDocumentRow = {
  id: string;
  organization_id: string;
  title: string;
  category: DocumentCategory;
  source: string;
  content_text: string | null;
  storage_path: string | null;
  mime_type: string | null;
  status: DocumentStatus;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
};

function preview(text: string | null, max: number): string {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
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
  const updatedAt = new Date(row.updated_at ?? row.created_at).toLocaleDateString(
    "es",
    { day: "numeric", month: "short", year: "numeric" }
  );

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    source: isPdf ? "PDF subido" : "Nota escrita",
    sourceType: "manual",
    summary: preview(row.content_text, 280) || "Documento de contexto.",
    preview:
      preview(row.content_text, 160) ||
      (isPdf ? "PDF en procesamiento…" : "Nota sin contenido."),
    updatedAt,
    linkedSops: [],
    status: row.status,
    transcript: row.content_text ?? undefined,
  };
}
