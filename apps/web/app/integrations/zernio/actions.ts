"use server";

import { revalidatePath } from "next/cache";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { paths } from "@/routes";
import {
  zernioCreateProfile,
  zernioGetConnectUrl,
  zernioGetMessages,
  zernioGetPostComments,
  zernioGetPostsAnalytics,
  zernioHideComment,
  zernioListAccounts,
  zernioListComments,
  zernioListConversations,
  zernioReplyToComment,
  zernioSendMessage,
  type ZernioComment,
  type ZernioConversation,
  type ZernioMessage,
} from "@/lib/zernio/client";
import { callClaudeJson } from "@/lib/ai/anthropic";
import {
  getZernioIntegrationForOrg,
  mapZernioAccountToConnected,
  type ZernioConnectedAccount,
} from "@/lib/zernio/integration";

export type ZernioIntegrationStatus = {
  connected: boolean;
  profileId: string | null;
  connectedAccounts: ZernioConnectedAccount[];
};

const EMPTY_STATUS: ZernioIntegrationStatus = {
  connected: false,
  profileId: null,
  connectedAccounts: [],
};

export type ZernioConversationWithAccount = ZernioConversation & {
  accountId: string;
};

export type ZernioCommentWithAccount = ZernioComment & {
  accountId?: string;
};

export type ZernioAnalyticsSummary = {
  totalImpressions: number;
  totalLikes: number;
  totalComments: number;
  hasData: boolean;
};

