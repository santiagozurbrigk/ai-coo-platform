/**
 * D · S2 — El prompt que escribe un SOP desde lo que se dijo en un video.
 *
 * ⭐ Cambia de naturaleza respecto del creador desde texto. Ahí el input son
 * cuatro campos declarativos; acá es una transcripción hablada, desordenada y
 * con muletillas. El prompt tiene que hacer tres cosas que el otro no hace:
 *
 *   1. Extraer los pasos **en el orden en que se muestran**.
 *   2. **No inventar pasos que no se dijeron.** Es el riesgo principal: a un
 *      modelo al que le pedís "un SOP completo" le sale rellenar los huecos con
 *      lo que debería ir, y eso produce un documento que se lee bien y miente.
 *   3. **Marcar lo que el video no aclara.** Es lo que separa un SOP útil de uno
 *      inventado, y le dice al usuario qué le falta grabar.
 *
 * Lógica pura: arma texto, no llama a nadie.
 */
import { wrapUntrustedContent } from "@/lib/ai/wrap-untrusted-content";

export type VideoSopInput = {
  transcript: string;
  title?: string | null;
  department?: string | null;
  context?: string | null;
  /** Capturas disponibles, con el id corto que el modelo puede referenciar. */
  attachments?: { id: string; fileName: string }[];
};

export const VIDEO_SOP_SYSTEM_PROMPT = `Sos un redactor técnico que convierte la transcripción de un video en un procedimiento operativo (SOP) en español rioplatense.

REGLAS, en orden de importancia:

1. **Sólo escribís lo que se dijo en el video.** No completes pasos que faltan, no agregues buenas prácticas, no supongas herramientas. Si el video no lo dice, no va.
2. **Lo que el video no aclara lo marcás.** Cuando un paso quede a medias —no se ve qué botón, no se dice qué pasa si falla, no se aclara quién lo hace— lo anotás como pregunta abierta en vez de resolverlo vos.
3. **Respetás el orden en que se muestran las cosas.** La persona habla desordenado y se corrige: reordená para que se entienda, pero no cambies la secuencia real del procedimiento.
4. Sacá muletillas, repeticiones y "eh", "digamos", "¿se ve?". Escribí en imperativo y en segundo persona.

FORMATO — devolvés SOLO un objeto JSON:

{
  "title": "Título corto del procedimiento",
  "markdown": "El SOP en markdown: un encabezado, un párrafo de para qué sirve, y los pasos numerados",
  "open_questions": ["Lo que el video no aclara, una por línea"]
}

Si la transcripción no alcanza para armar un procedimiento (es muy corta, no explica nada, o habla de otra cosa), devolvés "markdown" con lo poco que haya y explicás en "open_questions" qué falta. **Nunca inventes un SOP para llenar el espacio.**`;

/** El bloque de instrucciones de capturas. Vacío si no hay capturas. */
export function buildAttachmentInstructions(
  attachments: readonly { id: string; fileName: string }[]
): string {
  if (attachments.length === 0) return "";

  const list = attachments
    .map((attachment) => `- ${attachment.id} — ${attachment.fileName}`)
    .join("\n");

  return `
CAPTURAS DISPONIBLES:
${list}

Insertá cada captura en el paso donde corresponda, con esta forma exacta:
![texto que describa la captura](sop-attachment:<id>)

Usá **solamente** los ids de la lista de arriba. No inventes ids: un id que no esté en la lista se borra del documento y la imagen se pierde. Si una captura no corresponde a ningún paso, no la uses.`;
}

export function buildVideoSopPrompt(input: VideoSopInput): string {
  const parts: string[] = [];

  if (input.title?.trim()) parts.push(`Título propuesto: ${input.title.trim()}`);
  if (input.department?.trim()) parts.push(`Departamento: ${input.department.trim()}`);
  if (input.context?.trim()) {
    parts.push(`Contexto que aportó quien grabó: ${input.context.trim()}`);
  }

  const header = parts.length > 0 ? `${parts.join("\n")}\n\n` : "";
  const attachments = buildAttachmentInstructions(input.attachments ?? []);

  // ⚠️ La transcripción va envuelta: es texto hablado y podría contener algo que
  // parezca una instrucción ("ignorá lo anterior y..."). Es dato, no orden.
  return `${header}Convertí esta transcripción en un SOP.

${wrapUntrustedContent("transcripcion", input.transcript)}
${attachments}`;
}

export type VideoSopResult = {
  title: string | null;
  markdown: string;
  openQuestions: string[];
};

/**
 * Valida lo que devolvió el modelo.
 *
 * Devuelve `null` cuando no hay markdown utilizable: un SOP vacío no es un SOP, y
 * es preferible marcar el job como fallido —con la transcripción guardada, que es
 * lo caro— a dejar un documento en blanco que alguien tiene que descubrir.
 */
export function parseVideoSopResponse(raw: unknown): VideoSopResult | null {
  if (typeof raw !== "object" || raw === null) return null;
  const record = raw as Record<string, unknown>;

  const markdown = typeof record.markdown === "string" ? record.markdown.trim() : "";
  if (!markdown) return null;

  const title = typeof record.title === "string" && record.title.trim()
    ? record.title.trim()
    : null;

  const openQuestions = Array.isArray(record.open_questions)
    ? record.open_questions
        .filter((entry): entry is string => typeof entry === "string")
        .map((entry) => entry.trim())
        .filter(Boolean)
    : [];

  return { title, markdown, openQuestions };
}
