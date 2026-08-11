import { ZERNIO_API_BASE, ZERNIO_API_KEYS_URL } from "@/lib/zernio/constants";
import { extractProfileId } from "@/lib/zernio/profile-id";

export { ZERNIO_API_KEYS_URL };

function buildHeaders(apiKey: string) {
  const trimmed = apiKey.trim();
  if (!trimmed) {
    throw new Error("API key de Zernio vacía");
  }
  return {
    Authorization: `Bearer ${trimmed}`,
    "Content-Type": "application/json",
  };
}

function resolveEnvApiKey(): string {
  const apiKey = process.env.ZERNIO_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ZERNIO_API_KEY no configurado");
  }
  return apiKey;
}

export interface ZernioAccount {
  _id: string;
  platform: string;
  username?: string;
  displayName?: string;
  profilePictureUrl?: string;
  profileId?: string;
  profile?: string;
}

export interface ZernioConversation {
  id: string;
  platform: string;
  accountId: string;
  accountUsername: string;
  participantId: string;
  participantName: string;
  participantPicture?: string;
  lastMessage?: string;
  updatedTime: string;
  status: "active" | "archived";
  unreadCount: number;
  instagramProfile?: {
    isFollower: boolean;
    isFollowing: boolean;
    followerCount: number;
    isVerified: boolean;
  };
}

export interface ZernioMessage {
  id: string;
  conversationId: string;
  accountId?: string;
  platform?: string;
  message?: string;
  text?: string;
  senderId?: string;
  senderName?: string;
  direction: "incoming" | "outgoing" | "inbound" | "outbound";
  createdAt: string;
  attachments?: Array<{
    id?: string;
    type?: string;
    url?: string;
    filename?: string;
    previewUrl?: string;
  }>;
  deliveryStatus?: string;
}

export interface ZernioComment {
  _id: string;
  postId: string;
  platform: string;
  author?: { name?: string; username?: string; profilePictureUrl?: string };
  text: string;
  isHidden?: boolean;
  createdAt: string;
}

export type ZernioPostCommentAuthor = {
  id: string;
  name?: string;
  username?: string;
  picture?: string;
  isOwner?: boolean;
};

export type ZernioPostComment = {
  id: string;
  message: string;
  createdTime: string;
  from: ZernioPostCommentAuthor;
  likeCount?: number;
  replyCount?: number;
  replies?: ZernioPostComment[];
  canReply?: boolean;
  canHide?: boolean;
  isHidden?: boolean;
  isLiked?: boolean;
};

export type ZernioPostCommentsResponse = {
  comments: ZernioPostComment[];
  pagination: {
    hasMore: boolean;
    cursor: string | null;
  };
  meta: {
    platform: string;
    postId: string;
    accountId: string;
    lastUpdated?: string;
  };
};

export type ZernioAdStatus =
  | "active"
  | "paused"
  | "pending_review"
  | "rejected"
  | "completed"
  | "cancelled"
  | "error";

export type ZernioAdMetrics = {
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  engagement: number;
  conversions: number;
  costPerConversion: number;
  purchaseValue: number;
  roas: number;
  actions: Record<string, number>;
  actionValues: Record<string, number>;
  videoPlayActions: number;
  video30SecWatchedActions: number;
  videoThruplayWatchedActions: number;
  videoP25WatchedActions: number;
  videoP50WatchedActions: number;
  videoP75WatchedActions: number;
  videoP95WatchedActions: number;
  videoP100WatchedActions: number;
  videoAvgTimeWatchedActions: number;
  lastSyncedAt: string;
};

export type ZernioLinkedAd = {
  _id: string;
  name: string;
  platform: string;
  status: ZernioAdStatus;
  adType: string;
  budget: { amount: number; type: "daily" | "lifetime" };
  metrics: ZernioAdMetrics;
  campaignName: string;
  adSetName: string;
  schedule: { startDate: string; endDate?: string };
  creative: { thumbnailUrl?: string; instagramPermalinkUrl?: string };
};

export type ZernioAdsResponse = {
  ads: ZernioLinkedAd[];
  pagination?: {
    hasMore?: boolean;
    cursor?: string | null;
    total?: number;
  };
};

