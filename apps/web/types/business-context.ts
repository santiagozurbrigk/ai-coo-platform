export type DocumentCategory =
  | "meetings"
  | "frameworks"
  | "training"
  | "sales"
  | "operations";

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
