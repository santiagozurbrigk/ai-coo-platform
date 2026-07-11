/**
 * Normaliza un profileId de Zernio a solo el _id.
 * Acepta string plano, JSON stringificado o objeto { _id, name }.
 */
export function extractProfileId(raw: unknown): string {
  if (raw == null) return "";

  if (typeof raw === "object") {
    const obj = raw as { _id?: string; id?: string };
    return (obj._id ?? obj.id ?? "").trim();
  }

  const str = String(raw).trim();
  if (!str) return "";

  if (str.startsWith("{")) {
    try {
      const parsed = JSON.parse(str) as { _id?: string; id?: string };
      return (parsed._id ?? parsed.id ?? str).trim();
    } catch {
      return str;
    }
  }

  return str;
}
