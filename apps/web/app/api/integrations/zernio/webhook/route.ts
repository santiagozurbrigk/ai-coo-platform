// SETUP: Registrar este webhook en el dashboard de Zernio:
// URL: {NEXT_PUBLIC_APP_URL}/api/integrations/zernio/webhook
// Eventos a suscribir: message.received, message.sent, comment.received, account.connected, account.disconnected
// Dashboard: https://zernio.com/dashboard/webhooks

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  findZernioOrgByAccountId,
  findZernioOrgByProfileId,
  mapZernioAccountToConnected,
  type ZernioConnectedAccount,
} from "@/lib/zernio/integration";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type WebhookBody = {
  event?: string;
  id?: string;
  data?: Record<string, unknown>;
  account?: {
    _id?: string;
    platform?: string;
    username?: string;
    displayName?: string;
    profilePictureUrl?: string;
  };
  profileId?: string;
};

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });
  }

  let body: WebhookBody;
  try {
    body = (await req.json()) as WebhookBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { event, id: eventId } = body;

  if (event === "message.received" || event === "message.sent") {
    const messageData = (body.data ?? {}) as {
      messageId?: string;
      conversationId?: string;
      platform?: string;
      direction?: "inbound" | "outbound";
      text?: string;
      sender?: {
        name?: string;
        username?: string;
        profilePictureUrl?: string;
      };
      accountId?: string;
    };

    if (!messageData.accountId) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const organizationId = await findZernioOrgByAccountId(messageData.accountId);
    if (organizationId) {
      await supabase.from("zernio_messages").upsert(
        {
          organization_id: organizationId,
          zernio_message_id: messageData.messageId ?? eventId ?? crypto.randomUUID(),
          zernio_conversation_id: messageData.conversationId ?? "",
          platform: messageData.platform ?? "unknown",
          direction:
            messageData.direction ??
            (event === "message.sent" ? "outbound" : "inbound"),
          text: messageData.text,
          sender_name: messageData.sender?.name,
          sender_username: messageData.sender?.username,
          sender_avatar_url: messageData.sender?.profilePictureUrl,
          is_read: event === "message.sent",
          raw_payload: body,
        },
        { onConflict: "organization_id,zernio_message_id" }
      );
    }
  }

  if (event === "comment.received") {
    const commentData = (body.data ?? {}) as {
      commentId?: string;
      postId?: string;
      platform?: string;
      author?: { name?: string; username?: string };
      text?: string;
      accountId?: string;
    };

    if (!commentData.accountId) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const organizationId = await findZernioOrgByAccountId(commentData.accountId);
    if (organizationId && commentData.text) {
      await supabase.from("zernio_comments").upsert(
        {
          organization_id: organizationId,
          zernio_comment_id: commentData.commentId ?? eventId ?? crypto.randomUUID(),
          zernio_post_id: commentData.postId ?? "",
          platform: commentData.platform ?? "unknown",
          author_name: commentData.author?.name,
          author_username: commentData.author?.username,
          text: commentData.text,
          raw_payload: body,
        },
        { onConflict: "organization_id,zernio_comment_id" }
      );
    }
  }

  if (event === "account.connected") {
    const account = body.account;
    const profileId = body.profileId;
    if (!account?._id || !profileId) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const organizationId = await findZernioOrgByProfileId(profileId);
    if (!organizationId) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const { data: row } = await supabase
      .from("zernio_integrations")
      .select("connected_accounts")
      .eq("organization_id", organizationId)
      .maybeSingle();

    const existing = ((row?.connected_accounts as ZernioConnectedAccount[]) ?? []).filter(
      (a) => a.accountId !== account._id
    );
    const nextAccount = mapZernioAccountToConnected({
      _id: account._id,
      platform: account.platform ?? "unknown",
      username: account.username,
      displayName: account.displayName,
      profilePictureUrl: account.profilePictureUrl,
    });

    await supabase
      .from("zernio_integrations")
      .update({
        connected_accounts: [...existing, nextAccount],
        updated_at: new Date().toISOString(),
      })
      .eq("organization_id", organizationId);
  }

  return NextResponse.json({ ok: true });
}
