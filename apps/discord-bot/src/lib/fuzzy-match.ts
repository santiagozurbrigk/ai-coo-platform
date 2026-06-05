import Fuse from "fuse.js";

interface Client {
  id: string;
  name: string;
  nickname: string | null;
  email: string | null;
}

interface MatchResult {
  client: Client;
  confidence: number;
}

export function fuzzyMatchClients(
  searchName: string,
  clients: Client[]
): MatchResult[] {
  const searchList = clients.flatMap((c) => [
    { id: c.id, searchTerm: c.name, client: c },
    ...(c.nickname
      ? [{ id: c.id, searchTerm: c.nickname, client: c }]
      : []),
  ]);

  const fuse = new Fuse(searchList, {
    keys: ["searchTerm"],
    threshold: 0.35,
    includeScore: true,
  });

  const results = fuse.search(searchName);

  const seen = new Set<string>();
  return results
    .filter((r) => !seen.has(r.item.id) && seen.add(r.item.id))
    .map((r) => ({
      client: r.item.client,
      confidence: 1 - (r.score || 0),
    }))
    .filter((r) => r.confidence > 0.65)
    .slice(0, 3);
}

export function extractClientNameFromChannel(channelName: string): string {
  let name = channelName
    .replace(/^cliente[-_]/i, "")
    .replace(/^client[-_]/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const dashMatch = name.match(/^[a-z]{1,4}\s*-\s*(.+)$/i);
  if (dashMatch) name = dashMatch[1].trim();

  return name;
}
