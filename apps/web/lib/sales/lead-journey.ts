import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  resolveContentAssetFromConversation,
  type ResolvedContentAsset,
} from "@/lib/marketing/resolve-content-from-conversation";
import { getZernioClientForOrganization } from "@/lib/zernio/integration";
import type { ZernioPostComment } from "@/lib/zernio/client";

export type LeadJourneyStepType =
  | "content"      // vio contenido (vía UTM)
  | "comment"      // comentó en un reel/post/carrusel
  | "story_reply"  // respondió a una historia
  | "cta"          // respondió a un CTA de ManyChat
  | "dm"           // primer DM
  | "booking"      // agendó llamada
  | "sale";        // cerró la venta

export interface LeadJourneyStep {
  type: LeadJourneyStepType;
  title: string;
  description: string;
  date: string;
  metadata?: Record<string, unknown>;
}

// ─── Tipos de rows ────────────────────────────────────────────────────────────

type UtmLinkRow = {
  youtube_video_title: string | null;
  utm_campaign: string | null;
  utm_source: string | null;
  full_url: string | null;
};

type ConversationRow = {
  id: string;
  lead_name: string;
  source: "manychat" | "instagram" | "manual" | "whatsapp" | null;
  source_video_title: string | null;
  utm_campaign: string | null;
  utm_link_id: string | null;
  external_ref: string | null;
  created_at: string;
  messages: unknown;
  utm_link?: UtmLinkRow | UtmLinkRow[] | null;
};

type StoredMessage = {
  sender?: string;
  content?: string;
  message?: string;
  timestamp?: string;
};

type ClosingCallRow = {
  id: string;
  scheduled_at: string;
  status: string;
  lead_name: string;
};

type ClientRow = {
  id: string;
  name: string;
  created_at: string;
  total_amount: number | null;
};

type ContentPieceRow = {
  id: string;
  platform_post_id: string;
  type: string;
  title: string | null;
  caption: string | null;
  thumbnail_url: string | null;
  platform_post_url: string | null;
  published_at: string | null;
};

