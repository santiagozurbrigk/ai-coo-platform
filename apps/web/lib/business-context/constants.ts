import type { BuiltinDocumentCategory } from "@/types/business-context";

/**
 * Bucket privado de Supabase Storage para los PDFs subidos manualmente.
 * Crear en Supabase Dashboard → Storage → New bucket
 * Name: business-context-documents | Public: false
 */
export const BUSINESS_CONTEXT_BUCKET = "business-context-documents";

export const DOCUMENT_CATEGORY_LABELS: Record<BuiltinDocumentCategory, string> = {
  meetings: "Reuniones",
  frameworks: "Frameworks",
  training: "Training",
  sales: "Ventas",
  operations: "Operaciones",
};

export const DOCUMENT_CATEGORIES = Object.keys(
  DOCUMENT_CATEGORY_LABELS
) as BuiltinDocumentCategory[];
