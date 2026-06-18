export const TEMP_PASSWORD_TTL_MS = 24 * 60 * 60 * 1000;

export const TEMP_PASSWORD_EXPIRED_MESSAGE =
  "Tu contraseña temporal expiró. Pedile a quien te creó la cuenta que te genere una nueva.";

export const TEMP_PASSWORD_EXPIRED_QUERY = "temp_password_expired";

export function getTempPasswordExpiresAt(from = Date.now()): string {
  return new Date(from + TEMP_PASSWORD_TTL_MS).toISOString();
}

export function tempPasswordProfileFields() {
  return {
    must_change_password: true as const,
    temp_password_expires_at: getTempPasswordExpiresAt(),
  };
}

export function isTempPasswordExpired(
  mustChangePassword: boolean | null | undefined,
  expiresAt: string | null | undefined
): boolean {
  if (!mustChangePassword || !expiresAt) return false;
  return new Date(expiresAt) < new Date();
}
