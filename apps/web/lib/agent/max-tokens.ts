/**
 * Resuelve max_tokens para el agente.
 * Con SSE activo el timeout de Vercel no corta mientras el stream emite datos.
 */
export function resolveAgentMaxTokens(opts: {
  enableThinking?: boolean;
  useCanvas?: boolean;
}): number {
  if (opts.enableThinking && !opts.useCanvas) return 6144;
  if (opts.useCanvas) return 12288;
  return 8192;
}

/** Budget de extended thinking — debe ser menor que maxTokens. */
export function resolveAgentThinkingBudget(enableThinking?: boolean): number {
  if (!enableThinking) return 0;
  return 4000;
}
