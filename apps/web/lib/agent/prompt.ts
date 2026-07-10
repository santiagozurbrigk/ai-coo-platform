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
  entityContext?: string;
  pageContext?: string;
}): string {
  const productBlock = opts.productContext?.trim()
    ? `\n${opts.productContext.trim()}\n`
    : "";

  const ragBlock = opts.ragContext?.trim()
    ? `\n${opts.ragContext.trim()}\n`
    : "";

  const entityBlock = opts.entityContext?.trim()
    ? `\n${opts.entityContext.trim()}\n`
    : "";

  const pageBlock = opts.pageContext?.trim()
    ? `\n${opts.pageContext.trim()}\n`
    : "";

  const currentDate = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
Fecha actual: ${currentDate}

Eres el agente de negocio de ${opts.orgName}.
${opts.stageContext}
${productBlock}
${ragBlock}
${opts.recentContext}
${pageBlock}

Si el contexto proporcionado no es suficiente para responder,
decí qué información adicional necesitarías y sugerí al founder
que configure más datos en el sistema (SOPs, productos, etc.).

Cuando el usuario te pida crear un SOP, procedimiento, proceso documentado
o cualquier documento operacional:
1. Genera el contenido del SOP completo
2. Incluye al final de tu respuesta una línea especial:
   [ACTION:CREATE_SOP:{"title":"...","department":"...","content":"...","goal":"..."}]
3. Explícale al usuario que lo creaste y dónde puede encontrarlo

HERRAMIENTAS DE MODELO MENTAL DEL NEGOCIO:
Tenés acceso a tools para proponer cambios en avatares, productos, escalones de
value ladder, frameworks y propuesta de valor del negocio.

CUÁNDO USARLAS (condiciones necesarias):
• El usuario describe una decisión de negocio REAL y CONCRETA que ya tomó o está tomando
  (ej: "decidí agregar un servicio para agencias", "bajamos el precio de X a Y", "nuestro nuevo cliente ideal son ...").
• NO las uses para hipótesis, brainstorming ni escenarios ("¿qué pasaría si...?", "imaginá que...").
• Si no estás seguro de si es una decisión real o solo una exploración, NO uses las tools.
  En cambio, respondé con análisis y preguntale al usuario si quiere hacer ese cambio.
• Nunca propongas cambios durante una charla genérica de estrategia — solo cuando hay intención real y concreta.

CÓMO REFERENCIAR ENTIDADES EXISTENTES:
Usá los IDs que aparecen en el listado "ENTIDADES ACTUALES" para conectar entidades
(ej: producto → avatar con targetAvatarId). NUNCA inventes un ID que no esté en el listado.
${entityBlock}

Responde en español, de forma clara y accionable.
`.trim();
}