export type ZernioPost = {
  id?: string;
  _id?: string;
  platform?: string;
  platformPostId?: string;
  postType?: string;
  mediaType?: string;
  platformPostUrl?: string;
  title?: string;
  content?: string;
  hashtags?: string[];
  thumbnailUrl?: string;
  publishedAt?: string;
  createdAt?: string;
  profileId?: string;
  profile?: string;
  accountId?: string;
  platforms?: Array<{
    platform?: string;
    accountId?: string | { _id?: string };
    platformPostUrl?: string;
    postType?: string;
    status?: string;
  }>;
  analytics?: ZernioPostAnalytics;
};

export type ZernioPostAnalytics = {
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  reach?: number;
  impressions?: number;
  views?: number;
  engagementRate?: number;
};

/** Post item from GET /v1/analytics (external or late source). */
export type ZernioAnalyticsPost = {
  postId?: string;
  platformPostId?: string;
  content?: string;
  publishedAt?: string;
  platform?: string;
  platformPostUrl?: string;
  thumbnailUrl?: string;
  mediaType?: string;
  postType?: string;
  isExternal?: boolean;
  analytics?: ZernioPostAnalytics;
};

// ─── Media ────────────────────────────────────────────────────────────────────

export type ZernioMediaPresignResponse = {
  /** URL temporal para hacer PUT del archivo (expira en minutos) */
  uploadUrl: string;
  /** URL pública permanente para referenciar el archivo en posts */
  fileUrl: string;
};

export type ZernioMediaItem = {
  type: "image" | "video" | "gif";
  url: string;
};

export type ZernioClient = ReturnType<typeof createZernioClient>;

