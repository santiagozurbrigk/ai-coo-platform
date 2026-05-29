/** Valida el remitente antes de llamar a la API de Resend. */

export function validateResendFromAddress(from: string): string | null {
  const trimmed = from.trim();
  if (!trimmed.includes("@")) {
    return "RESEND_FROM_EMAIL debe ser una dirección válida (ej. no-reply@tudominio.com).";
  }

  const domain = trimmed.split("@")[1]?.toLowerCase() ?? "";
  if (domain.endsWith(".vercel.app") || domain === "vercel.app") {
    return (
      "RESEND_FROM_EMAIL no puede usar un dominio @vercel.app. " +
      "Verificá tu dominio en Resend (resend.com/domains) y usá ej. no-reply@tudominio.com. " +
      "Para pruebas podés usar onboarding@resend.dev."
    );
  }

  return null;
}

export function friendlyResendApiError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("domain") && lower.includes("verif")) {
    return (
      "Dominio del remitente no verificado en Resend. " +
      "Verificá el dominio en resend.com/domains y actualizá RESEND_FROM_EMAIL en Vercel."
    );
  }
  return message;
}
