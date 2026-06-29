/**
 * Verifica que ingestDocument LANZA (no solo retorna ok:false) cuando falla.
 * Uso: npx tsx scripts/test-ingest-throws-on-failure.ts
 */
import { ingestDocument, IngestDocumentError } from "../lib/rag/ingest";

async function main() {
  const hadKey = Boolean(process.env.OPENAI_API_KEY?.trim());
  if (hadKey) {
    delete process.env.OPENAI_API_KEY;
  }

  let threw = false;
  try {
    await ingestDocument({
      organizationId: "00000000-0000-0000-0000-000000000001",
      sourceType: "business_context_note",
      sourceId: "00000000-0000-0000-0000-000000000002",
      title: "test",
      data: { title: "test", category: "operations", content: "x" },
    });
    console.error("FAIL: ingestDocument debería haber lanzado IngestDocumentError");
    process.exit(1);
  } catch (err) {
    threw = err instanceof IngestDocumentError;
    console.log("caught:", err instanceof Error ? err.message : err);
  }

  if (!threw) {
    console.error("FAIL: se lanzó un error pero no era IngestDocumentError");
    process.exit(1);
  }

  console.log("OK: ingestDocument lanza IngestDocumentError cuando OPENAI_API_KEY falta");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
