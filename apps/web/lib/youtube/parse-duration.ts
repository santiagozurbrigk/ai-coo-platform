/** Parsea duración ISO 8601 de YouTube (PT4M13S → segundos). */
export function parseDuration(duration: string | null | undefined): number {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] ?? "0", 10);
  const minutes = parseInt(match[2] ?? "0", 10);
  const seconds = parseInt(match[3] ?? "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

export function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds < 0) return "0 s";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes} min` : `${hours}h`;
  }
  if (minutes > 0 && seconds > 0) return `${minutes} min ${seconds} s`;
  if (minutes > 0) return `${minutes} min`;
  return `${seconds} s`;
}
