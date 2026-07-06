import { createClient } from "@/lib/supabase/server";
import type { ContentType } from "@/types/marketing-insights";
import { resolveContentAssetFromConversation } from "@/lib/marketing/resolve-content-from-conversation";

export type LeadJourneyStepType = "content" | "dm" | "booking" | "sale";

export interface LeadJourneyStep {
  type: LeadJourneyStepType;
  title: string;
  description: string;
  date: string;
  metadata?: Record<string, unknown>;
}

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

function normalizeUtmLink(
  value: ConversationRow["utm_link"]
): UtmLinkRow | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function getMessageText(message: StoredMessage): string {
  return (message.content ?? message.message ?? "").trim();
}

function contentStepTitle(contentType: ContentType | null): string {
  switch (contentType) {
    case "reel":     return "Vio un Reel";
    case "story":    return "Vio una Historia";
    case "carousel": return "Vio un carrusel";
    case "webinar":  return "Vio un webinar";
    case "vsl":      return "Vio un video de YouTube";
    case "post":     return "Vio una publicación";
    default:         return "Vio contenido";
  }
}

function closingStatusLabel(status: string): string {
  if (status === "closed") return "completada";
  if (status === "not_closed") return "no cerrada";
  if (status === "no_show") return "no show";
  return "agendada";
}

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

export async function getLeadJourney(
  organizationId: string,
  conversationId: string
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
  const videoTitle =
    utmLink?.youtube_video_title ?? row.source_video_title ?? null;

  if (videoTitle) {
    const asset = await resolveContentAssetFromConversation(supabase, organizationId, {
      utm_link_id: row.utm_link_id,
      source_video_title: row.source_video_title,
    });
    steps.push({
      type: "content",
      title: contentStepTitle(asset?.type ?? null),
      description: videoTitle,
      date: row.created_at,
      metadata: {
        campaign: utmLink?.utm_campaign ?? row.utm_campaign ?? undefined,
        url: utmLink?.full_url ?? undefined,
      },
    });
  }

  const messages = (row.messages ?? []) as StoredMessage[];
  const firstLeadMessage = messages.find((message) => message.sender === "lead");

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

  const closingCall = await findClosingCall(
    supabase,
    organizationId,
    conversationId,
    row.lead_name
  );

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

    const client = await findClient(
      supabase,
      organizationId,
      closingCall.id,
      row.lead_name
    );

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
