import crypto from "crypto";
import { getInstagramOAuthConfig } from "@/lib/instagram/config";

/** Valida X-Hub-Signature-256 de Meta (formato `sha256=<hex>`). */
export function verifyInstagramWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const { appSecret } = getInstagramOAuthConfig();
  if (!appSecret || !signatureHeader) return false;

  const expected = `sha256=${crypto
    .createHmac("sha256", appSecret)
    .update(rawBody, "utf8")
    .digest("hex")}`;

  try {
    const a = Buffer.from(signatureHeader);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
