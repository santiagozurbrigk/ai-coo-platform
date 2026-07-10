const ZERNIO_BASE = "https://zernio.com/api/v1";

function zernioHeaders() {
  const apiKey = process.env.ZERNIO_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ZERNIO_API_KEY no configurado");
  }
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

// ── Profiles ──────────────────────────────────────────
export async function zernioCreateProfile(name: string) {
  const res = await fetch(`${ZERNIO_BASE}/profiles`, {
    method: "POST",
    headers: zernioHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(`Zernio createProfile: ${await res.text()}`);
  return res.json() as Promise<{ profile: { _id: string; name: string } }>;
}

// ── Accounts ──────────────────────────────────────────
export async function zernioListAccounts() {
  const res = await fetch(`${ZERNIO_BASE}/accounts`, { headers: zernioHeaders() });
  if (!res.ok) throw new Error(`Zernio listAccounts: ${await res.text()}`);
  return res.json() as Promise<{ accounts: ZernioAccount[] }>;
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

// ── Connect (OAuth) ────────────────────────────────────
export async function zernioGetConnectUrl(platform: string, profileId: string) {
  const res = await fetch(
    `${ZERNIO_BASE}/connect/${platform}?profileId=${encodeURIComponent(profileId)}`,
    { headers: zernioHeaders() }
  );
  if (!res.ok) throw new Error(`Zernio getConnectUrl: ${await res.text()}`);
  return res.json() as Promise<{ authUrl: string }>;
}

// ── Inbox / DMs ───────────────────────────────────────
export async function zernioListConversations(accountId?: string) {
  const url = accountId
    ? `${ZERNIO_BASE}/inbox/conversations?accountId=${encodeURIComponent(accountId)}`
    : `${ZERNIO_BASE}/inbox/conversations`;
  const res = await fetch(url, { headers: zernioHeaders() });
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
}

export async function zernioGetMessages(conversationId: string) {
  const res = await fetch(
    `${ZERNIO_BASE}/inbox/conversations/${encodeURIComponent(conversationId)}/messages`,
    { headers: zernioHeaders() }
  );
  if (!res.ok) throw new Error(`Zernio getMessages: ${await res.text()}`);
  return res.json() as Promise<{ messages: ZernioMessage[] }>;
}

export async function zernioSendMessage(conversationId: string, text: string) {
  const res = await fetch(
    `${ZERNIO_BASE}/inbox/conversations/${encodeURIComponent(conversationId)}/send`,
    {
      method: "POST",
      headers: zernioHeaders(),
      body: JSON.stringify({ text }),
    }
  );
  if (!res.ok) throw new Error(`Zernio sendMessage: ${await res.text()}`);
  return res.json();
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
  _id: string;
  conversationId: string;
  text?: string;
  direction: "inbound" | "outbound";
  sender?: { name?: string; username?: string };
  createdAt: string;
}

// ── Comments ──────────────────────────────────────────
export async function zernioListComments(accountId?: string) {
  const url = accountId
    ? `${ZERNIO_BASE}/inbox/comments?accountId=${encodeURIComponent(accountId)}`
    : `${ZERNIO_BASE}/inbox/comments`;
  const res = await fetch(url, { headers: zernioHeaders() });
  if (!res.ok) throw new Error(`Zernio listComments: ${await res.text()}`);
  return res.json() as Promise<{ comments: ZernioComment[] }>;
}

export async function zernioGetPostComments(postId: string) {
  const res = await fetch(
    `${ZERNIO_BASE}/inbox/comments/${encodeURIComponent(postId)}`,
    { headers: zernioHeaders() }
  );
  if (!res.ok) throw new Error(`Zernio getPostComments: ${await res.text()}`);
  return res.json() as Promise<{ comments: ZernioComment[] }>;
}

export async function zernioReplyToComment(
  postId: string,
  commentId: string,
  message: string,
  accountId: string
) {
  const res = await fetch(`${ZERNIO_BASE}/inbox/comments/${encodeURIComponent(postId)}`, {
    method: "POST",
    headers: zernioHeaders(),
    body: JSON.stringify({ accountId, commentId, message }),
  });
  if (!res.ok) throw new Error(`Zernio replyToComment: ${await res.text()}`);
  return res.json();
}

export async function zernioHideComment(postId: string, commentId: string) {
  const res = await fetch(
    `${ZERNIO_BASE}/inbox/comments/${encodeURIComponent(postId)}/${encodeURIComponent(commentId)}/hide`,
    { method: "POST", headers: zernioHeaders() }
  );
  if (!res.ok) throw new Error(`Zernio hideComment: ${await res.text()}`);
  return res.json();
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

// ── Analytics ─────────────────────────────────────────
export async function zernioGetPostAnalytics(postId: string) {
  const res = await fetch(`${ZERNIO_BASE}/analytics/${encodeURIComponent(postId)}`, {
    headers: zernioHeaders(),
  });
  if (!res.ok) throw new Error(`Zernio getPostAnalytics: ${await res.text()}`);
  return res.json() as Promise<{
    platforms: Record<
      string,
      {
        impressions?: number;
        likes?: number;
        clicks?: number;
        shares?: number;
        comments?: number;
        reach?: number;
      }
    >;
  }>;
}

export async function zernioGetAccountAnalytics(
  accountId: string,
  startDate: string,
  endDate: string
) {
  const res = await fetch(
    `${ZERNIO_BASE}/analytics/account/${encodeURIComponent(accountId)}?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
    { headers: zernioHeaders() }
  );
  if (!res.ok) throw new Error(`Zernio getAccountAnalytics: ${await res.text()}`);
  return res.json();
}

export async function zernioGetPostsAnalytics() {
  const res = await fetch(`${ZERNIO_BASE}/analytics/posts`, {
    headers: zernioHeaders(),
  });
  if (!res.ok) throw new Error(`Zernio getPostsAnalytics: ${await res.text()}`);
  return res.json();
}
