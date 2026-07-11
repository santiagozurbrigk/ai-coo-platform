/** Resuelve max_tokens para el agente según flags y contexto. */
export function resolveAgentMaxTokens(opts: {
  enableThinking?: boolean;
  useCanvas?: boolean;
}): number {
  if (opts.enableThinking && opts.useCanvas) return 24_576;
  if (opts.enableThinking) return 20_480;
  if (opts.useCanvas) return 16_384;
  return 16_384;
}
