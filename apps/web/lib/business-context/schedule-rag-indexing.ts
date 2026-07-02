import {
  assertDocumentIndexed,
  assertDocumentNotIndexed,
  indexBusinessContextInRag,
  type IndexBusinessContextInRagArgs,
} from "@/lib/business-context/rag-indexing";
import { createAdminClient } from "@/lib/supabase/admin";
import { publishRagIngestionJob } from "@/lib/queue/qstash-client";

export type ScheduleBusinessContextRagResult =
  | { mode: "queued" }
  | { mode: "inline"; chunkCount: number };

/** Publica job en QStash o procesa inline si QStash no está configurado. */
export async function scheduleBusinessContextRagIndexing(
  args: IndexBusinessContextInRagArgs
): Promise<ScheduleBusinessContextRagResult> {
  const published = await publishRagIngestionJob({
    documentId: args.id,
    organizationId: args.organizationId,
    sourceType: args.sourceType,
  });

  if (published) {
    return { mode: "queued" };
  }

  console.log("[BusinessContext:RAG] inline fallback — QStash no disponible", {
    docId: args.id,
  });

  const admin = createAdminClient();
  const indexResult = await indexBusinessContextInRag(args);

  if (!indexResult.ok) {
    await assertDocumentNotIndexed(admin, args.id, indexResult.reason);
    throw new Error(indexResult.reason);
  }

  await assertDocumentIndexed(admin, args.id);
  return { mode: "inline", chunkCount: indexResult.chunkCount };
}
