import { Resend } from "resend";
import {
  friendlyResendApiError,
  validateResendFromAddress,
} from "@/lib/email/resend-from";
import {
  welcomeEmailPlainText,
  welcomeEmailTemplate,
} from "@/lib/email/welcome-email";
import {
  trialReelsDoneEmailTemplate,
  trialReelsDoneEmailText,
  type TrialReelsDoneEmailParams,
} from "@/lib/email/trial-reels-email";

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

/**
 * Notificación cuando todos los Trial Reels terminaron de publicarse.
 * Solo envía si Resend está configurado — nunca lanza, retorna { ok, error }.
 */
export async function sendTrialReelsDoneEmail(
  params: TrialReelsDoneEmailParams
): Promise<{ ok: boolean; error?: string }> {
  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!resend || !from) {
    return { ok: false, error: "Resend no configurado" };
  }

  const fromError = validateResendFromAddress(from);
  if (fromError) return { ok: false, error: fromError };

  const { published, failed } = params;
  const subject =
    failed === 0
      ? `${published} Trial Reel${published === 1 ? "" : "s"} publicado${published === 1 ? "" : "s"} en Zernio`
      : `Trial Reels: ${published} publicado${published === 1 ? "" : "s"}, ${failed} con error`;

  try {
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject,
      html: trialReelsDoneEmailTemplate(params),
      text: trialReelsDoneEmailText(params),
    });
    if (error) return { ok: false, error: friendlyResendApiError(error.message) };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al enviar email" };
  }
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
