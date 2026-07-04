import type { SupabaseClient } from "@supabase/supabase-js";

export type ConnectedUnipileAccount = {
  provider: "instagram" | "whatsapp";
  unipileAccountId: string;
};

type InboxConversationRow = {
  source?: string | null;
  unipile_account_id?: string | null;
};

const UNIPILE_INBOX_SOURCES = new Set(["instagram", "whatsapp"]);

export async function fetchConnectedUnipileAccounts(
  supabase: SupabaseClient,
  organizationId: string
): Promise<ConnectedUnipileAccount[]> {
  const { data, error } = await supabase
    .from("unipile_integrations")
    .select("provider, unipile_account_id")
    .eq("organization_id", organizationId)
    .eq("status", "connected");

  if (error) {
    console.error("[fetchConnectedUnipileAccounts]", error.message);
    return [];
  }

  return (data ?? []).flatMap((row) => {
    if (row.provider !== "instagram" && row.provider !== "whatsapp") return [];
    return [
      {
        provider: row.provider,
        unipileAccountId: row.unipile_account_id,
      },
    ];
  });
}

export function shouldIncludeConversationInInbox(
  row: InboxConversationRow,
  connectedAccounts: ConnectedUnipileAccount[]
): boolean {
  const source = row.source;
  if (!source || !UNIPILE_INBOX_SOURCES.has(source)) {
    return true;
  }

  if (row.unipile_account_id == null) {
    return true;
  }

  return connectedAccounts.some(
    (account) =>
      account.provider === source &&
      account.unipileAccountId === row.unipile_account_id
  );
}

export function filterConversationsForInbox<T extends InboxConversationRow>(
  rows: T[],
  connectedAccounts: ConnectedUnipileAccount[]
): T[] {
  return rows.filter((row) =>
    shouldIncludeConversationInInbox(row, connectedAccounts)
  );
}
