"use client";

import { LoginScreen } from "@/components/auth/login-screen";
import { paths } from "@/routes";

export default function ClientLoginPage() {
  return (
    <LoginScreen
      variant="client"
      redirectTo={paths.platform.dashboard}
      showForgotPassword
    />
  );
}
