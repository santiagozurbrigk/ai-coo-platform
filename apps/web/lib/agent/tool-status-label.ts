/** Etiqueta contextual breve para el indicador de estado durante tool calls. */
export function getToolStatusLabel(toolName: string): string {
  if (toolName === "web_search") {
    return "Buscando en la web…";
  }
  if (toolName === "generate_document") {
    return "Generando documento…";
  }
  if (
    toolName === "analyze_content_piece" ||
    toolName === "create_content_variants" ||
    toolName === "get_top_performing_content" ||
    toolName.includes("content")
  ) {
    return "Buscando en el módulo de contenido…";
  }
  if (toolName.includes("knowledge") || toolName.includes("rag")) {
    return "Buscando en la base de conocimiento…";
  }
  return "Procesando…";
}
