/** Rellena huecos con 0 para mantener el eje continuo (solo capa de presentación). */

export function padTimeSeriesZeros(
  points: { label: string; value: number }[],
  targetLength: number
): { label: string; value: number }[] {
  if (points.length >= targetLength) {
    return points.slice(-targetLength);
  }

  const padded: { label: string; value: number }[] = [];
  const missing = targetLength - points.length;

  for (let i = 0; i < missing; i++) {
    padded.push({ label: `—${i + 1}`, value: 0 });
  }

  return [...padded, ...points];
}
