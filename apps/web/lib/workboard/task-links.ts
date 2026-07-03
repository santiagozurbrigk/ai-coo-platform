import type {
  WorkboardTaskAttachment,
  WorkboardTaskLinkedDocument,
  WorkboardTaskLinkedSop,
} from "@/types/workboard";

export type TaskAttachmentRow = {
  id: string;
  organization_id: string;
  task_id: string;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  file_size: number | null;
  created_at: string;
};

export type TaskDocumentLinkRow = {
  task_id: string;
  document_id: string;
  business_context_documents: {
    id: string;
    title: string;
    category: string;
  } | null;
};

export type TaskLinksByTaskId = {
  attachments: Map<string, WorkboardTaskAttachment[]>;
  documents: Map<string, WorkboardTaskLinkedDocument[]>;
  sops: Map<string, WorkboardTaskLinkedSop>;
};

export function rowToTaskAttachment(row: TaskAttachmentRow): WorkboardTaskAttachment {
  return {
    id: row.id,
    fileName: row.file_name,
    storagePath: row.storage_path,
    mimeType: row.mime_type,
    fileSize: row.file_size,
    createdAt: row.created_at,
  };
}

export function rowToLinkedDocument(
  row: TaskDocumentLinkRow
): WorkboardTaskLinkedDocument | null {
  const doc = row.business_context_documents;
  if (!doc) return null;
  return {
    id: doc.id,
    title: doc.title,
    category: doc.category,
  };
}

export function emptyTaskLinks(): TaskLinksByTaskId {
  return {
    attachments: new Map(),
    documents: new Map(),
    sops: new Map(),
  };
}

export function mergeTaskLinks(
  taskId: string,
  links: TaskLinksByTaskId
): {
  attachments: WorkboardTaskAttachment[];
  linkedDocuments: WorkboardTaskLinkedDocument[];
  linkedSop: WorkboardTaskLinkedSop | null;
} {
  return {
    attachments: links.attachments.get(taskId) ?? [],
    linkedDocuments: links.documents.get(taskId) ?? [],
    linkedSop: links.sops.get(taskId) ?? null,
  };
}