type ManyChatEventRow = {
  event_type: string;
  tag: string | null;
  flow_name: string | null;
  triggered_at: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeUtmLink(value: ConversationRow["utm_link"]): UtmLinkRow | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function getMessageText(message: StoredMessage): string {
  return (message.content ?? message.message ?? "").trim();
}

function contentStepTitle(
  asset: ResolvedContentAsset | null,
  fallbackFromYouTube: boolean
): string {
  if (!asset) return fallbackFromYouTube ? "Vio un video de YouTube" : "Vio contenido";
  switch (asset.type) {
    case "reel":     return "Vio un Reel";
    case "story":    return "Vio una Historia";
    case "carousel": return "Vio un carrusel";
    case "webinar":  return "Vio un webinar";
    case "vsl":      return asset.platform === "youtube" ? "Vio un video de YouTube" : "Vio un video";
    case "post":     return "Vio una publicación";
    default:         return "Vio contenido";
  }
}

function contentTypeLabel(type: string): string {
  switch (type) {
    case "reel":     return "Reel";
    case "story":    return "Historia";
    case "carousel": return "Carrusel";
    case "post":     return "Post";
    case "youtube":  return "Video de YouTube";
    default:         return "Publicación";
  }
}

function closingStatusLabel(status: string): string {
  if (status === "closed")     return "completada";
  if (status === "not_closed") return "no cerrada";
  if (status === "no_show")    return "no show";
  return "agendada";
}

/** Decide si un comentario de post pertenece al lead usando el Instagram user ID. */
function postCommentBelongsToLead(
  comment: ZernioPostComment,
  participantId: string | null
): boolean {
  if (!participantId) return false;
  return comment.from?.id === participantId;
}

// ─── Sub-queries ──────────────────────────────────────────────────────────────

async function findClosingCall(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string,
  conversationId: string,
  leadName: string
): Promise<ClosingCallRow | null> {
  const { data: byConversation } = await supabase
    .from("closing_calls")
    .select("id, scheduled_at, status, lead_name")
    .eq("organization_id", organizationId)
    .eq("conversation_id", conversationId)
    .order("scheduled_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (byConversation) return byConversation;
  if (!leadName.trim()) return null;

  const { data: byName } = await supabase
    .from("closing_calls")
    .select("id, scheduled_at, status, lead_name")
    .eq("organization_id", organizationId)
    .ilike("lead_name", `%${leadName.trim()}%`)
    .order("scheduled_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return byName;
}

async function findClient(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string,
  closingCallId: string,
  leadName: string
): Promise<ClientRow | null> {
  const { data: byClosingCall } = await supabase
    .from("clients")
    .select("id, name, created_at, total_amount")
    .eq("organization_id", organizationId)
    .eq("closing_call_id", closingCallId)
    .maybeSingle();

  if (byClosingCall) return byClosingCall;
  if (!leadName.trim()) return null;

  const { data: byName } = await supabase
    .from("clients")
    .select("id, name, created_at, total_amount")
    .eq("organization_id", organizationId)
    .ilike("name", `%${leadName.trim()}%`)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return byName;
}

/**
 * Busca comentarios del lead en los posts/reels de la org usando Zernio.
 * Usa `getPostComments` por pieza de contenido y matchea por `from.id === participantId`
 * (Instagram user ID numérico) — el único identificador confiable disponible en Zernio.
 */
async function fetchZernioCommentSteps(
  organizationId: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
  zernioAccountId: string | null,
  participantId: string | null,
): Promise<LeadJourneyStep[]> {
  // Sin participantId (IG user ID numérico) no hay forma de matchear con certeza
  if (!zernioAccountId || !participantId) return [];

  let zernioClient;
  try {
    zernioClient = await getZernioClientForOrganization(organizationId);
  } catch {
    return [];
  }

  // Obtener piezas de contenido recientes de la org (reels, posts, carruseles, historias)
  const { data: contentPieces } = await supabase
    .from("content_pieces")
    .select("id, platform_post_id, type, title, caption, thumbnail_url, platform_post_url, published_at")
    .eq("organization_id", organizationId)
    .not("platform_post_id", "is", null)
    .order("published_at", { ascending: false })
    .limit(30);

  if (!contentPieces?.length) return [];

  // Para cada pieza, buscar comentarios en paralelo y filtrar por IG user ID del lead
  const results = await Promise.allSettled(
    contentPieces.map(async (piece) => {
      try {
        const res = await zernioClient.getPostComments(
          piece.platform_post_id as string,
          zernioAccountId,
          50
        );
        const allComments = res.comments ?? [];
        const matching = allComments.filter((c) =>
          postCommentBelongsToLead(c, participantId)
        );
        return { piece: piece as ContentPieceRow, comments: matching };
      } catch (err) {
        console.warn("[leadJourney] getPostComments error", {
          postId: piece.platform_post_id,
          error: err instanceof Error ? err.message : err,
        });
        return { piece: piece as ContentPieceRow, comments: [] };
      }
    })
  );

  const steps: LeadJourneyStep[] = [];

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    const { piece, comments } = result.value;
    const typeLabel = contentTypeLabel(piece.type);
    const contentTitle = piece.title ?? piece.caption?.slice(0, 60) ?? null;

    for (const comment of comments) {
      steps.push({
        type: "comment",
        title: `Comentó en un ${typeLabel}`,
        description: comment.message
          ? `"${comment.message.slice(0, 120)}"`
          : contentTitle
            ? `en "${contentTitle}"`
            : `en ${typeLabel.toLowerCase()}`,
        date: comment.createdTime,
        metadata: {
          commentText: comment.message,
          postId: piece.platform_post_id,
          contentPieceId: piece.id,
          contentType: piece.type,
          thumbnailUrl: piece.thumbnail_url ?? undefined,
          platformPostUrl: piece.platform_post_url ?? undefined,
          contentTitle: contentTitle ?? undefined,
        },
      });
    }
  }

  return steps;
}

/**
 * Busca eventos de ManyChat (CTAs, flows) para el lead.
 * Solo disponible si la conversación viene de ManyChat (external_ref = "manychat:SUBSCRIBER_ID").
 */
async function fetchManyChatEventSteps(
  organizationId: string,
  externalRef: string | null
): Promise<LeadJourneyStep[]> {
  if (!externalRef?.startsWith("manychat:")) return [];

  const subscriberId = externalRef.replace(/^manychat:/, "");
  if (!subscriberId) return [];

  const admin = createAdminClient();
  const { data: events } = await admin
    .from("manychat_events")
    .select("event_type, tag, flow_name, triggered_at")
    .eq("organization_id", organizationId)
    .eq("subscriber_id", subscriberId)
    .order("triggered_at", { ascending: true });

  return (events ?? []).map((event: ManyChatEventRow): LeadJourneyStep => {
    const label = event.flow_name ?? event.tag ?? "CTA";
    return {
      type: "cta",
      title:
        event.event_type === "flow_triggered"
          ? `Flow activado: ${label}`
          : `Respondió al CTA: ${label}`,
      description:
        event.event_type === "flow_triggered"
          ? `Se disparó el flow "${label}" en ManyChat`
          : `Activó el tag "${label}" en ManyChat`,
      date: event.triggered_at,
      metadata: {
        eventType: event.event_type,
        tag: event.tag ?? undefined,
        flowName: event.flow_name ?? undefined,
      },
    };
  });
}

// ─── Export principal ─────────────────────────────────────────────────────────

export interface LeadJourneyContext {
  /** accountId de Zernio (cuenta de Instagram conectada) */
  zernioAccountId?: string;
  /** participantId del lead en Zernio (su IG username o user ID) */
  zernioParticipantId?: string;
  /** Nombre del participante en Zernio */
  zernioParticipantName?: string;
}

/**
 * Journey desde el inbox de Zernio: sin conversationId de DB.
 * Busca comentarios + CTAs de ManyChat por nombre, sin steps de UTM/booking/sale.
 * Esos pasos se agregan si se encuentra una conversación DB que matchee el nombre.
 */
export async function getZernioLeadJourney(
  organizationId: string,
  context: Required<LeadJourneyContext>
): Promise<LeadJourneyStep[]> {
  const supabase = await createClient();
  const steps: LeadJourneyStep[] = [];

  // Intentar encontrar la conversación DB por nombre del lead (para steps de UTM/booking/sale)
  const { data: matchedConversation } = await supabase
    .from("conversations")
    .select("id, external_ref, utm_link_id, source_video_title, utm_campaign, messages, lead_name, source, created_at, utm_link:utm_links(youtube_video_title, utm_campaign, utm_source, full_url)")
    .eq("organization_id", organizationId)
    .ilike("lead_name", `%${context.zernioParticipantName.trim()}%`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (matchedConversation) {
    // Delegar al journey completo con el ID encontrado
    return getLeadJourney(organizationId, matchedConversation.id as string, context);
  }

  // Sin conversación DB: solo comentarios Zernio + CTAs ManyChat
  const commentSteps = await fetchZernioCommentSteps(
    organizationId,
    supabase,
    context.zernioAccountId,
    context.zernioParticipantId,
  );
  steps.push(...commentSteps);

  return steps.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export async function getLeadJourney(
  organizationId: string,
  conversationId: string,
  context?: LeadJourneyContext
): Promise<LeadJourneyStep[]> {
  const supabase = await createClient();
  const steps: LeadJourneyStep[] = [];

  const { data: conversation } = await supabase
    .from("conversations")
    .select(
      `
      id,
      lead_name,
      source,
      source_video_title,
      utm_campaign,
      utm_link_id,
      external_ref,
      created_at,
      messages,
      utm_link:utm_links(
        youtube_video_title,
        utm_campaign,
        utm_source,
        full_url
      )
    `
    )
    .eq("id", conversationId)
    .eq("organization_id", organizationId)
    .single();

  if (!conversation) return [];

  const row = conversation as ConversationRow;
  const utmLink = normalizeUtmLink(row.utm_link);
  const videoTitle = utmLink?.youtube_video_title ?? row.source_video_title ?? null;

  // ── 1. Contenido que lo trajo (UTM) ──────────────────────────────────────
  if (videoTitle) {
    const asset = await resolveContentAssetFromConversation(supabase, organizationId, {
      utm_link_id: row.utm_link_id,
      source_video_title: row.source_video_title,
    });
    steps.push({
      type: "content",
      title: contentStepTitle(asset, !!utmLink?.youtube_video_title),
      description: videoTitle,
      date: row.created_at,
      metadata: {
        campaign: utmLink?.utm_campaign ?? row.utm_campaign ?? undefined,
        url: utmLink?.full_url ?? undefined,
      },
    });
  }

  // ── 2. Comentarios en posts/reels/carruseles (Zernio live) ───────────────
  const commentSteps = await fetchZernioCommentSteps(
    organizationId,
    supabase,
    context?.zernioAccountId ?? null,
    context?.zernioParticipantId ?? null,
  );
  steps.push(...commentSteps);

  // ── 3. CTAs y flows de ManyChat ──────────────────────────────────────────
  const ctaSteps = await fetchManyChatEventSteps(organizationId, row.external_ref);
  steps.push(...ctaSteps);

  // ── 4. Primer DM ─────────────────────────────────────────────────────────
  const messages = (row.messages ?? []) as StoredMessage[];
  const firstLeadMessage = messages.find((m) => m.sender === "lead");

  if (firstLeadMessage) {
    const text = getMessageText(firstLeadMessage);
    steps.push({
      type: "dm",
      title:
        row.source === "instagram"
          ? "Mandó un DM por Instagram"
          : row.source === "whatsapp"
            ? "Mandó un mensaje por WhatsApp"
            : "Inició conversación por ManyChat",
      description: text ? text.slice(0, 100) : "Inició conversación",
      date: firstLeadMessage.timestamp ?? row.created_at,
      metadata: {
        source: row.source ?? "manychat",
        messageCount: messages.length,
      },
    });
  }

  // ── 5. Llamada agendada ──────────────────────────────────────────────────
  const closingCall = await findClosingCall(supabase, organizationId, conversationId, row.lead_name);

  if (closingCall) {
    steps.push({
      type: "booking",
      title: "Agendó una llamada",
      description: `Llamada ${closingStatusLabel(closingCall.status)} para ${new Date(
        closingCall.scheduled_at
      ).toLocaleDateString("es-AR")}`,
      date: closingCall.scheduled_at,
      metadata: {
        closingCallId: closingCall.id,
        status: closingCall.status,
      },
    });

    // ── 6. Venta cerrada ─────────────────────────────────────────────────
    const client = await findClient(supabase, organizationId, closingCall.id, row.lead_name);

    if (client) {
      steps.push({
        type: "sale",
        title: "¡Cerró la venta!",
        description: client.total_amount
          ? `USD ${Number(client.total_amount).toLocaleString("es-AR")}`
          : "Cliente creado",
        date: client.created_at,
        metadata: {
          clientId: client.id,
          amount: client.total_amount,
        },
      });
    }
  } else if (row.utm_link_id) {
    const { data: bookingAttribution } = await supabase
      .from("utm_booking_attributions")
      .select("booked_at")
      .eq("utm_link_id", row.utm_link_id)
      .eq("organization_id", organizationId)
      .order("booked_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (bookingAttribution?.booked_at) {
      steps.push({
        type: "booking",
        title: "Agendó una llamada",
        description: "Booking atribuido via UTM",
        date: bookingAttribution.booked_at,
      });
    }
  }

  return steps.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}
