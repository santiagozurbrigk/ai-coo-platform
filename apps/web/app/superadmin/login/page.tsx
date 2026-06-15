import { LoginScreen } from "@/components/auth/login-screen";
import { SuperAdminLoginForm } from "@/components/auth/super-admin-login-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function SuperAdminLoginPage() {
  if (!isSupabaseConfigured()) {
    return <LoginScreen variant="superAdmin" />;
  }

  return <SuperAdminLoginForm />;
}
