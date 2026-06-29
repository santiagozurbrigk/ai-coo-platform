/**
 * Verificación manual del flujo RAG para business context.
 * Uso: desde apps/web con variables de entorno cargadas:
 *   npx tsx scripts/verify-business-context-rag.ts
 */
import { createClient } from "@supabase/supabase-js";
import { ingestDocument } from "../lib/rag/ingest";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const openaiKey = process.env.OPENAI_API_KEY?.trim();

async function main() {
  if (!url || !serviceKey) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  if (!openaiKey) {
    console.error("Falta OPENAI_API_KEY — la ingestión debería fallar con motivo explícito");
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: org } = await admin
    .from("organizations")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (!org?.id) {
    console.error("No hay organizaciones en la base");
    process.exit(1);
  }

  const sourceId = crypto.randomUUID();
  const title = `RAG verify ${new Date().toISOString()}`;
  const content =
    "Nota de verificación automática del pipeline business_context_note → rag_documents → rag_chunks.";

  console.log("Ingestando nota de prueba…", { orgId: org.id, sourceId });

  const result = await ingestDocument({
    organizationId: org.id,
    sourceType: "business_context_note",
    sourceId,
    title,
    data: { title, category: "operations", content },
    tags: ["business_context", "operations", "verify"],
  });

  console.log("Resultado ingestDocument:", result);

  if (!result.ok) {
    console.error("FAIL — ingestión no completó:", result.reason);
    process.exit(1);
  }

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

  console.log("rag_documents:", ragDoc);
  console.log("rag_chunks count:", count);

  if (!ragDoc || ragDoc.embedding_status !== "done" || !count || count < 1) {
    console.error("FAIL — verificación en DB no pasó");
    process.exit(1);
  }

  // Limpieza
  await admin.from("rag_chunks").delete().eq("document_id", result.documentId);
  await admin.from("rag_documents").delete().eq("id", result.documentId);

  console.log("OK — flujo RAG verificado y datos de prueba eliminados");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
