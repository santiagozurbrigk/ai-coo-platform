export function extractTranscriptPreview(transcript: string): string {
  const trimmed = transcript.trim();
  if (!trimmed) return "";

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) {
      const first = parsed[0];
      if (first && typeof first === "object" && "text" in first) {
        const text = String((first as { text: unknown }).text ?? "");
        if (text) return `${text.slice(0, 150)}...`;
      }
    }
  } catch {
    // plain text transcript
  }

  if (trimmed.length <= 150) return trimmed;
  return `${trimmed.slice(0, 150)}...`;
}
