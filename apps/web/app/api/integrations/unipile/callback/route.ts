import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { withOAuthNoCache } from "@/lib/integrations/oauth-callback-headers";
import { getUnipileConfig } from "@/lib/unipile/config";
import {
  decodeUnipileHostedName,
} from "@/lib/unipile/integration";
import { fetchUnipileAccount } from "@/lib/unipile/hosted-auth";
import { unipileHostedCallbackSchema } from "@/lib/unipile/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function verifyCallbackSecret(req: Request): boolean {
  const { webhookSecret } = getUnipileConfig();
  if (!webhookSecret) return true;

  const { searchParams } = new URL(req.url);
  return searchParams.get("secret") === webhookSecret;
}

export async function POST(req: Request) {
  if (!verifyCallbackSecret(req)) {
    return withOAuthNoCache(
      NextResponse.json({ error: "No autorizado" }, { status: 401 })
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return withOAuthNoCache(
      NextResponse.json({ error: "JSON inválido" }, { status: 400 })
    );
  }

  const parsed = unipileHostedCallbackSchema.safeParse(body);
  if (!parsed.success) {
    return withOAuthNoCache(
      NextResponse.json({ error: "Payload de callback inválido" }, { status: 400 })
    );
  }

  const { status, account_id: accountId, name } = parsed.data;
  if (status !== "CREATION_SUCCESS" && status !== "RECONNECTED") {
    return withOAuthNoCache(NextResponse.json({ ok: true, ignored: true }));
  }

  const decoded = decodeUnipileHostedName(name);
  if (!decoded) {
    return withOAuthNoCache(
      NextResponse.json({ error: "name de callback inválido" }, { status: 400 })
    );
  }

  const { organizationId, provider } = decoded;
  const { displayName } = await fetchUnipileAccount(accountId);
  const admin = createAdminClient();

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

  if (error) {
    return withOAuthNoCache(
      NextResponse.json({ error: error.message }, { status: 500 })
    );
  }

  return withOAuthNoCache(
    NextResponse.json({
      ok: true,
      accountId,
      provider,
      displayName,
    })
  );
}
