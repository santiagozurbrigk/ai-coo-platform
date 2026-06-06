import Fuse from "fuse.js";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ClientMatchCandidate = {
  id: string;
  name: string;
  nickname: string | null;
  confidence: number;
};

export type ClientMatchResult = {
  clientId: string | null;
  confidence: number;
  method: string;
  candidates?: ClientMatchCandidate[];
};

type ClientRow = {
  id: string;
  name: string;
  nickname: string | null;
};

function cleanCallTitle(callTitle: string): string {
  return callTitle
    .replace(/'s (zoom|google|teams) meeting/gi, "")
    .replace(/impromptu .* meeting/gi, "")
    .replace(/^entrega\s*[-–]\s*/i, "")
    .replace(/\s+and\s+/gi, " ")
    .trim();
}

export async function tryMatchCallToClient(
  callTitle: string,
  organizationId: string,
  supabase: SupabaseClient
): Promise<ClientMatchResult> {
  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, name, nickname")
    .eq("organization_id", organizationId);

  if (error) {
    console.error("[Fathom:match] clients query error:", error.message);
    return { clientId: null, confidence: 0, method: "query_error" };
  }

  if (!clients?.length) {
    return { clientId: null, confidence: 0, method: "no_clients" };
  }

  const cleanTitle = cleanCallTitle(callTitle);

  if (cleanTitle.length < 3) {
    return { clientId: null, confidence: 0, method: "title_too_short" };
  }

  const clientRows = clients as ClientRow[];
  const searchList = clientRows.flatMap((c) => [
    { id: c.id, term: c.name, name: c.name, nickname: c.nickname },
    ...(c.nickname
      ? [{ id: c.id, term: c.nickname, name: c.name, nickname: c.nickname }]
      : []),
  ]);

  const fuse = new Fuse(searchList, {
    keys: ["term"],
    threshold: 0.35,
    includeScore: true,
  });

  const results = fuse.search(cleanTitle);

  if (!results.length) {
    return { clientId: null, confidence: 0, method: "no_match" };
  }

  const best = results[0];
  const confidence = 1 - (best.score ?? 1);

  const candidates: ClientMatchCandidate[] = results.slice(0, 5).map((r) => ({
    id: r.item.id,
    name: r.item.name,
    nickname: r.item.nickname,
    confidence: 1 - (r.score ?? 1),
  }));

  if (confidence >= 0.75) {
    return {
      clientId: best.item.id,
      confidence,
      method: "fuzzy_auto",
    };
  }

  if (confidence >= 0.5) {
    return {
      clientId: null,
      confidence,
      method: "fuzzy_candidate",
      candidates,
    };
  }

  return {
    clientId: null,
    confidence,
    method: "low_confidence",
    candidates,
  };
}

export const MANUAL_FATHOM_LINK_CONFIDENCE = 1;

export function isManualFathomLink(
  clientId: string | null | undefined,
  associationConfidence: number | null | undefined
): boolean {
  return (
    Boolean(clientId) &&
    Number(associationConfidence ?? 0) >= MANUAL_FATHOM_LINK_CONFIDENCE
  );
}
