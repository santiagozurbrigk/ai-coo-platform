import { createAdminClient } from "@/lib/supabase/admin";

export const PRODUCT_CONTEXT_RAG_SOURCE_TYPES = [
  "fathom_call",
  "sop",
  "sales_framework",
  "business_context_note",
  "business_context_document",
  "weekly_input",
  "product_context",
  "manual",
] as const;

/**
 * Indica si la org tiene material utilizable para auto-completar Producto,
 * independientemente de si la búsqueda semántica devuelve hits.
 */
export async function hasProductContextSources(
  organizationId: string
): Promise<boolean> {
  const admin = createAdminClient();

  const [chunks, sops, fathom, businessDocs] = await Promise.all([
    admin
      .from("rag_chunks")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    admin
      .from("sops")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "active"),
    admin
      .from("fathom_calls")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    admin
      .from("business_context_documents")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .in("status", ["indexed", "processing"]),
  ]);

  return (
    (chunks.count ?? 0) > 0 ||
    (sops.count ?? 0) > 0 ||
    (fathom.count ?? 0) > 0 ||
    (businessDocs.count ?? 0) > 0
  );
}

/** Texto de respaldo cuando la búsqueda vectorial no devuelve resultados. */
export async function fetchProductContextFallbackText(
  organizationId: string
): Promise<string[]> {
  const admin = createAdminClient();
  const parts: string[] = [];

  const { data: sops } = await admin
    .from("sops")
    .select("title, content, department")
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(5);

  for (const sop of sops ?? []) {
    if (!sop.content?.trim()) continue;
    parts.push(
      `[SOP] ${sop.title} (${sop.department ?? "general"}):\n${String(sop.content).slice(0, 2000)}`
    );
  }

  const { data: calls } = await admin
    .from("fathom_calls")
    .select("title, transcript")
    .eq("organization_id", organizationId)
    .not("transcript", "is", null)
    .order("call_date", { ascending: false })
    .limit(4);

  for (const call of calls ?? []) {
    const transcript = String(call.transcript ?? "").trim();
    if (!transcript) continue;
    parts.push(`[FATHOM] ${call.title ?? "Llamada"}:\n${transcript.slice(0, 2500)}`);
  }

  const { data: docs } = await admin
    .from("business_context_documents")
    .select("title, content_text, category")
    .eq("organization_id", organizationId)
    .eq("status", "indexed")
    .order("updated_at", { ascending: false })
    .limit(5);

  for (const doc of docs ?? []) {
    const text = String(doc.content_text ?? "").trim();
    if (!text) continue;
    parts.push(
      `[CONTEXTO] ${doc.title} (${doc.category ?? "general"}):\n${text.slice(0, 2000)}`
    );
  }

  if (parts.length === 0) {
    const { data: chunks } = await admin
      .from("rag_chunks")
      .select("title, content, source_type")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(12);

    for (const chunk of chunks ?? []) {
      if (!chunk.content?.trim()) continue;
      parts.push(
        `[${chunk.source_type ?? "RAG"}] ${chunk.title ?? "Fragmento"}:\n${String(chunk.content).slice(0, 1200)}`
      );
    }
  }

  return parts;
}
