"use server";

import { redirect } from "next/navigation";
import { getOnboardingStatusAction } from "@/app/onboarding/actions";
import { ensureCurrentUserBootstrap } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { paths } from "@/routes";

export type AuthActionState = {
  error?: string;
  success?: string;
};

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "Email o contraseña incorrectos.";
  }
  if (lower.includes("email not confirmed")) {
    return "Confirma tu email antes de iniciar sesión (revisa tu bandeja).";
  }
  if (lower.includes("user already registered")) {
    return "Ya existe una cuenta con este email. Inicia sesión.";
  }
  if (lower.includes("password")) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }
  if (lower.includes("invalid api key")) {
    return "Clave de Supabase inválida. En Vercel revisa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY (o PUBLISHABLE_KEY) del mismo proyecto.";
  }
  return message;
}

async function postAuthRedirect() {
  if (isSupabaseConfigured()) {
    const status = await getOnboardingStatusAction();
    if (!status.completed) {
      redirect(paths.auth.onboarding);
    }
  }
  redirect(paths.platform.dashboard);
}

export async function signInAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Completa email y contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  try {
    await ensureCurrentUserBootstrap();
  } catch (e) {
    return {
      error:
        e instanceof Error ? e.message : "No se pudo inicializar tu perfil.",
    };
  }

  await postAuthRedirect();
  return {};
}

export async function signUpAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();

  if (!email || !password) {
    return { error: "Completa email y contraseña." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: fullName ? { full_name: fullName } : undefined,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${paths.auth.callback}`,
    },
  });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  if (data.user && data.session) {
    try {
      await ensureCurrentUserBootstrap();
    } catch (e) {
      return {
        error:
          e instanceof Error ? e.message : "No se pudo crear tu organización.",
      };
    }
    await postAuthRedirect();
    return {};
  }

  return {
    success:
      "Cuenta creada. Si activaste confirmación por email, revisa tu bandeja y luego inicia sesión.",
  };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(paths.auth.login);
}
