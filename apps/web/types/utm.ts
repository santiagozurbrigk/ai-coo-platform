export type UTMLinkType = "landing" | "manychat" | "both";

export type UTMLinkRow = {
  id: string;
  organization_id: string;
  youtube_video_id: string | null;
  youtube_video_title: string | null;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string | null;
  full_url: string;
  manychat_page_id: string | null;
  manychat_ref: string | null;
  manychat_url: string | null;
  instagram_username: string | null;
  link_type: UTMLinkType;
  clicks: number;
  leads_captured: number;
  bookings_attributed: number;
  sales_attributed: number;
  revenue_attributed: number;
  created_at: string;
  updated_at: string;
};

export type UTMLeadCaptureRow = {
  id: string;
  organization_id: string;
  utm_link_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  lead_email: string | null;
  lead_identifier: string | null;
  captured_at: string;
  converted_to_conversation: boolean;
  converted_to_booking: boolean;
  converted_to_sale: boolean;
};

export const UTM_CONTENT_OPTIONS = [
  { value: "descripcion", label: "Descripción del video" },
  { value: "primer-comentario", label: "Primer comentario" },
  { value: "bio", label: "Bio del canal" },
  { value: "stories", label: "Stories / Shorts" },
] as const;

export type UTMContentValue = (typeof UTM_CONTENT_OPTIONS)[number]["value"];
