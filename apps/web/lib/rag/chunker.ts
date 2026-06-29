export interface DocumentChunk {
  content: string;
  chunkIndex: number;
}

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

/**
 * Divide un texto largo en chunks con overlap para mejor recuperación semántica.
 */
export function chunkText(text: string): DocumentChunk[] {
  if (!text?.trim()) return [];

  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());

  const chunks: DocumentChunk[] = [];
  let currentChunk = "";
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    if (paragraph.length > CHUNK_SIZE * 4) {
      const sentences = paragraph.match(/[^.!?]+[.!?]+/g) ?? [paragraph];

      for (const sentence of sentences) {
        if ((currentChunk + sentence).length > CHUNK_SIZE * 4) {
          if (currentChunk.trim()) {
            chunks.push({ content: currentChunk.trim(), chunkIndex });
            chunkIndex++;
            const words = currentChunk.split(" ");
            currentChunk = `${words.slice(-CHUNK_OVERLAP).join(" ")} `;
          }
        }
        currentChunk += `${sentence} `;
      }
    } else {
      if ((currentChunk + paragraph).length > CHUNK_SIZE * 4) {
        if (currentChunk.trim()) {
          chunks.push({ content: currentChunk.trim(), chunkIndex });
          chunkIndex++;
          const words = currentChunk.split(" ");
          currentChunk = `${words.slice(-CHUNK_OVERLAP).join(" ")} `;
        }
      }
      currentChunk += `${paragraph}\n\n`;
    }
  }

  if (currentChunk.trim()) {
    chunks.push({ content: currentChunk.trim(), chunkIndex });
  }

  return chunks;
}

function asString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

/**
 * Prepara el texto de un documento según su tipo de fuente.
 */
export function prepareDocumentText(
  sourceType: string,
  data: Record<string, unknown>
): string {
  switch (sourceType) {
    case "fathom_call":
      return [
        `TRANSCRIPCIÓN DE LLAMADA: ${data.title ?? ""}`,
        data.call_date || data.date
          ? `Fecha: ${asString(data.call_date ?? data.date)}`
          : "",
        data.summary ? `Resumen: ${asString(data.summary)}` : "",
        data.ai_situation_summary
          ? `Resumen IA: ${asString(data.ai_situation_summary)}`
          : "",
        data.transcript ? `Transcripción: ${asString(data.transcript)}` : "",
        data.ai_next_steps || data.next_steps
          ? `Próximos pasos: ${asString(data.ai_next_steps ?? data.next_steps)}`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n");

    case "sop":
      return [
        `SOP: ${data.title ?? ""}`,
        data.department ? `Departamento: ${asString(data.department)}` : "",
        data.goal ? `Objetivo: ${asString(data.goal)}` : "",
        data.content ? `Contenido: ${asString(data.content)}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

    case "sales_framework":
      return [
        `FRAMEWORK DE VENTAS: ${data.name ?? ""}`,
        data.type ? `Tipo: ${asString(data.type)}` : "",
        data.description ? `Descripción: ${asString(data.description)}` : "",
        data.content ? `Contenido: ${asString(data.content)}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

    case "weekly_input":
      return [
        `INPUT SEMANAL - ${data.department ?? ""} - Semana ${data.week_start ?? ""}`,
        data.content ? `Contenido: ${asString(data.content)}` : "",
        data.rating ? `Rating de la semana: ${asString(data.rating)}/5` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

    case "product_context":
      return [
        `CONTEXTO DEL NEGOCIO: ${data.orgName ?? ""}`,
        data.avatar ? `Avatar principal: ${JSON.stringify(data.avatar)}` : "",
        data.products ? `Productos: ${JSON.stringify(data.products)}` : "",
        data.frameworks ? `Frameworks: ${JSON.stringify(data.frameworks)}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

    case "agent_conversation":
      return [
        `CONVERSACIÓN CON EL AGENTE: ${data.title ?? ""}`,
        data.messages ? `Mensajes: ${asString(data.messages)}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

    case "business_context_note":
    case "business_context_document":
      return [
        `DOCUMENTO DE CONTEXTO: ${data.title ?? ""}`,
        data.category ? `Categoría: ${asString(data.category)}` : "",
        data.content ? `Contenido: ${asString(data.content)}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

    default:
      return asString(data.content ?? "");
  }
}
