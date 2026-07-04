import { createAdminClient } from "@/lib/supabase/admin";
import { incrementContentAssetFromUtm } from "@/lib/marketing/content-attribution";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type LeadCaptureMatch = {
  id: string;
  utm_link_id: string;
  utm_campaign: string | null;
};

async function findUnconvertedLeadCapture(
  organizationId: string,
  leadEmail?: string,
  leadName?: string
): Promise<LeadCaptureMatch | null> {
  const supabase = createAdminClient();

  if (leadEmail?.trim()) {
    const email = leadEmail.trim().toLowerCase();
    const { data } = await supabase
      .from("utm_lead_captures")
      .select("id, utm_link_id, utm_campaign")
      .eq("organization_id", organizationId)
      .eq("converted_to_booking", false)
      .not("utm_link_id", "is", null)
      .or(`lead_email.eq.${email},lead_identifier.eq.${email}`)
      .order("captured_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data?.utm_link_id) return data as LeadCaptureMatch;
  }

  if (leadName?.trim()) {
    const { data } = await supabase
      .from("utm_lead_captures")
      .select("id, utm_link_id, utm_campaign")
      .eq("organization_id", organizationId)
      .eq("converted_to_booking", false)
      .not("utm_link_id", "is", null)
      .ilike("lead_identifier", `%${leadName.trim()}%`)
      .order("captured_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data?.utm_link_id) return data as LeadCaptureMatch;
  }

  return null;
}

async function findLeadCaptureForSale(
  organizationId: string,
  leadName: string
): Promise<LeadCaptureMatch | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("utm_lead_captures")
    .select("id, utm_link_id, utm_campaign")
    .eq("organization_id", organizationId)
    .eq("converted_to_sale", false)
    .not("utm_link_id", "is", null)
    .ilike("lead_identifier", `%${leadName.trim()}%`)
    .order("captured_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (data?.utm_link_id) return data as LeadCaptureMatch;
  return null;
}

/**
 * Atribuye un booking a un UTM buscando por email o nombre del lead.
 * Se llama cuando Calendly registra un nuevo booking.
 */
export async function attributeBookingToUTM({
  organizationId,
  closingCallId,
  leadName,
  leadEmail,
}: {
  organizationId: string;
  closingCallId: string;
  leadName?: string;
  leadEmail?: string;
}): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  if (!leadEmail?.trim() && !leadName?.trim()) return null;

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("utm_booking_attributions")
    .select("utm_link_id")
    .eq("closing_call_id", closingCallId)
    .maybeSingle();

  if (existing?.utm_link_id) return existing.utm_link_id;

  const capture = await findUnconvertedLeadCapture(
    organizationId,
    leadEmail,
    leadName
  );

  if (!capture?.utm_link_id) return null;

  const { error: insertError } = await supabase
    .from("utm_booking_attributions")
    .insert({
      organization_id: organizationId,
      utm_link_id: capture.utm_link_id,
      utm_lead_capture_id: capture.id,
      closing_call_id: closingCallId,
      lead_name: leadName ?? null,
      lead_email: leadEmail ?? null,
    });

  if (insertError) {
    if (insertError.code === "23505") return capture.utm_link_id;
    console.error("[UTM Attribution] booking insert:", insertError.message);
    return null;
  }

  await supabase
    .from("utm_lead_captures")
    .update({ converted_to_booking: true })
    .eq("id", capture.id);

  const { error: rpcError } = await supabase.rpc("increment_utm_bookings", {
    utm_id: capture.utm_link_id,
  });
  if (rpcError) {
    console.error("[UTM Attribution] increment bookings:", rpcError.message);
  }

  console.log(
    `[UTM Attribution] Booking atribuido al UTM ${capture.utm_campaign ?? capture.utm_link_id}`
  );

  await incrementContentAssetFromUtm(
    organizationId,
    capture.utm_link_id,
    "bookings_influenced"
  ).catch((err) => {
    console.error("[UTM Attribution] content asset booking:", err);
  });

  return capture.utm_link_id;
}

/**
 * Atribuye una venta a un UTM.
 * Se llama cuando se crea un cliente desde un closing call.
 */
export async function attributeSaleToUTM({
  organizationId,
  clientId,
  closingCallId,
  revenue,
}: {
  organizationId: string;
  clientId: string;
  closingCallId?: string;
  revenue?: number;
}): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = createAdminClient();
  const revenueAmount = revenue ?? 0;

  const { data: existingSale } = await supabase
    .from("utm_sale_attributions")
    .select("id")
    .eq("client_id", clientId)
    .maybeSingle();

  if (existingSale) return;

  let utmLinkId: string | null = null;
  let bookingAttributionId: string | null = null;
  let leadCaptureId: string | null = null;

  if (closingCallId) {
    const { data: bookingAttribution } = await supabase
      .from("utm_booking_attributions")
      .select("id, utm_link_id, utm_lead_capture_id")
      .eq("organization_id", organizationId)
      .eq("closing_call_id", closingCallId)
      .maybeSingle();

    if (bookingAttribution?.utm_link_id) {
      utmLinkId = bookingAttribution.utm_link_id;
      bookingAttributionId = bookingAttribution.id;
      leadCaptureId = bookingAttribution.utm_lead_capture_id;
    }
  }

  if (!utmLinkId) {
    const { data: client } = await supabase
      .from("clients")
      .select("name")
      .eq("id", clientId)
      .maybeSingle();

    let leadName = client?.name?.trim();

    if (!leadName && closingCallId) {
      const { data: call } = await supabase
        .from("closing_calls")
        .select("lead_name")
        .eq("id", closingCallId)
        .maybeSingle();
      leadName = call?.lead_name?.trim();
    }

    if (leadName) {
      const capture = await findLeadCaptureForSale(organizationId, leadName);
      if (capture) {
        utmLinkId = capture.utm_link_id;
        leadCaptureId = capture.id;
      }
    }
  }

  if (!utmLinkId) return;

  const { error: insertError } = await supabase
    .from("utm_sale_attributions")
    .insert({
      organization_id: organizationId,
      utm_link_id: utmLinkId,
      utm_booking_attribution_id: bookingAttributionId,
      client_id: clientId,
      revenue: revenueAmount,
    });

  if (insertError) {
    if (insertError.code === "23505") return;
    console.error("[UTM Attribution] sale insert:", insertError.message);
    return;
  }

  if (leadCaptureId) {
    await supabase
      .from("utm_lead_captures")
      .update({ converted_to_sale: true })
      .eq("id", leadCaptureId);
  }

  const { error: rpcError } = await supabase.rpc("increment_utm_sales", {
    utm_id: utmLinkId,
    revenue_amount: revenueAmount,
  });
  if (rpcError) {
    console.error("[UTM Attribution] increment sales:", rpcError.message);
  }

  console.log(
    `[UTM Attribution] Venta de $${revenueAmount} atribuida al UTM ${utmLinkId}`
  );

  await incrementContentAssetFromUtm(
    organizationId,
    utmLinkId,
    "sales_influenced"
  ).catch((err) => {
    console.error("[UTM Attribution] content asset sale count:", err);
  });

  if (revenueAmount > 0) {
    await incrementContentAssetFromUtm(
      organizationId,
      utmLinkId,
      "revenue_influenced",
      revenueAmount
    ).catch((err) => {
      console.error("[UTM Attribution] content asset revenue:", err);
    });
  }
}