export function createZernioClient(apiKey: string) {
  const headers = () => buildHeaders(apiKey);

  async function zernioFetchJson<T>(
    label: string,
    url: string,
    init?: RequestInit
  ): Promise<T> {
    const res = await fetch(url, { ...init, cache: "no-store" });
    const bodyText = await res.text();
    const preview = bodyText.slice(0, 200);

    if (!res.ok) {
      console.error(`[Zernio] ${label} failed`, {
        status: res.status,
        url,
        preview,
      });
      throw new Error(`Zernio ${label}: HTTP ${res.status} — ${preview}`);
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (
      !contentType.includes("application/json") &&
      bodyText.trimStart().startsWith("<")
    ) {
      console.error(`[Zernio] ${label} returned HTML`, {
        status: res.status,
        url,
        preview,
      });
      throw new Error(`Zernio ${label}: respuesta HTML inesperada — ${preview}`);
    }

    try {
      return JSON.parse(bodyText) as T;
    } catch {
      console.error(`[Zernio] ${label} invalid JSON`, { url, preview });
      throw new Error(`Zernio ${label}: JSON inválido — ${preview}`);
    }
  }

  return {
    async validateApiKey(): Promise<{ accounts: ZernioAccount[] }> {
      return this.listAccounts();
    },

    async listAccounts() {
      const res = await fetch(`${ZERNIO_API_BASE}/accounts`, { headers: headers() });
      if (!res.ok) {
        throw new Error(`Zernio listAccounts: HTTP ${res.status}`);
      }
      return res.json() as Promise<{ accounts: ZernioAccount[] }>;
    },

    async listConversations(accountId?: string) {
      const url = accountId
        ? `${ZERNIO_API_BASE}/inbox/conversations?accountId=${encodeURIComponent(accountId)}`
        : `${ZERNIO_API_BASE}/inbox/conversations`;
      const res = await fetch(url, { headers: headers() });
      if (!res.ok) throw new Error(`Zernio listConversations: ${await res.text()}`);
      return res.json() as Promise<{
        data: ZernioConversation[];
        pagination?: { hasMore: boolean; nextCursor: string | null };
        meta: {
          accountsQueried: number;
          accountsFailed: number;
          failedAccounts: unknown[];
        };
      }>;
    },

    async getMessages(conversationId: string, accountId: string) {
      const res = await fetch(
        `${ZERNIO_API_BASE}/inbox/conversations/${encodeURIComponent(conversationId)}/messages?accountId=${encodeURIComponent(accountId)}`,
        { headers: headers() }
      );
      if (!res.ok) throw new Error(`Zernio getMessages: ${await res.text()}`);
      const json = (await res.json()) as Record<string, unknown>;
      const rawList = Array.isArray(json.messages)
        ? json.messages
        : Array.isArray(json.data)
          ? json.data
          : [];
      const rawMessages: ZernioMessage[] = rawList.map((m: Record<string, unknown>) => ({
        ...m,
        text: (m.message ?? m.text) as string | undefined,
        direction:
          m.direction === "incoming"
            ? "inbound"
            : m.direction === "outgoing"
              ? "outbound"
              : (m.direction as "inbound" | "outbound"),
      })) as ZernioMessage[];
      return {
        data: rawMessages,
        pagination:
          (json.pagination as { hasMore: boolean; nextCursor: string | null } | null) ??
          null,
      };
    },

    async sendMessage(conversationId: string, text: string, accountId: string) {
      const res = await fetch(
        `${ZERNIO_API_BASE}/inbox/conversations/${encodeURIComponent(conversationId)}/messages`,
        {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({ message: text, accountId }),
        }
      );
      if (!res.ok) throw new Error(`Zernio sendMessage: ${await res.text()}`);
      return res.json();
    },

    async listComments(accountId?: string) {
      const url = accountId
        ? `${ZERNIO_API_BASE}/inbox/comments?accountId=${encodeURIComponent(accountId)}`
        : `${ZERNIO_API_BASE}/inbox/comments`;
      const res = await fetch(url, { headers: headers() });
      if (!res.ok) throw new Error(`Zernio listComments: ${await res.text()}`);
      return res.json() as Promise<{ comments: ZernioComment[] }>;
    },

    async getPostComments(
      postId: string,
      accountId: string,
      limit = 25,
      cursor?: string
    ) {
      const url = new URL(
        `${ZERNIO_API_BASE}/inbox/comments/${encodeURIComponent(postId)}`
      );
      url.searchParams.set("accountId", accountId);
      url.searchParams.set("limit", String(limit));
      if (cursor) url.searchParams.set("cursor", cursor);

      return zernioFetchJson<ZernioPostCommentsResponse>(
        "getPostComments",
        url.toString(),
        { headers: headers() }
      );
    },

    async getLinkedAds(effectiveInstagramMediaId: string, limit = 10) {
      const trimmed = effectiveInstagramMediaId.trim();
      if (!trimmed) {
        throw new Error("Zernio getLinkedAds: effectiveInstagramMediaId vacío");
      }

      const url = new URL(`${ZERNIO_API_BASE}/ads`);
      url.searchParams.set("effectiveInstagramMediaId", trimmed);
      url.searchParams.set("source", "all");
      url.searchParams.set("limit", String(limit));

      return zernioFetchJson<ZernioAdsResponse>("getLinkedAds", url.toString(), {
        headers: headers(),
      });
    },

    async listAds(params?: {
      source?: string;
      limit?: number;
      status?: string;
      platform?: string;
      fromDate?: string;
      toDate?: string;
    }) {
      const url = new URL(`${ZERNIO_API_BASE}/ads`);
      url.searchParams.set("source", params?.source ?? "all");
      url.searchParams.set("limit", String(params?.limit ?? 100));
      if (params?.status) url.searchParams.set("status", params.status);
      if (params?.platform) url.searchParams.set("platform", params.platform);
      if (params?.fromDate) url.searchParams.set("fromDate", params.fromDate);
      if (params?.toDate) url.searchParams.set("toDate", params.toDate);

      return zernioFetchJson<ZernioAdsResponse>("listAds", url.toString(), {
        headers: headers(),
      });
    },

    async replyToComment(
      postId: string,
      commentId: string,
      message: string,
      accountId: string
    ) {
      const res = await fetch(
        `${ZERNIO_API_BASE}/inbox/comments/${encodeURIComponent(postId)}`,
        {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({ accountId, commentId, message }),
        }
      );
      if (!res.ok) throw new Error(`Zernio replyToComment: ${await res.text()}`);
      return res.json();
    },

    async hideComment(postId: string, commentId: string) {
      const res = await fetch(
        `${ZERNIO_API_BASE}/inbox/comments/${encodeURIComponent(postId)}/${encodeURIComponent(commentId)}/hide`,
        { method: "POST", headers: headers() }
      );
      if (!res.ok) throw new Error(`Zernio hideComment: ${await res.text()}`);
      return res.json();
    },

    async listPublishedPosts(params?: {
      profileId?: string;
      accountId?: string;
      source?: "zernio" | "external";
      status?: "draft" | "scheduled" | "published" | "failed";
      limit?: number;
    }) {
      const url = new URL(`${ZERNIO_API_BASE}/posts`);
      url.searchParams.set("status", params?.status ?? "published");
      url.searchParams.set("limit", String(params?.limit ?? 50));
      url.searchParams.set("source", params?.source ?? "zernio");
      if (params?.profileId) {
        url.searchParams.set("profileId", extractProfileId(params.profileId));
      }
      if (params?.accountId) {
        url.searchParams.set("accountId", params.accountId);
      }

      return zernioFetchJson<{ posts?: ZernioPost[] }>(
        "listPublishedPosts",
        url.toString(),
        { headers: headers() }
      );
    },

    async syncExternalPosts(accountId: string) {
      const data = await zernioFetchJson<{
        posts?: ZernioPost[];
        synced?: {
          postsFound?: number;
          postsSynced?: number;
          skipped?: boolean;
        };
      }>("syncExternalPosts", `${ZERNIO_API_BASE}/posts/sync-external`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ accountId }),
      });

      return { posts: data.posts ?? [], synced: data.synced };
    },

    /**
     * Obtiene una URL presignada para subir un archivo de media directamente
     * al storage de Zernio. Flujo:
     *   1. Llamar este método → obtener { uploadUrl, fileUrl }
     *   2. PUT del archivo binario a uploadUrl
     *   3. Pasar fileUrl en mediaItems al llamar createPost
     */
    async getMediaPresignedUrl(
      filename: string,
      contentType: string
    ): Promise<ZernioMediaPresignResponse> {
      return zernioFetchJson<ZernioMediaPresignResponse>(
        "getMediaPresignedUrl",
        `${ZERNIO_API_BASE}/media/presign`,
        {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({ filename, contentType }),
        }
      );
    },

    async createPost(params: {
      profileId: string;
      platform: string;
      postType?: string;
      status: "draft" | "published";
      content: string;
      accountId?: string;
      /** Items de media (imágenes o videos) a adjuntar al post */
      mediaItems?: ZernioMediaItem[];
    }) {
      const res = await fetch(`${ZERNIO_API_BASE}/posts`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          profileId: extractProfileId(params.profileId),
          platform: params.platform,
          postType: params.postType ?? "post",
          status: params.status,
          content: params.content,
          ...(params.accountId ? { accountId: params.accountId } : {}),
          ...(params.mediaItems?.length ? { mediaItems: params.mediaItems } : {}),
        }),
      });

      if (!res.ok) {
        throw new Error(`Zernio createPost: ${await res.text()}`);
      }

      return res.json() as Promise<{
        post?: ZernioPost & { platformPostUrl?: string };
        id?: string;
        _id?: string;
        platformPostUrl?: string;
      }>;
    },

    async getPostAnalytics(postId: string) {
      const trimmed = postId.trim();
      if (!trimmed) {
        throw new Error("Zernio getPostAnalytics: postId vacío");
      }

      const url = new URL(`${ZERNIO_API_BASE}/analytics`);
      url.searchParams.set("postId", trimmed);

      const data = await zernioFetchJson<Record<string, unknown>>(
        "getPostAnalytics",
        url.toString(),
        { headers: headers() }
      );

      const posts = data.posts;
      if (Array.isArray(posts) && posts.length > 0) {
        const post = posts[0] as {
          analytics?: unknown;
          platforms?: Record<string, unknown>;
        };
        return (post.analytics ?? post.platforms ?? post) as {
          platforms?: Record<
            string,
            {
              impressions?: number;
              likes?: number;
              clicks?: number;
              shares?: number;
              comments?: number;
              reach?: number;
              saves?: number;
              views?: number;
            }
          >;
        };
      }

      return data as {
        platforms?: Record<
          string,
          {
            impressions?: number;
            likes?: number;
            clicks?: number;
            shares?: number;
            comments?: number;
            reach?: number;
            saves?: number;
            views?: number;
          }
        >;
      };
    },

    async listPostAnalytics(params?: {
      accountId?: string;
      source?: "late" | "external" | "all";
      platform?: string;
      profileId?: string;
      limit?: number;
    }) {
      const url = new URL(`${ZERNIO_API_BASE}/analytics`);
      url.searchParams.set("source", params?.source ?? "all");
      url.searchParams.set("limit", String(params?.limit ?? 50));
      if (params?.accountId) {
        url.searchParams.set("accountId", params.accountId);
      }
      if (params?.platform) {
        url.searchParams.set("platform", params.platform);
      }
      if (params?.profileId) {
        url.searchParams.set("profileId", extractProfileId(params.profileId));
      }

      const data = await zernioFetchJson<
        ZernioAnalyticsPost[] | { posts?: ZernioAnalyticsPost[] }
      >("listPostAnalytics", url.toString(), { headers: headers() });

      const posts = Array.isArray(data) ? data : (data.posts ?? []);
      return { posts };
    },

    async getAccountAnalytics(accountId: string, startDate: string, endDate: string) {
      const res = await fetch(
        `${ZERNIO_API_BASE}/analytics/account/${encodeURIComponent(accountId)}?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
        { headers: headers() }
      );
      if (!res.ok) throw new Error(`Zernio getAccountAnalytics: ${await res.text()}`);
      return res.json();
    },

    async getPostsAnalytics() {
      const res = await fetch(`${ZERNIO_API_BASE}/analytics/posts`, {
        headers: headers(),
      });
      if (!res.ok) throw new Error(`Zernio getPostsAnalytics: ${await res.text()}`);
      return res.json();
    },
  };
}

function defaultClient() {
  return createZernioClient(resolveEnvApiKey());
}

// Legacy exports (env API key) — prefer createZernioClient / getZernioClientForOrganization
export async function zernioCreateProfile(name: string) {
  const res = await fetch(`${ZERNIO_API_BASE}/profiles`, {
    method: "POST",
    headers: buildHeaders(resolveEnvApiKey()),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(`Zernio createProfile: ${await res.text()}`);
  return res.json() as Promise<{ profile: { _id: string; name: string } }>;
}

export async function zernioListAccounts() {
  return defaultClient().listAccounts();
}

export async function zernioListConversations(accountId?: string) {
  return defaultClient().listConversations(accountId);
}

export async function zernioGetMessages(conversationId: string, accountId: string) {
  return defaultClient().getMessages(conversationId, accountId);
}

export async function zernioSendMessage(
  conversationId: string,
  text: string,
  accountId: string
) {
  return defaultClient().sendMessage(conversationId, text, accountId);
}

export async function zernioListComments(accountId?: string) {
  return defaultClient().listComments(accountId);
}

export async function zernioGetPostComments(
  postId: string,
  accountId: string,
  limit = 25,
  cursor?: string
) {
  return defaultClient().getPostComments(postId, accountId, limit, cursor);
}

export async function zernioReplyToComment(
  postId: string,
  commentId: string,
  message: string,
  accountId: string
) {
  return defaultClient().replyToComment(postId, commentId, message, accountId);
}

export async function zernioHideComment(postId: string, commentId: string) {
  return defaultClient().hideComment(postId, commentId);
}

export async function zernioListPublishedPosts(params?: {
  profileId?: string;
  accountId?: string;
  source?: "zernio" | "external";
  status?: "draft" | "scheduled" | "published" | "failed";
  limit?: number;
}) {
  return defaultClient().listPublishedPosts(params);
}

export async function zernioSyncExternalPosts(accountId: string) {
  return defaultClient().syncExternalPosts(accountId);
}

export async function zernioCreatePost(params: {
  profileId: string;
  platform: string;
  postType?: string;
  status: "draft" | "published";
  content: string;
  accountId?: string;
}) {
  return defaultClient().createPost(params);
}

export async function zernioGetPostAnalytics(postId: string) {
  return defaultClient().getPostAnalytics(postId);
}

export async function zernioListPostAnalytics(params?: {
  accountId?: string;
  source?: "late" | "external" | "all";
  platform?: string;
  profileId?: string;
  limit?: number;
}) {
  return defaultClient().listPostAnalytics(params);
}

export async function zernioGetAccountAnalytics(
  accountId: string,
  startDate: string,
  endDate: string
) {
  return defaultClient().getAccountAnalytics(accountId, startDate, endDate);
}

export async function zernioGetPostsAnalytics() {
  return defaultClient().getPostsAnalytics();
}
