/** Extrae nombre de cliente desde títulos Fathom comunes. */

const PREFIXES =
  /^(ENTREGA|CONSULTORIA|CONSULTORÍA|SESION|SESIÓN|VISION|VISIÓN|EQUIPO|DELIVERY|CONSULTING|SESSION)\s*[-–—:]\s*/i;

const TEAM_KEYWORDS = /\b(EQUIPO|TEAM|VISION|VISIÓN)\b/i;

export function extractClientNameFromTitle(title: string): string | null {
  const trimmed = title.trim();
  if (!trimmed || TEAM_KEYWORDS.test(trimmed)) return null;

  const withoutPrefix = trimmed.replace(PREFIXES, "").trim();
  if (!withoutPrefix || withoutPrefix.length < 2) return null;
  if (TEAM_KEYWORDS.test(withoutPrefix)) return null;

  return withoutPrefix;
}

function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(value: string): Set<string> {
  return new Set(normalizeName(value).split(" ").filter(Boolean));
}

/** Similitud 0–1 entre dos nombres. */
export function fuzzyNameScore(a: string, b: string): number {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;

  if (na.includes(nb) || nb.includes(na)) return 0.92;

  const ta = tokenSet(a);
  const tb = tokenSet(b);
  if (ta.size === 0 || tb.size === 0) return 0;

  let overlap = 0;
  for (const t of ta) {
    if (tb.has(t)) overlap++;
  }
  const union = new Set([...ta, ...tb]).size;
  return overlap / union;
}

export type ClientMatchCandidate = {
  id: string;
  name: string;
  nickname: string | null;
  confidence: number;
};

export type AssociationResult =
  | { status: "unmatched"; reason: string }
  | {
      status: "pending_review";
      reason: string;
      candidates: ClientMatchCandidate[];
    }
  | {
      status: "associated";
      clientId: string;
      confidence: number;
    };

export function associateCallWithClients(
  title: string,
  clients: { id: string; name: string; nickname: string | null }[]
): AssociationResult {
  const extractedName = extractClientNameFromTitle(title);
  if (!extractedName) {
    return { status: "unmatched", reason: "no_client_name_detected" };
  }

  const candidates: ClientMatchCandidate[] = clients
    .map((c) => {
      const nameScore = fuzzyNameScore(c.name, extractedName);
      const nickScore = c.nickname
        ? fuzzyNameScore(c.nickname, extractedName)
        : 0;
      return {
        id: c.id,
        name: c.name,
        nickname: c.nickname,
        confidence: Math.max(nameScore, nickScore),
      };
    })
    .filter((c) => c.confidence >= 0.55)
    .sort((a, b) => b.confidence - a.confidence);

  if (candidates.length === 0) {
    return { status: "unmatched", reason: "no_client_found" };
  }

  if (candidates.length === 1 && candidates[0].confidence >= 0.8) {
    return {
      status: "associated",
      clientId: candidates[0].id,
      confidence: candidates[0].confidence,
    };
  }

  return {
    status: "pending_review",
    reason:
      candidates.length > 1 ? "multiple_clients_same_name" : "low_confidence",
    candidates,
  };
}
