import { AI_MODELS, callClaudeText } from "@/lib/ai/anthropic";
import { wrapUntrustedContent } from "@/lib/ai/wrap-untrusted-content";

export type FathomTaskProposal = {
  title: string;
  description?: string;
  area?: "marketing" | "ventas" | "operaciones" | "finanzas" | "clientes" | "general";
  priority?: "low" | "medium" | "high";
  due_date?: string | null;
  assignee_name?: string | null;
};

const VALID_AREAS = new Set([
  "marketing",
  "ventas",
  "operaciones",
  "finanzas",
  "clientes",
  "general",
]);

const VALID_PRIORITIES = new Set(["low", "medium", "high"]);

export function isTeamMeetingCallType(
  callType: string | null | undefined
): boolean {
  return callType === "team" || callType === "team_meeting";
}

function parseTaskProposals(raw: string): FathomTaskProposal[] {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
  if (!arrayMatch) return [];

  try {
    const parsed = JSON.parse(arrayMatch[0]) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
      .map((item): FathomTaskProposal | null => {
        const title = String(item.title ?? "").trim().slice(0, 80);
        if (!title) return null;

        const area = String(item.area ?? "general");
        const priority = String(item.priority ?? "medium");

        return {
          title,
          description: String(item.description ?? "").trim(),
          area: VALID_AREAS.has(area)
            ? (area as FathomTaskProposal["area"])
            : "general",
          priority: VALID_PRIORITIES.has(priority)
            ? (priority as FathomTaskProposal["priority"])
            : "medium",
          due_date:
            typeof item.due_date === "string" && item.due_date.trim()
              ? item.due_date.trim()
              : null,
          assignee_name:
            typeof item.assignee_name === "string" && item.assignee_name.trim()
              ? item.assignee_name.trim()
              : null,
        };
      })
      .filter((item): item is FathomTaskProposal => item !== null);
  } catch {
    return [];
  }
}

export async function extractTeamMeetingTaskProposals(params: {
  organizationId: string;
  transcript: string;
  summary?: string | null;
}): Promise<FathomTaskProposal[]> {
  const transcript = params.transcript.trim();
  if (!transcript) return [];

  const system = `Eres un asistente de gestión de equipos. Analiza el transcript de la reunión y extrae TODAS las tareas, compromisos y próximos pasos concretos.

Devuelve SOLO un JSON array (sin markdown) con objetos que tengan:
- title: string (máx 80 chars, accionable)
- description: string (contexto del por qué/cómo)
- area: uno de [marketing, ventas, operaciones, finanzas, clientes, general]
- priority: uno de [low, medium, high]
- due_date: "YYYY-MM-DD" o null
- assignee_name: nombre exacto del responsable mencionado, o null

Solo tareas ACCIONABLES. No incluir puntos de discusión sin acción concreta.`;

  const summaryBlock = params.summary?.trim()
    ? wrapUntrustedContent("resumen", params.summary)
    : "Sin resumen";

  const rawText = await callClaudeText({
    organizationId: params.organizationId,
    model: AI_MODELS.HAIKU,
    feature: "fathom_team_task_extraction",
    system,
    messages: [
      {
        role: "user",
        content: `Transcript:\n${wrapUntrustedContent("transcript", transcript.slice(0, 120_000))}\n\nResumen:\n${summaryBlock}`,
      },
    ],
    maxTokens: 4096,
  });

  if (!rawText?.trim()) return [];
  return parseTaskProposals(rawText);
}
