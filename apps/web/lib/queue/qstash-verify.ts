import { Receiver } from "@upstash/qstash";

export function areQStashSigningKeysConfigured(): boolean {
  return Boolean(
    process.env.QSTASH_CURRENT_SIGNING_KEY?.trim() &&
      process.env.QSTASH_NEXT_SIGNING_KEY?.trim()
  );
}

export async function verifyQStashRequest(
  request: Request,
  rawBody: string
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  if (!areQStashSigningKeysConfigured()) {
    return {
      ok: false,
      status: 503,
      error: "QStash signing keys not configured",
    };
  }

  const signature =
    request.headers.get("upstash-signature") ??
    request.headers.get("Upstash-Signature");

  if (!signature) {
    return { ok: false, status: 401, error: "Missing Upstash-Signature header" };
  }

  const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!.trim(),
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!.trim(),
  });

  try {
    const valid = await receiver.verify({
      signature,
      body: rawBody,
    });

    if (!valid) {
      return { ok: false, status: 401, error: "Invalid QStash signature" };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Queue] QStash signature verification error", { message });
    return { ok: false, status: 401, error: "Signature verification failed" };
  }
}
