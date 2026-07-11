import {
  getAiCredentialStatusAction,
  getNotificationPreferencesAction,
  getOrganizationSettingsAction,
  type AiCredentialStatus,
  type NotificationPreferences,
} from "@/app/settings/actions";
import { getProfileAreaDataAction } from "@/app/profile/actions";
import { getCurrentProfile } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type SettingsInitialData = {
  orgName: string;
  industry: string;
  websiteUrl: string;
  timezone: string;
  currency: string;
  language: string;
  country: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  lastSignInAt: string | null;
  claudeCredentials: AiCredentialStatus;
  notificationPreferences: NotificationPreferences;
  isFounder: boolean;
};

const DEFAULTS: SettingsInitialData = {
  orgName: "Acme Coaching Co.",
  industry: "Infoproducto / Coaching",
  websiteUrl: "",
  timezone: "America/Argentina/Buenos_Aires",
  currency: "USD",
  language: "es",
  country: "",
  displayName: "Nombre Fundador",
  email: "founder@acme.co",
  avatarUrl: null,
  lastSignInAt: null,
  claudeCredentials: {
    mode: "api_key_active",
    oauth: {
      connected: false,
      connectAvailable: false,
      failedAt: null,
      lastProbeAt: null,
      lastSuccessAt: null,
    },
    apiKey: {
      hasKey: false,
      status: "none",
      lastValidated: null,
      keyPreview: null,
    },
  },
  notificationPreferences: {
    emailWeeklyReport: true,
    emailNewConversation: false,
    emailBookingConfirmed: true,
    emailSaleClosed: true,
    emailSopSuggestion: true,
    inappNewConversation: true,
    inappBookingConfirmed: true,
    inappSaleClosed: true,
    inappGhostingAlert: true,
  },
  isFounder: true,
};

export async function getSettingsInitialData(): Promise<SettingsInitialData> {
  const data = { ...DEFAULTS };

  const profile = await getProfileAreaDataAction();
  if (profile) {
    data.orgName = profile.orgName;
    data.displayName = profile.userName;
    data.avatarUrl = profile.avatarUrl;
  }

  try {
    const orgSettings = await getOrganizationSettingsAction();
    if (orgSettings) {
      data.orgName = orgSettings.name || data.orgName;
      data.industry = orgSettings.industry ?? "";
      data.websiteUrl = orgSettings.website_url ?? "";
      data.timezone =
        orgSettings.timezone ?? DEFAULTS.timezone;
      data.currency = orgSettings.currency ?? DEFAULTS.currency;
      data.language = orgSettings.language ?? DEFAULTS.language;
      data.country = orgSettings.country ?? "";
    }
  } catch {
    // Sin sesión o tablas pendientes — mantener defaults
  }

  try {
    data.claudeCredentials = await getAiCredentialStatusAction();
  } catch {
    // Mantener default
  }

  try {
    data.notificationPreferences = await getNotificationPreferencesAction();
  } catch {
    // Mantener default
  }

  if (isSupabaseConfigured()) {
    const profile = await getCurrentProfile();
    data.isFounder = profile?.role === "founder";

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email) {
      data.email = user.email;
    }
    if (user?.last_sign_in_at) {
      data.lastSignInAt = user.last_sign_in_at;
    }
  }

  return data;
}
