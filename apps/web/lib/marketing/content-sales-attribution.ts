import type { SupabaseClient } from "@supabase/supabase-js";
import { getZernioClientForOrganization, getZernioIntegrationForOrg } from "@/lib/zernio/integration";
import type { ContentSalesAttributed } from "@/types/content";

const ATTRIBUTION_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

type ContentPieceRow = {
  id: string;
  platform_post_id: string | null;
  published_at: string | null;
};

type ConversationRow = {
  id: string;
  created_at: string;
  external_ref: string | null;
};

type ClosingCallRow = {
  id: string;
  conversation_id: string | null;
  status: string;
};

type ClientRow = {
  closing_call_id: string | null;
  total_amount: number | null;
};

function emptyAttribution(): ContentSalesAttributed {
  return {
    lead_count: 0,
    scheduled_count: 0,
    closed_count: 0,
    total_revenue: 0,
    last_attributed_at: new Date().toISOString(),
  };
}

function attributeByPublishedWindow(
  eventAt: Date,
  pieces: ContentPieceRow[]
): string | null {
  const eventTime = eventAt.getTime();
  let best: { id: string; publishedAt: number } | null = null;

  for (const piece of pieces) {
    if (!piece.published_at) continue;
    const publishedAt = new Date(piece.published_at).getTime();
    if (Number.isNaN(publishedAt)) continue;
    if (publishedAt > eventTime) continue;
    if (eventTime - publishedAt > ATTRIBUTION_WINDOW_MS) continue;

    if (!best || publishedAt > best.publishedAt) {
      best = { id: piece.id, publishedAt };
    }
  }

  return best?.id ?? null;
}

function incrementAttribution(
  map: Map<string, ContentSalesAttributed>,
  pieceId: string,
  patch: Partial<ContentSalesAttributed>
) {
  const current = map.get(pieceId) ?? emptyAttribution();
  map.set(pieceId, {
    lead_count: current.lead_count + (patch.lead_count ?? 0),
    scheduled_count: current.scheduled_count + (patch.scheduled_count ?? 0),
    closed_count: current.closed_count + (patch.closed_count ?? 0),
    total_revenue: current.total_revenue + (patch.total_revenue ?? 0),
    last_attributed_at: patch.last_attributed_at ?? current.last_attributed_at,
  });
}

export async function computeSalesAttributionForOrg(
  supabase: SupabaseClient,
  organizationId: string
): Promise<Map<string, ContentSalesAttributed>> {
  const attribution = new Map<string, ContentSalesAttributed>();

  const { data: pieces, error: piecesError } = await supabase
    .from("content_pieces")
    .select("id, platform_post_id, published_at")
    .eq("organization_id", organizationId)
    .eq("source", "zernio")
    .is("variants_of", null);

  if (piecesError) throw new Error(piecesError.message);

  const contentPieces = (pieces ?? []) as ContentPieceRow[];
  if (contentPieces.length === 0) return attribution;

  const pieceIdsByPlatformPostId = new Map<string, string>();
  for (const piece of contentPieces) {
    if (piece.platform_post_id) {
      pieceIdsByPlatformPostId.set(piece.platform_post_id, piece.id);
    }
  }

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, created_at, external_ref")
    .eq("organization_id", organizationId);

  const conversationRows = (conversations ?? []) as ConversationRow[];
  const conversationIds = new Set(conversationRows.map((row) => row.id));

  for (const conversation of conversationRows) {
    const eventAt = new Date(conversation.created_at);
    const pieceId = attributeByPublishedWindow(eventAt, contentPieces);
    if (!pieceId) continue;
    incrementAttribution(attribution, pieceId, {
      lead_count: 1,
      last_attributed_at: eventAt.toISOString(),
    });
  }

  const integration = await getZernioIntegrationForOrg(organizationId);
  if (integration?.connected_accounts.length) {
    try {
      const client = await getZernioClientForOrganization(organizationId);
      const commentAuthorsByPost = new Map<string, Set<string>>();

      for (const account of integration.connected_accounts) {
        const { comments } = await client.listComments(account.accountId);
        for (const comment of comments) {
          const pieceId = pieceIdsByPlatformPostId.get(comment.postId);
          if (!pieceId) continue;

          const authorKey =
            comment.author?.username ??
            comment.author?.name ??
            comment._id;
          const authors = commentAuthorsByPost.get(pieceId) ?? new Set<string>();
          authors.add(authorKey);
          commentAuthorsByPost.set(pieceId, authors);

          incrementAttribution(attribution, pieceId, {
            last_attributed_at: comment.createdAt,
          });
        }
      }

      for (const [pieceId, authors] of commentAuthorsByPost) {
        incrementAttribution(attribution, pieceId, {
          lead_count: authors.size,
        });
      }

      for (const account of integration.connected_accounts) {
        const result = await client.listConversations(account.accountId);
        for (const conversation of result.data) {
          if (conversationIds.has(conversation.id)) continue;

          const eventAt = new Date(conversation.updatedTime);
          const pieceId = attributeByPublishedWindow(eventAt, contentPieces);
          if (!pieceId) continue;

          incrementAttribution(attribution, pieceId, {
            lead_count: 1,
            last_attributed_at: eventAt.toISOString(),
          });
        }
      }
    } catch {
      // Zernio opcional — continuar con conversaciones locales
    }
  }

  const { data: closingCalls } = await supabase
    .from("closing_calls")
    .select("id, conversation_id, status")
    .eq("organization_id", organizationId);

  const closingRows = (closingCalls ?? []) as ClosingCallRow[];
  const conversationToPiece = new Map<string, string>();

  for (const conversation of conversationRows) {
    const pieceId = attributeByPublishedWindow(
      new Date(conversation.created_at),
      contentPieces
    );
    if (pieceId) {
      conversationToPiece.set(conversation.id, pieceId);
    }
  }

  for (const call of closingRows) {
    if (!call.conversation_id) continue;
    const pieceId = conversationToPiece.get(call.conversation_id);
    if (!pieceId) continue;

    // Una cancelada tampoco llegó a venta: cuenta como agendada sin desenlace,
    // igual que una `scheduled` o un `no_show`.
    if (
      call.status === "scheduled" ||
      call.status === "no_show" ||
      call.status === "cancelled"
    ) {
      incrementAttribution(attribution, pieceId, { scheduled_count: 1 });
    }
  }

  const { data: clients } = await supabase
    .from("clients")
    .select("closing_call_id, total_amount")
    .eq("organization_id", organizationId)
    .not("closing_call_id", "is", null);

  const closingById = new Map(closingRows.map((row) => [row.id, row]));

  for (const client of (clients ?? []) as ClientRow[]) {
    if (!client.closing_call_id) continue;
    const call = closingById.get(client.closing_call_id);
    if (!call?.conversation_id) continue;

    const pieceId = conversationToPiece.get(call.conversation_id);
    if (!pieceId) continue;

    incrementAttribution(attribution, pieceId, {
      closed_count: 1,
      total_revenue: Number(client.total_amount ?? 0),
    });
  }

  return attribution;
}
