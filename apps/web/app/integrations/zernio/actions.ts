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
  conversationId: string
): Promise<ZernioMessage[]> {
  const organizationId = await requireOrganizationId();
  const integration = await getZernioIntegrationForOrg(organizationId);
  if (!integration) {
    throw new Error("Integración Zernio no configurada");
  }

  const { data } = await zernioGetMessages(conversationId);
  return data.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export async function sendZernioMessageAction(conversationId: string, text: string) {
  const organizationId = await requireOrganizationId();
  const integration = await getZernioIntegrationForOrg(organizationId);
  if (!integration) {
    throw new Error("Integración Zernio no configurada");
  }

  const result = await zernioSendMessage(conversationId, text);
  revalidatePath(paths.platform.sales.inbox);
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
