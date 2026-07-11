/**
 * Resuelve max_tokens para el agente.
 * Valores conservadores: sin streaming, la respuesta debe completar dentro del timeout de Vercel.
 */
export function resolveAgentMaxTokens(opts: {
  enableThinking?: boolean;
  useCanvas?: boolean;
}): number {
  if (opts.enableThinking && opts.useCanvas) return 8192;
  if (opts.enableThinking) return 6144;
  if (opts.useCanvas) return 4096;
  return 4096;
}

/** Budget de extended thinking — debe ser menor que maxTokens. */
export function resolveAgentThinkingBudget(enableThinking?: boolean): number {
  if (!enableThinking) return 0;
  return 4000;
}
