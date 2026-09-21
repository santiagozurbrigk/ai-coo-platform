/**
 * Los compromisos de una 1-1, sacados del transcript.
 *
 * ⭐ Es hermano de `team-task-extraction.ts`, pero pregunta otra cosa, y la
 * diferencia es el punto del módulo.
 *
 * En una reunión de equipo todas las tareas son del equipo, y alcanza con
 * preguntar "qué hay que hacer". En una 1-1 hay **dos lados**: el cliente se
 * compromete a grabar los videos y el coach a mandarle la plantilla. Si se
 * mezclan, el coach cierra la llamada sin registro de lo suyo y la lista del
 * cliente queda con cosas que no le tocan.
 *
 * ⭐ Lo que **no** es una tarea: lo que el cliente ya hizo, lo que se discutió
 * sin llegar a un compromiso, y los consejos generales del coach. La diferencia
 * entre "te conviene postear más seguido" y "vas a postear tres veces por semana
 * hasta la próxima" es la que decide si esta lista sirve o es ruido.
 */
import { AI_MODELS, callClaudeText } from "@/lib/ai/anthropic";
import { wrapUntrustedContent } from "@/lib/ai/wrap-untrusted-content";

export type OneOnOneTaskOwner = "client" | "coach";

export type OneOnOneTask = {
  title: string;
  description: string;
  owner: OneOnOneTaskOwner;
  /** `YYYY-MM-DD`, sólo si en la llamada se dijo una fecha. */
  dueDate: string | null;
};

const TITLE_MAX = 120;
const DESCRIPTION_MAX = 500;
/** Un transcript de una hora entra holgado; el corte es contra los casos raros. */
const TRANSCRIPT_MAX_CHARS = 120_000;
/** Más de esto en una sola llamada es la IA inventando, no un coach exigente. */
const MAX_TASKS = 25;

const SYSTEM_PROMPT = `Sos un asistente que lee la transcripción de una sesión 1-1 entre un coach y su cliente, y extrae los compromisos concretos que quedaron para después de la llamada.

Devolvé SOLO un JSON array (sin markdown, sin explicaciones) de objetos con:
- title: string, máximo 120 caracteres, en infinitivo o imperativo, concreto y verificable
- description: string, el contexto de por qué quedó ese compromiso (podés dejarlo vacío)
- owner: "client" si le toca al cliente, "coach" si le toca al coach o su equipo
- due_date: "YYYY-MM-DD" si en la llamada se dijo una fecha concreta, o null

Reglas:
- Solo compromisos hacia adelante. Lo que el cliente YA hizo no es una tarea.
- Un consejo general no es una tarea. "Te conviene postear más" no entra; "vas a postear 3 veces por semana" sí.
- Si algo se discutió pero no quedó decidido, no lo incluyas.
- No inventes fechas. Si no se dijo ninguna, due_date es null.
- Escribí en español rioplatense, en la misma voz en que se habló.
- Si no hay ningún compromiso concreto, devolvé [].`;

function clamp(value: unknown, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

/**
 * Del texto que devuelve el modelo a las tareas.
 *
 * ⭐ Lo que no se entiende se descarta, no se completa con un valor por defecto
 * inventado. Una tarea sin título no es una tarea vacía: no es nada.
 *
 * Lógica pura: no toca red ni base.
 */
export function parseOneOnOneTasks(raw: string): OneOnOneTask[] {
  const trimmed = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
  if (!arrayMatch) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(arrayMatch[0]);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const tasks: OneOnOneTask[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;

    const title = clamp(record.title, TITLE_MAX);
    if (!title) continue;

    const owner: OneOnOneTaskOwner = record.owner === "coach" ? "coach" : "client";

    const rawDue = typeof record.due_date === "string" ? record.due_date.trim() : "";
    // Sólo se acepta la fecha en el formato pedido. Cualquier otra cosa —"la
    // semana que viene", "15/10"— se descarta: una fecha mal leída vence cuando
    // no corresponde y el aviso deja de significar algo.
    const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDue) ? rawDue : null;

    tasks.push({
      title,
      description: clamp(record.description, DESCRIPTION_MAX),
      owner,
      dueDate,
    });

    if (tasks.length >= MAX_TASKS) break;
  }

  return tasks;
}

/**
 * Lee el transcript de una 1-1 y devuelve los compromisos que quedaron.
 *
 * Devuelve `[]` —nunca tira— cuando no hay transcript o el modelo no contesta
 * nada usable: la llamada se sube igual y las tareas se cargan a mano.
 */
export async function extractOneOnOneTasks(params: {
  organizationId: string;
  transcript: string;
  clientName?: string | null;
  callDate?: string | null;
}): Promise<OneOnOneTask[]> {
  const transcript = params.transcript.trim();
  if (!transcript) return [];

  /**
   * ⭐ La fecha de la llamada va en el prompt porque sin ella "para el viernes"
   * no se puede convertir en una fecha. Con la fecha de hoy en vez de la de la
   * llamada, una grabación de hace dos semanas produciría vencimientos ya
   * pasados.
   */
  const contexto = [
    params.clientName ? `Cliente: ${params.clientName}` : null,
    params.callDate ? `Fecha de la llamada: ${params.callDate.slice(0, 10)}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const rawText = await callClaudeText({
    organizationId: params.organizationId,
    model: AI_MODELS.HAIKU,
    feature: "fathom_one_on_one_tasks",
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `${contexto ? `${contexto}\n\n` : ""}${wrapUntrustedContent(
          "transcript",
          transcript.slice(0, TRANSCRIPT_MAX_CHARS)
        )}`,
      },
    ],
    maxTokens: 4096,
  });

  if (!rawText?.trim()) return [];
  return parseOneOnOneTasks(rawText);
}
