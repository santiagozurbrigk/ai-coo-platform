/**
 * Verificación manual del flujo RAG para business context.
 * Sin OPENAI_API_KEY: confirma que ingestDocument LANZA (no retorna ok:false).
 * Con OPENAI_API_KEY: corre ingestión completa y verifica rag_documents + chunks.
 *
 * Uso: npx tsx scripts/verify-business-context-rag.ts
 */
import { createClient } from "@supabase/supabase-js";
import { ingestDocument, IngestDocumentError } from "../lib/rag/ingest";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const openaiKey = process.env.OPENAI_API_KEY?.trim();

async function main() {
  if (!url || !serviceKey) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  if (!openaiKey) {
    try {
      await ingestDocument({
        organizationId: "00000000-0000-0000-0000-000000000001",
        sourceType: "business_context_note",
        sourceId: "00000000-0000-0000-0000-000000000002",
        title: "test",
        data: { title: "test", category: "operations", content: "x" },
      });
      console.error("FAIL — debería lanzar IngestDocumentError");
      process.exit(1);
    } catch (err) {
      if (!(err instanceof IngestDocumentError)) {
        console.error("FAIL — error inesperado:", err);
        process.exit(1);
      }
      console.log("OK — sin OPENAI_API_KEY, ingestDocument lanza:", err.message);
      return;
    }
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: org } = await admin.from("organizations").select("id").limit(1).maybeSingle();
  if (!org?.id) {
    console.error("No hay organizaciones en la base");
    process.exit(1);
  }

  const sourceId = crypto.randomUUID();
  const title = `RAG verify ${new Date().toISOString()}`;
  const content = "Nota de verificación automática business_context_note.";

  const result = await ingestDocument({
    organizationId: org.id,
    sourceType: "business_context_note",
    sourceId,
    title,
    data: { title, category: "operations", content },
    tags: ["business_context", "operations", "verify"],
  });

  const { data: ragDoc } = await admin
    .from("rag_documents")
    .select("id, embedding_status")
    .eq("organization_id", org.id)
    .eq("source_type", "business_context_note")
    .eq("source_id", sourceId)
    .maybeSingle();

  const { count } = await admin
    .from("rag_chunks")
    .select("id", { count: "exact", head: true })
    .eq("document_id", result.documentId);

  if (!ragDoc || ragDoc.embedding_status !== "done" || !count || count < 1) {
    console.error("FAIL — verificación en DB no pasó", { ragDoc, count });
    process.exit(1);
  }

  await admin.from("rag_chunks").delete().eq("document_id", result.documentId);
  await admin.from("rag_documents").delete().eq("id", result.documentId);

  console.log("OK — flujo RAG completo verificado", {
    documentId: result.documentId,
    chunkCount: result.chunkCount,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
