/**
 * Estima el % de retención hasta el segundo del CTA según la posición
 * en el video (curva típica de YouTube).
 *
 * TODO Phase 2: retención real desde YouTube Analytics API
 * (scope yt-analytics.readonly + dimension elapsedVideoTimeRatio).
 */
export function estimateRetentionAtCTA(
  ctaSecond: number,
  durationSeconds: number
): number {
  if (!ctaSecond || !durationSeconds) return 0;

  const ctaPosition = ctaSecond / durationSeconds;
  const estimatedRetention = Math.round(100 * Math.exp(-2.5 * ctaPosition));

  return Math.max(5, Math.min(100, estimatedRetention));
}
