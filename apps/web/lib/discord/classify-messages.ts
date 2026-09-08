/**
 * D3 · Clasificar mensajes de Discord **por lote**.
 *
 * Llena las tres columnas que existían desde el día uno y nadie llenaba
 * (`ai_sentiment`, `ai_summary`, `requires_attention`) y **corrige**
 * `is_testimonial`, que el bot sólo puede pre-filtrar.
 *
 * ⭐ Por lote y no por mensaje: el costo por mensaje no cierra en un canal con
 * cientos de mensajes. Un lote de 25 se clasifica con una sola llamada a Haiku.
 *
 * ⭐ Un testimonio clasificado es un **candidato a win**, nunca un win. Lo
 * acepta una persona — misma regla que las propuestas de checkpoint.
 *
 * ⚠️ Los mensajes los escriben **terceros** (los clientes de tu cliente), así que
 * van envueltos con `wrapUntrustedContent`: nada de lo que digan puede cambiar la
 * tarea del modelo.
 */
import { wrapUntrustedContent } from "@/lib/ai/wrap-untrusted-content";

/** Cuántos mensajes entran en una llamada. Más grande abarata; más chico es más preciso. */
export const CLASSIFY_BATCH_SIZE = 25;

export const MESSAGE_SENTIMENTS = ["positive", "neutral", "negative"] as const;
export type MessageSentiment = (typeof MESSAGE_SENTIMENTS)[number];

export type ClassifiableMessage = {
  id: string;
  content: string;
  channelName: string | null;
};

export type MessageClassification = {
  id: string;
  isTestimonial: boolean;
  sentiment: MessageSentiment;
  /** Alguien está trabado, frustrado o pidiendo ayuda sin respuesta. */
  requiresAttention: boolean;
  /** Una oración. `null` cuando no hay nada que resumir. */
  summary: string | null;
};

export const CLASSIFY_SYSTEM_PROMPT = `Sos un analista que lee mensajes de un servidor de Discord de un negocio de infoproductos y los clasifica.

Para cada mensaje devolvés cuatro cosas:

1. "is_testimonial": true SOLO si el mensaje cuenta un resultado concreto que consiguió quien escribe (facturó, cerró clientes, lanzó, mejoró un número). Una felicitación a otro, un "gracias!", un emoji o una pregunta NO son testimonios, aunque estén en un canal que se llame wins.
2. "sentiment": "positive", "neutral" o "negative".
3. "requires_attention": true si la persona está trabada, frustrada, o pide ayuda y nadie respondió. Un mensaje positivo casi nunca requiere atención.
4. "summary": una oración corta en español, o null si el mensaje no dice nada resumible.

Respondés SOLO un objeto JSON con esta forma exacta:
{"results":[{"id":"<id del mensaje>","is_testimonial":false,"sentiment":"neutral","requires_attention":false,"summary":null}]}

Incluí un objeto por cada mensaje recibido, con el mismo "id". No agregues mensajes que no recibiste. Ante la duda, "is_testimonial" es false: un falso positivo ensucia el tracker de wins.`;

/** Arma el prompt de un lote. Puro: se puede testear sin llamar a nadie. */
export function buildClassifyPrompt(messages: readonly ClassifiableMessage[]): string {
  const rendered = messages
    .map(
      (message) =>
        `[id: ${message.id}]${message.channelName ? ` [canal: #${message.channelName}]` : ""}\n${message.content}`
    )
    .join("\n\n---\n\n");

  return `Clasificá estos ${messages.length} mensajes.\n\n${wrapUntrustedContent("mensajes", rendered)}`;
}

/**
 * Valida la respuesta del modelo contra los mensajes que se mandaron.
 *
 * ⭐ Se descarta lo que no corresponde a un mensaje del lote y lo que no se
 * entiende. Un modelo que inventa un id o un sentimiento no rompe la corrida:
 * ese mensaje queda **sin clasificar**, que es la verdad, en vez de guardarse con
 * un valor inventado.
 */
export function parseClassifyResponse(
  raw: unknown,
  sentMessages: readonly ClassifiableMessage[]
): MessageClassification[] {
  const results = (raw as { results?: unknown })?.results;
  if (!Array.isArray(results)) return [];

  const validIds = new Set(sentMessages.map((message) => message.id));
  const seen = new Set<string>();
  const parsed: MessageClassification[] = [];

  for (const entry of results) {
    if (typeof entry !== "object" || entry === null) continue;
    const record = entry as Record<string, unknown>;

    const id = typeof record.id === "string" ? record.id.trim() : "";
    if (!id || !validIds.has(id) || seen.has(id)) continue;

    const sentiment = record.sentiment;
    if (!isSentiment(sentiment)) continue;

    seen.add(id);
    parsed.push({
      id,
      isTestimonial: record.is_testimonial === true,
      sentiment,
      requiresAttention: record.requires_attention === true,
      summary:
        typeof record.summary === "string" && record.summary.trim()
          ? record.summary.trim()
          : null,
    });
  }

  return parsed;
}

export function isSentiment(value: unknown): value is MessageSentiment {
  return (
    typeof value === "string" && (MESSAGE_SENTIMENTS as readonly string[]).includes(value)
  );
}

/** Parte una lista en lotes del tamaño que se clasifica de una. */
export function chunkForClassification<T>(
  items: readonly T[],
  size: number = CLASSIFY_BATCH_SIZE
): T[][] {
  if (size < 1) return [items.slice()];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}
