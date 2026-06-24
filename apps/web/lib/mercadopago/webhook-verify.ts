import crypto from "crypto";

function parseSignatureHeader(header: string): { ts?: string; v1?: string } {
  const parts: Record<string, string> = {};
  for (const segment of header.split(",")) {
    const [key, value] = segment.split("=");
    if (key && value) parts[key.trim()] = value.trim();
  }
  return { ts: parts.ts, v1: parts.v1 };
}

export function verifyMercadoPagoWebhookSignature(input: {
  dataId: string;
  xSignature: string | null;
  xRequestId: string | null;
  secret: string;
}): boolean {
  const { dataId, xSignature, xRequestId, secret } = input;
  if (!xSignature || !xRequestId || !dataId) return false;

  const { ts, v1 } = parseSignatureHeader(xSignature);
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  try {
    const a = Buffer.from(v1, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return v1 === expected;
  }
}
