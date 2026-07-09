import { createAdminClient } from "@/lib/supabase/admin";
import type { UnipileProvider } from "./config";
import { fetchUnipileAccount } from "./hosted-auth";
import { decodeUnipileHostedName } from "./integration";
import { unipileHostedCallbackSchema } from "./schemas";

export function isUnipileHostedAuthNotify(body: unknown): boolean {
  const parsed = unipileHostedCallbackSchema.safeParse(body);
  if (!parsed.success) return false;
  return (
    parsed.data.status === "CREATION_SUCCESS" ||
    parsed.data.status === "RECONNECTED"
  );
}

export async function processUnipileHostedAuthNotify(body: unknown): Promise<{
  ok: true;
  ignored?: boolean;
  accountId?: string;
  provider?: UnipileProvider;
  displayName?: string | null;
}> {
  const parsed = unipileHostedCallbackSchema.safeParse(body);
  if (!parsed.success) {
    throw new Error("Payload de hosted auth inválido");
  }

  const { status, account_id: accountId, name } = parsed.data;
  if (status !== "CREATION_SUCCESS" && status !== "RECONNECTED") {
    return { ok: true, ignored: true };
  }

  const decoded = decodeUnipileHostedName(name);
  if (!decoded) {
    throw new Error("name de hosted auth inválido");
  }

  const { displayName, provider: providerFromAccount } =
    await fetchUnipileAccount(accountId);
  const provider = decoded.provider ?? providerFromAccount;
  if (!provider) {
    throw new Error("No se pudo determinar el proveedor de la cuenta Unipile");
  }

  const admin = createAdminClient();
  const organizationId = decoded.organizationId;

  await admin
    .from("unipile_integrations")
    .update({
      status: "disconnected",
      updated_at: new Date().toISOString(),
    })
    .eq("organization_id", organizationId)
    .eq("provider", provider)
    .eq("status", "connected");

  const { error } = await admin.from("unipile_integrations").upsert(
    {
      organization_id: organizationId,
      unipile_account_id: accountId,
      provider,
      display_name: displayName,
      status: "connected",
      connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "organization_id,unipile_account_id" }
  );

  if (error) throw new Error(error.message);

  return {
    ok: true,
    accountId,
    provider,
    displayName,
  };
}
