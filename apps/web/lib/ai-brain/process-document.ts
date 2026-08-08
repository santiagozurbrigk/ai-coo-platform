"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { extractTextFromFile } from "@/lib/business-context/extract-text";
import { AI_BRAIN_BUCKET } from "@/lib/ai-brain/mapper";

// ---------------------------------------------------------------------------
// Miro REST API
// ---------------------------------------------------------------------------

function extractMiroBoardId(url: string): string | null {
  const match = url.match(/miro\.com\/app\/board\/([^/?#]+)/);
  return match?.[1] ?? null;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

type MiroItem = {
  type: string;
  data?: {
    content?: string;
    title?: string;
    shape?: string;
  };
};

async function fetchMiroBoardText(boardId: string, accessToken: string): Promise<string> {
  const texts: string[] = [];
  let cursor: string | undefined;

  // Fetch up to 500 items across pages
  for (let page = 0; page < 10; page++) {
    const params = new URLSearchParams({ limit: "50" });
    if (cursor) params.set("cursor", cursor);

    const res = await fetch(
      `https://api.miro.com/v2/boards/${encodeURIComponent(boardId)}/items?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Miro API error ${res.status}: ${body.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      data?: MiroItem[];
      cursor?: string;
      total?: number;
    };

    for (const item of json.data ?? []) {
      const raw = item.data?.content ?? item.data?.title ?? "";
      if (raw) {
        const text = stripHtml(raw).trim();
        if (text) texts.push(text);
      }
    }

    if (!json.cursor || (json.data ?? []).length === 0) break;
    cursor = json.cursor;
  }

  return texts.join("\n\n");
}

// ---------------------------------------------------------------------------
// DOCX extraction (using docx library to unzip + extract text nodes)
// ---------------------------------------------------------------------------

async function extractTextFromDocx(buffer: ArrayBuffer): Promise<string> {
  // Dynamic import — library is heavy, only load when needed
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(buffer);

  const wordDoc = zip.file("word/document.xml");
  if (!wordDoc) throw new Error("DOCX inválido: no contiene word/document.xml");

  const xml = await wordDoc.async("string");
  // Extract text from <w:t> nodes
  const texts: string[] = [];
  const re = /<w:t[^>]*>([^<]*)<\/w:t>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    if (m[1]) texts.push(m[1]);
  }
  return texts.join(" ").replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------------------------
// Main processor
// ---------------------------------------------------------------------------

export type ProcessBrainDocumentResult =
  | { ok: true; contentText: string; charCount: number }
  | { ok: false; error: string };

export async function processAiBrainDocument(
  documentId: string
): Promise<ProcessBrainDocumentResult> {
  const admin = createAdminClient();

  const { data: row, error: fetchErr } = await admin
    .from("ai_brain_documents")
    .select("id, content_type, file_url, source_url, file_name")
    .eq("id", documentId)
    .maybeSingle();

  if (fetchErr || !row) {
    return { ok: false, error: fetchErr?.message ?? "Documento no encontrado" };
  }

  let contentText = "";

  try {
    if (row.content_type === "miro_board") {
      // ----- Miro board -----
      const sourceUrl = String(row.source_url ?? "");
      const boardId = extractMiroBoardId(sourceUrl);
      if (!boardId) {
        return { ok: false, error: "URL de Miro inválida — no se pudo extraer el board ID" };
      }

      const miroToken = process.env.MIRO_ACCESS_TOKEN;
      if (!miroToken) {
        return {
          ok: false,
          error:
            "MIRO_ACCESS_TOKEN no está configurado. Agregá la variable de entorno con el token de acceso de Miro.",
        };
      }

      contentText = await fetchMiroBoardText(boardId, miroToken);

      if (!contentText.trim()) {
        return { ok: false, error: "El tablero de Miro no tiene contenido textual indexable" };
      }
    } else {
      // ----- File-based document -----
      const fileUrl = String(row.file_url ?? "");
      if (!fileUrl) {
        return { ok: false, error: "El documento no tiene archivo adjunto" };
      }

      const storagePath = fileUrl.replace(/^ai-brain-documents\//, "");
      const { data: fileData, error: dlErr } = await admin.storage
        .from(AI_BRAIN_BUCKET)
        .download(storagePath);

      if (dlErr || !fileData) {
        return { ok: false, error: `Error descargando archivo: ${dlErr?.message ?? "desconocido"}` };
      }

      const buffer = await fileData.arrayBuffer();
      const fileName = String(row.file_name ?? "");
      const ext = fileName.split(".").pop()?.toLowerCase() ?? "";

      if (
        ext === "docx" ||
        row.content_type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        contentText = await extractTextFromDocx(buffer);
      } else {
        // PDF, TXT, MD handled by existing extractor
        const mimeGuess =
          ext === "pdf"
            ? "application/pdf"
            : ext === "md"
              ? "text/markdown"
              : "text/plain";
        contentText = await extractTextFromFile(buffer, mimeGuess);
      }

      if (!contentText.trim()) {
        return { ok: false, error: "No se pudo extraer texto del archivo" };
      }
    }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Error inesperado al procesar el documento",
    };
  }

  // Persist content_text and mark active
  const { error: updateErr } = await admin
    .from("ai_brain_documents")
    .update({
      content_text: contentText,
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", documentId);

  if (updateErr) {
    return { ok: false, error: `Error guardando contenido: ${updateErr.message}` };
  }

  return { ok: true, contentText, charCount: contentText.length };
}
