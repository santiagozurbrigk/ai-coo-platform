export type DocumentCategory =
  | "meetings"
  | "frameworks"
  | "training"
  | "sales"
  | "operations";

export type ContextDocument = {
  id: string;
  title: string;
  category: DocumentCategory;
  source: string;
  summary: string;
  updatedAt: string;
  linkedSops: string[];
};
