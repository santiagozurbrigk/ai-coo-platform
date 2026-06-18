import crypto from "crypto";

const CHARS =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

export function generateTempPassword(): string {
  const bytes = crypto.randomBytes(12);
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += CHARS[bytes[i] % CHARS.length];
  }
  return password;
}
