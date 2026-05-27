"use client";

import { LoginScreen } from "@/components/auth/login-screen";
import { paths } from "@/routes";

/** Fallback Fase 0 si no hay variables Supabase. */
export function MockLoginPage() {
  return (
    <LoginScreen
      variant="client"
      redirectTo={paths.platform.dashboard}
      showForgotPassword
    />
  );
}
