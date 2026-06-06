export type DocumentCategory =
  | "meetings"
  | "frameworks"
  | "training"
  | "sales"
  | "operations";

/** Filtros de la base de conocimiento (documentos + Fathom). */
export type KnowledgeBaseFilter =
  | DocumentCategory
  | "all"
  | "client_meetings"
  | "business_context";

export type FathomKnowledgeCall = {
  id: string;
  title: string;
  call_date: string | null;
  duration_seconds: number | null;
  fathom_url: string | null;
  transcript: string | null;
  status: string;
  client_id: string | null;
  clientName?: string | null;
};

export type KnowledgeSource =
  | "fathom"
  | "miro"
  | "google_drive"
  | "google_docs"
  | "loom"
  | "local"
  | "sheets"
  | "notion";

export type DocumentStatus = "indexed" | "processing" | "error";

export type ContextDocument = {
  id: string;
  title: string;
  category: DocumentCategory;
  source: string;
  sourceType?: KnowledgeSource;
  summary: string;
  updatedAt: string;
  linkedSops: string[];
  thumbnailUrl?: string;
  status?: DocumentStatus;
  externalUrl?: string;
};
