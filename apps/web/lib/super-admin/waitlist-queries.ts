import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { WaitlistLead } from "@/types/waitlist";

type WaitlistLeadRow = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  instagram: string | null;
  monthly_revenue: string | null;
  team_size: string | null;
  operational_pain: string | null;
  why_now: string | null;
  source: string;
  calendly_event_url: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  created_at: string;
};

const LEAD_SELECT =
  "id, email, first_name, last_name, phone, instagram, monthly_revenue, team_size, operational_pain, why_now, source, calendly_event_url, utm_source, utm_medium, utm_campaign, utm_content, created_at";

function rowToWaitlistLead(row: WaitlistLeadRow): WaitlistLead {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    instagram: row.instagram,
    monthlyRevenue: row.monthly_revenue,
    teamSize: row.team_size,
    operationalPain: row.operational_pain,
    whyNow: row.why_now,
    source: row.source,
    calendlyEventUrl: row.calendly_event_url,
    utmSource: row.utm_source,
    utmMedium: row.utm_medium,
    utmCampaign: row.utm_campaign,
    utmContent: row.utm_content,
    createdAt: row.created_at,
  };
}

export async function loadWaitlistLeads(): Promise<WaitlistLead[]> {
  await requireSuperAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("waitlist_leads")
    .select(LEAD_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => rowToWaitlistLead(row as WaitlistLeadRow));
}

export async function loadTrialLeads(): Promise<WaitlistLead[]> {
  await requireSuperAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("waitlist_leads")
    .select(LEAD_SELECT)
    .eq("source", "trial")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => rowToWaitlistLead(row as WaitlistLeadRow));
}
