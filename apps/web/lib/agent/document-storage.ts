/**
 * Uploads agent-generated documents to Supabase Storage.
 * Bucket: agent-documents (private, scoped by organization).
 */
import { createAdminClient } from "@/lib/supabase/admin";
import type { GeneratedDocument } from "./document-generator";

const AGENT_DOCS_BUCKET = "agent-documents";
const SIGNED_URL_EXPIRES_IN = 3600; // 1 hour

export type StoredDocument = {
  storagePath: string;
  signedUrl: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
};

export async function storeAgentDocument(
  organizationId: string,
  filename: string,
  doc: GeneratedDocument
): Promise<StoredDocument> {
  const safeFilename = filename
    .replace(/[^a-zA-Z0-9.\-_]/g, "_")
    .slice(0, 120);
  const docId = crypto.randomUUID();
  const storagePath = `${organizationId}/${docId}-${safeFilename}`;

  const admin = createAdminClient();

  const { error: uploadError } = await admin.storage
    .from(AGENT_DOCS_BUCKET)
    .upload(storagePath, doc.buffer, {
      contentType: doc.mimeType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(
      `No se pudo subir el documento al storage. ¿Existe el bucket "${AGENT_DOCS_BUCKET}"? Error: ${uploadError.message}`
    );
  }

  const { data: signData, error: signError } = await admin.storage
    .from(AGENT_DOCS_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_EXPIRES_IN);

  if (signError || !signData?.signedUrl) {
    throw new Error(
      signError?.message ?? "No se pudo generar la URL firmada para el documento"
    );
  }

  return {
    storagePath,
    signedUrl: signData.signedUrl,
    filename: safeFilename,
    mimeType: doc.mimeType,
    sizeBytes: doc.buffer.byteLength,
  };
}
