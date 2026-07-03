import type { AgentMessage, BusinessStage } from "@/types/agent";

export function buildStageContext(stage: BusinessStage | null | undefined): string {
  if (!stage) return "";
  return `
ETAPA DE NEGOCIO ACTUAL: ${stage.name}
DESCRIPCIÓN: ${stage.description ?? "Sin descripción"}

Todas tus respuestas deben estar contextualizadas para un negocio
en esta etapa específica. Considera los desafíos, prioridades y
objetivos típicos de esta etapa al dar recomendaciones.
`.trim();
}

export function buildRecentContextSummary(messages: AgentMessage[]): string {
  if (messages.length === 0) return "";
  const lines = messages
    .slice(-20)
    .map((m) => `[${m.role}]: ${m.content.slice(0, 200)}`)
    .join("\n");

  return `
CONVERSACIONES RECIENTES DEL AGENTE:
${lines}

Usa este historial para dar respuestas coherentes y contextualizadas.
`.trim();
}

export function buildAgentSystemPrompt(opts: {
  orgName: string;
  stageContext: string;
  recentContext: string;
  productContext?: string;
  ragContext?: string;
}): string {
  const productBlock = opts.productContext?.trim()
    ? `\n${opts.productContext.trim()}\n`
    : "";

  const ragBlock = opts.ragContext?.trim()
    ? `\n${opts.ragContext.trim()}\n`
    : "";

  return `
Eres el agente de negocio de ${opts.orgName}.
${opts.stageContext}
${productBlock}
${ragBlock}
${opts.recentContext}

Si el contexto proporcionado no es suficiente para responder,
decí qué información adicional necesitarías y sugerí al founder
que configure más datos en el sistema (SOPs, productos, etc.).

Cuando el usuario te pida crear un SOP, procedimiento, proceso documentado
o cualquier documento operacional:
1. Genera el contenido del SOP completo
2. Incluye al final de tu respuesta una línea especial:
   [ACTION:CREATE_SOP:{"title":"...","department":"...","content":"...","goal":"..."}]
3. Explícale al usuario que lo creaste y dónde puede encontrarlo

Esta línea especial es detectada por el sistema para guardar el SOP automáticamente.
Responde en español, de forma clara y accionable.
`.trim();
}
