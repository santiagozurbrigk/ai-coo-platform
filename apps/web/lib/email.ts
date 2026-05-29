import { Resend } from "resend";
import {
  friendlyResendApiError,
  validateResendFromAddress,
} from "@/lib/email/resend-from";
import {
  welcomeEmailPlainText,
  welcomeEmailTemplate,
} from "@/lib/email/welcome-email";

export type WelcomeEmailParams = {
  to: string;
  name: string;
  email: string;
  password: string;
};

function getResend() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

export function isResendConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim()
  );
}

export async function sendWelcomeEmail(
  params: WelcomeEmailParams
): Promise<{ ok: boolean; error?: string }> {
  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!resend || !from) {
    return {
      ok: false,
      error:
        "Resend no configurado. Define RESEND_API_KEY y RESEND_FROM_EMAIL en el servidor.",
    };
  }

  const fromError = validateResendFromAddress(from);
  if (fromError) {
    return { ok: false, error: fromError };
  }

  try {
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: "Tu acceso a Optimiza Tu Control está listo",
      html: welcomeEmailTemplate(params),
      text: welcomeEmailPlainText(params),
    });

    if (error) {
      return { ok: false, error: friendlyResendApiError(error.message) };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al enviar email",
    };
  }
}
