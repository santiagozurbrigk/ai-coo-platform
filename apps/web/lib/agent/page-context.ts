export type PageEntityType = "content_piece" | "lead" | "call";

export type PageContextState = {
  entityType: PageEntityType;
  entityId: string;
  entityData: Record<string, unknown>;
};

export function buildPageContextPrompt(context: PageContextState | null): string {
  if (!context) return "";

  const dataLines = Object.entries(context.entityData)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) =>
      `- ${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`
    )
    .join("\n");

  return `
CONTEXTO DE PÁGINA ACTUAL:
El usuario está viendo una entidad de tipo "${context.entityType}" (ID: ${context.entityId}).
${dataLines ? `Datos disponibles:\n${dataLines}` : ""}

Usá este contexto para interpretar pedidos como "este reel", "esta pieza" o "este lead".
Si el usuario pide algo sobre otra entidad y no hay contexto suficiente, pedí clarificación antes de actuar.
`.trim();
}
