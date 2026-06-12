import { Resend } from "resend";
import {
  friendlyResendApiError,
  validateResendFromAddress,
} from "@/lib/email/resend-from";

function getResend() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

export async function sendWaitlistConfirmationEmail(
  to: string
): Promise<void> {
  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!resend || !from) return;

  const fromError = validateResendFromAddress(from);
  if (fromError) return;

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject: "Estás en la lista — Optimiza Tu Control",
      html: `
        <p>Hola,</p>
        <p>Gracias por unirte a la waitlist de <strong>Optimiza Tu Control</strong>.</p>
        <p>Te avisamos cuando abramos los 20 cupos del primer lanzamiento.</p>
        <p>— El equipo de Optimiza Tu Control</p>
      `,
      text: `Gracias por unirte a la waitlist de Optimiza Tu Control. Te avisamos cuando abramos los 20 cupos del primer lanzamiento.`,
    });
    if (error) {
      console.error("[waitlist] resend:", friendlyResendApiError(error.message));
    }
  } catch (e) {
    console.error("[waitlist] resend:", e);
  }
}
