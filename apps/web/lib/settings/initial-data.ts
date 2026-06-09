import { getProfileAreaDataAction } from "@/app/profile/actions";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type SettingsInitialData = {
  orgName: string;
  industry: string;
  displayName: string;
  email: string;
  lastSignInAt: string | null;
};

const DEFAULTS: SettingsInitialData = {
  orgName: "Acme Coaching Co.",
  industry: "Infoproducto / Coaching",
  displayName: "Nombre Fundador",
  email: "founder@acme.co",
  lastSignInAt: null,
};

export async function getSettingsInitialData(): Promise<SettingsInitialData> {
  const data = { ...DEFAULTS };

  const profile = await getProfileAreaDataAction();
  if (profile) {
    data.orgName = profile.orgName;
    data.displayName = profile.userName;
  }

  if (isSupabaseConfigured()) {
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