async function ensureZernioProfileId(
  organizationId: string
): Promise<{ profileId: string; integrationId: string }> {
  const admin = createAdminClient();
  const existing = await getZernioIntegrationForOrg(organizationId);
  if (existing) {
    return {
      profileId: existing.zernio_profile_id,
      integrationId: existing.id,
    };
  }

  const created = await zernioCreateProfile(organizationId);
  const profileId = created.profile._id;

  const { data, error } = await admin
    .from("zernio_integrations")
    .insert({
      organization_id: organizationId,
      zernio_profile_id: profileId,
      connected_accounts: [],
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath(paths.platform.integrations);
  return { profileId, integrationId: data.id as string };
}

function filterAccountsForProfile(
  accounts: Awaited<ReturnType<typeof zernioListAccounts>>["accounts"],
  profileId: string
) {
  const filtered = accounts.filter(
    (account) =>
      account.profileId === profileId ||
      account.profile === profileId ||
      !account.profileId
  );
  return filtered.length > 0 ? filtered : accounts;
}

export async function getZernioIntegrationStatusAction(): Promise<ZernioIntegrationStatus> {
  if (!isSupabaseConfigured()) return EMPTY_STATUS;

  try {
    const organizationId = await requireOrganizationId();
    const row = await getZernioIntegrationForOrg(organizationId);
    if (!row) return EMPTY_STATUS;

    return {
      connected: row.connected_accounts.length > 0,
      profileId: row.zernio_profile_id,
      connectedAccounts: row.connected_accounts,
    };
  } catch {
    return EMPTY_STATUS;
  }
}

export async function saveZernioIntegrationAction(profileId: string) {
  const organizationId = await requireOrganizationId();
  const admin = createAdminClient();
  const { accounts } = await zernioListAccounts();
  const connectedAccounts = filterAccountsForProfile(accounts, profileId).map(
    mapZernioAccountToConnected
  );

  const { error } = await admin.from("zernio_integrations").upsert(
    {
      organization_id: organizationId,
      zernio_profile_id: profileId,
      connected_accounts: connectedAccounts,
      is_active: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "organization_id" }
  );

  if (error) throw new Error(error.message);
  revalidatePath(paths.platform.integrations);
  return { connectedAccounts };
}

export async function getZernioConnectUrlAction(platform: string) {
  const organizationId = await requireOrganizationId();
  const { profileId } = await ensureZernioProfileId(organizationId);
  const { authUrl } = await zernioGetConnectUrl(platform, profileId);
  return { authUrl };
}

export async function refreshZernioAccountsAction() {
  const organizationId = await requireOrganizationId();
  const integration = await getZernioIntegrationForOrg(organizationId);
  if (!integration) {
    const { profileId } = await ensureZernioProfileId(organizationId);
    return saveZernioIntegrationAction(profileId);
  }

  const { accounts } = await zernioListAccounts();
  const connectedAccounts = filterAccountsForProfile(
    accounts,
    integration.zernio_profile_id
  ).map(mapZernioAccountToConnected);

  const admin = createAdminClient();
  const { error } = await admin
    .from("zernio_integrations")
    .update({
      connected_accounts: connectedAccounts,
      updated_at: new Date().toISOString(),
    })
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);
  revalidatePath(paths.platform.integrations);
  return { connectedAccounts };
}

export async function listZernioConversationsAction(): Promise<
  ZernioConversationWithAccount[]
> {
  const organizationId = await requireOrganizationId();
  const integration = await getZernioIntegrationForOrg(organizationId);
  if (!integration || integration.connected_accounts.length === 0) {
    return [];
  }

  const results = await Promise.all(
    integration.connected_accounts.map(async (account) => {
      try {
        const result = await zernioListConversations(account.accountId);
        if (result.meta.accountsFailed > 0) {
          console.warn(
            "[Zernio] listConversations failed accounts:",
            result.meta.failedAccounts
          );
        }
        return result.data.map((conversation) => ({
          ...conversation,
          accountId: conversation.accountId || account.accountId,
        }));
      } catch {
        return [];
      }
    })
  );

  return results
    .flat()
    .sort(
      (a, b) =>
        new Date(b.updatedTime).getTime() - new Date(a.updatedTime).getTime()
    );
}

export async function getZernioMessagesAction(
  conversationId: string,
  accountId: string
): Promise<ZernioMessage[]> {
  const organizationId = await requireOrganizationId();
  const integration = await getZernioIntegrationForOrg(organizationId);
  if (!integration) {
    throw new Error("Integración Zernio no configurada");
  }

  const result = await zernioGetMessages(conversationId, accountId);
  const messages = result.data ?? [];
  return messages.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export async function sendZernioMessageAction(
  conversationId: string,
  text: string,
  accountId: string
) {
  const organizationId = await requireOrganizationId();
  const integration = await getZernioIntegrationForOrg(organizationId);
  if (!integration) {
    throw new Error("Integración Zernio no configurada");
  }

  const result = await zernioSendMessage(conversationId, text, accountId);
  return result;
}

export async function listZernioCommentsAction(): Promise<ZernioCommentWithAccount[]> {
  const organizationId = await requireOrganizationId();
  const integration = await getZernioIntegrationForOrg(organizationId);
  if (!integration || integration.connected_accounts.length === 0) {
    return [];
  }

  const results = await Promise.all(
    integration.connected_accounts.map(async (account) => {
      try {
        const { comments } = await zernioListComments(account.accountId);
        return comments.map((comment) => ({
          ...comment,
          accountId: account.accountId,
        }));
      } catch {
        return [];
      }
    })
  );

  return results
    .flat()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function getZernioPostCommentsAction(
  postId: string
): Promise<ZernioCommentWithAccount[]> {
  const organizationId = await requireOrganizationId();
  const integration = await getZernioIntegrationForOrg(organizationId);
  if (!integration || integration.connected_accounts.length === 0) {
    return [];
  }

  try {
    const { comments } = await zernioGetPostComments(postId);
    return comments
      .map((comment) => ({
        ...comment,
        accountId: integration.connected_accounts.find(
          (account) =>
            account.platform.toLowerCase() === comment.platform.toLowerCase()
        )?.accountId,
      }))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  } catch {
    const allComments = await listZernioCommentsAction();
    return allComments.filter((comment) => comment.postId === postId);
  }
}

export async function replyToZernioCommentAction(
  postId: string,
  commentId: string,
  message: string,
  accountId: string
) {
  const organizationId = await requireOrganizationId();
  const integration = await getZernioIntegrationForOrg(organizationId);
  if (!integration) {
    throw new Error("Integración Zernio no configurada");
  }

  const result = await zernioReplyToComment(postId, commentId, message, accountId);

  const admin = createAdminClient();
  await admin
    .from("zernio_comments")
    .update({ is_replied: true })
    .eq("organization_id", organizationId)
    .eq("zernio_comment_id", commentId);

  revalidatePath(paths.platform.comentarios);
  return result;
}

export async function hideZernioCommentAction(postId: string, commentId: string) {
  const organizationId = await requireOrganizationId();
  const integration = await getZernioIntegrationForOrg(organizationId);
  if (!integration) {
    throw new Error("Integración Zernio no configurada");
  }

  const result = await zernioHideComment(postId, commentId);

  const admin = createAdminClient();
  await admin
    .from("zernio_comments")
    .update({ is_hidden: true })
    .eq("organization_id", organizationId)
    .eq("zernio_comment_id", commentId);

  revalidatePath(paths.platform.comentarios);
  return result;
}

export async function getZernioAnalyticsAction(): Promise<ZernioAnalyticsSummary> {
  if (!isSupabaseConfigured()) {
    return { totalImpressions: 0, totalLikes: 0, totalComments: 0, hasData: false };
  }

  try {
    const organizationId = await requireOrganizationId();
    const integration = await getZernioIntegrationForOrg(organizationId);
    if (!integration || integration.connected_accounts.length === 0) {
      return { totalImpressions: 0, totalLikes: 0, totalComments: 0, hasData: false };
    }

    const analytics = await zernioGetPostsAnalytics();
    const posts = (analytics as { posts?: Array<{ analytics?: Record<string, { impressions?: number; likes?: number; comments?: number }> }> }).posts ?? [];

    let totalImpressions = 0;
    let totalLikes = 0;
    let totalComments = 0;

    for (const post of posts) {
      const platforms = post.analytics ?? {};
      for (const metrics of Object.values(platforms)) {
        totalImpressions += metrics.impressions ?? 0;
        totalLikes += metrics.likes ?? 0;
        totalComments += metrics.comments ?? 0;
      }
    }

    const hasData = totalImpressions > 0 || totalLikes > 0 || totalComments > 0;
    return { totalImpressions, totalLikes, totalComments, hasData };
  } catch {
    return { totalImpressions: 0, totalLikes: 0, totalComments: 0, hasData: false };
  }
}

export type ZernioAnalysisSummary = {
  ai_tag?: string;
  ai_status?: string;
  ai_qualification?: string;
  ai_ghosting_risk?: string;
  agenda_sent?: boolean;
  is_scheduled?: boolean;
  scheduling_process_missing?: boolean;
};

export type ZernioAnalysisResult = ZernioAnalysisSummary & {
  success: boolean;
  ai_sentiment?: string;
  ai_pain_point?: string;
  ai_recommended_action?: string;
  ai_summary?: string;
  link_sent?: boolean;
  suggested_next_message?: string;
  scheduling_process_missing?: boolean;
  error?: string;
};

export async function analyzeZernioConversationAction(
  conversationId: string,
  accountId: string,
  participantName: string,
  platform: string,
  messages: Array<{ text?: string; direction: string; createdAt: string }>
): Promise<ZernioAnalysisResult> {
  try {
    const organizationId = await requireOrganizationId();
    const admin = createAdminClient();

    const { data: sopRows } = await admin
      .from("sops")
      .select("title, content")
      .eq("organization_id", organizationId)
      .eq("status", "active")
      .or(
        "title.ilike.%agendamiento%,title.ilike.%agenda%,title.ilike.%proceso de venta%,tags.cs.{agendamiento}"
      )
      .limit(1);

    const schedulingSop = sopRows?.[0] ?? null;
    const schedulingProcessMissing = !schedulingSop;

    const conversationText = messages
      .slice(-40)
      .map((m) => {
        const isOutbound =
          m.direction === "outbound" || m.direction === "outgoing";
        return `[${isOutbound ? "NOSOTROS" : participantName}]: ${m.text ?? ""}`;
      })
      .join("\n");

    const schedulingContext = schedulingSop
      ? `\n\n## PROCESO DE AGENDAMIENTO DEL NEGOCIO\nUsá este proceso para recomendar el siguiente mensaje al setter:\n\n${schedulingSop.content}`
      : `\n\n## PROCESO DE AGENDAMIENTO\nNo se encontró ningún documento de proceso de agendamiento en la base de conocimiento. Igualmente intentá sugerir el mejor próximo mensaje posible basándote en el contexto de la conversación.`;

    const result = await callClaudeJson<{
      ai_tag: string;
      ai_status: string;
      ai_qualification: string;
      ai_sentiment: string;
      ai_pain_point: string;
      ai_recommended_action: string;
      ai_ghosting_risk: string;
      ai_summary: string;
      agenda_sent: boolean;
      is_scheduled: boolean;
      link_sent: boolean;
      suggested_next_message: string;
    }>({
      organizationId,
      task: "conversation_scoring",
      feature: "zernio_conversation_analysis",
      system:
        "Respondé únicamente con JSON válido en español, sin markdown ni texto adicional.",
      user: `Analizá esta conversación de ${platform} con ${participantName} y respondé en español con JSON exacto:

${conversationText}
${schedulingContext}

Devolvé este JSON (sin markdown, solo JSON):
{
  "ai_tag": "caliente|tibio|frio|agendado|no_interesado",
  "ai_status": "interesado|no_interesado|agendado|esperando_respuesta",
  "ai_qualification": "alto|medio|bajo",
  "ai_sentiment": "positivo|neutral|negativo",
  "ai_pain_point": "el dolor o problema principal que mencionó en máx 100 chars",
  "ai_recommended_action": "qué hacer ahora en máx 150 chars",
  "ai_ghosting_risk": "alto|medio|bajo",
  "ai_summary": "resumen de 2 líneas de la conversación",
  "agenda_sent": true/false,
  "is_scheduled": true/false,
  "link_sent": true/false,
  "suggested_next_message": "el mensaje exacto que el setter debería enviar ahora, en el tono y plataforma correctos, máx 300 chars. Si el lead ya está agendado o no interesado, dejalo como cadena vacía."
}`,
    });

    if (!result) {
      throw new Error("El análisis IA no devolvió resultado");
    }

    await admin.from("zernio_conversation_analysis").upsert(
      {
        organization_id: organizationId,
        conversation_id: conversationId,
        account_id: accountId,
        participant_name: participantName,
        platform,
        message_count: messages.length,
        last_analyzed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        scheduling_process_missing: schedulingProcessMissing,
        ...result,
      },
      { onConflict: "organization_id,conversation_id" }
    );

    return {
      success: true,
      scheduling_process_missing: schedulingProcessMissing,
      ...result,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error desconocido",
    };
  }
}

export async function getZernioAnalysisBatchAction(
  conversationIds: string[]
): Promise<Record<string, ZernioAnalysisSummary>> {
  if (conversationIds.length === 0) return {};
  try {
    const organizationId = await requireOrganizationId();
    const admin = createAdminClient();
    const { data } = await admin
      .from("zernio_conversation_analysis")
      .select(
        "conversation_id, ai_tag, ai_status, ai_qualification, ai_ghosting_risk, agenda_sent, is_scheduled"
      )
      .eq("organization_id", organizationId)
      .in("conversation_id", conversationIds);

    const map: Record<string, ZernioAnalysisSummary> = {};
    for (const row of data ?? []) {
      map[row.conversation_id as string] = {
        ai_tag: row.ai_tag as string | undefined,
        ai_status: row.ai_status as string | undefined,
        ai_qualification: row.ai_qualification as string | undefined,
        ai_ghosting_risk: row.ai_ghosting_risk as string | undefined,
        agenda_sent: row.agenda_sent as boolean | undefined,
        is_scheduled: row.is_scheduled as boolean | undefined,
      };
    }
    return map;
  } catch {
    return {};
  }
}
