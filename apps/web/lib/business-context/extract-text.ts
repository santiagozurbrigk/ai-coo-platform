/**
 * Extrae texto plano de un archivo subido para indexarlo en el RAG.
 * - PDF: usa unpdf (build serverless de pdf.js, sin dependencias nativas)
 * - TXT / MD: decodifica el buffer como UTF-8
 */
export async function extractTextFromFile(
  buffer: ArrayBuffer,
  mimeType: string
): Promise<string> {
  if (mimeType === "application/pdf") {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    const normalized = Array.isArray(text) ? text.join("\n") : String(text ?? "");
    return normalized.trim();
  }

  // text/plain, text/markdown
  return new TextDecoder("utf-8").decode(buffer).trim();
}
