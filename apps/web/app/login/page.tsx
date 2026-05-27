import { Suspense } from "react";
import { SupabaseLoginForm } from "@/components/auth/supabase-login-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { MockLoginPage } from "./mock-login-page";

export default function ClientLoginPage() {
  if (!isSupabaseConfigured()) {
    return <MockLoginPage />;
  }
  return (
    <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Cargando…</p>}>
      <SupabaseLoginForm />
    </Suspense>
  );
}
