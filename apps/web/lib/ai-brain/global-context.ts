import { createAdminClient } from "@/lib/supabase/admin";
import { wrapUntrustedContent } from "@/lib/ai/wrap-untrusted-content";

type ContextBlock = {
  id: string;
  title: string;
  type: string;
  preview: string;
  updatedAt: string;
  content: string;
};

function preview(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
}

/**
 * Carga los documentos del Cerebro de IA Global (ai_brain_documents con status='active'
 * y content_text no nulo) como bloques de contexto disponibles para el agente de cualquier org.
 */
export async function loadGlobalBrainContextBlocks(): Promise<ContextBlock[]> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("ai_brain_documents")
    .select("id, title, category, content_type, content_text, updated_at, created_at")
    .eq("status", "active")
    .not("content_text", "is", null)
    .order("updated_at", { ascending: false })
    .limit(30);

  if (error || !data) return [];

  return data
    .filter((row) => row.content_text && String(row.content_text).trim().length > 0)
    .map((row) => {
      const text = String(row.content_text ?? "");
      const label =
        row.content_type === "miro_board"
          ? "Miro Board"
          : row.content_type === "transcript"
            ? "Transcripción"
            : row.content_type === "framework"
              ? "Framework"
              : row.content_type === "playbook"
                ? "Playbook"
                : "Documento";

      return {
        id: `brain:${row.id as string}`,
        title: String(row.title ?? "Documento cerebro"),
        type: "global_brain_document",
        preview: preview(text, 160),
        updatedAt: String(row.updated_at ?? row.created_at ?? new Date().toISOString()),
        content: wrapUntrustedContent(
          `brain_${row.id as string}`,
          `[CEREBRO IA GLOBAL — ${label.toUpperCase()} | ${String(row.category ?? "general").toUpperCase()}] ${row.title}:\n${text.slice(0, 2000)}`
        ),
      };
    });
}
