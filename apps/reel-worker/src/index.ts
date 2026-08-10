/**
 * Servidor HTTP del worker de variaciones de reels.
 *
 * Recibe jobs de QStash (webhook POST) y los procesa con FFmpeg.
 * Se despliega en Fly.io como un servicio persistente.
 *
 * Endpoints:
 *   GET  /health        → 200 OK (health check de Fly.io)
 *   POST /              → Recibe y procesa un job (validado con QStash signature)
 */

import express from "express";
import { z } from "zod";
import { Receiver } from "@upstash/qstash";
import { processReelVariationJob } from "./processor";
import type { ReelVariationJobPayload } from "./types";

const app = express();
app.use(express.text({ type: "*/*", limit: "10mb" }));

const PORT = Number(process.env.PORT ?? 8080);

// ─── Health check ─────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "reel-worker", ts: new Date().toISOString() });
});

// ─── Schema de validación ─────────────────────────────────────────────────────

const jobPayloadSchema = z.object({
  jobId: z.string().uuid(),
  organizationId: z.string().uuid(),
  sourcePieceId: z.string().uuid(),
  sourceStoragePath: z.string().min(1),
  sourceFileName: z.string().min(1),
  originalCaption: z.string().nullable().optional(),
});

// ─── QStash receiver ──────────────────────────────────────────────────────────

function buildReceiver(): Receiver | null {
  const currentKey = process.env.QSTASH_CURRENT_SIGNING_KEY?.trim();
  const nextKey = process.env.QSTASH_NEXT_SIGNING_KEY?.trim();
  if (!currentKey || !nextKey) return null;
  return new Receiver({ currentSigningKey: currentKey, nextSigningKey: nextKey });
}

const receiver = buildReceiver();

async function verifySignature(req: express.Request, rawBody: string): Promise<boolean> {
  if (!receiver) {
    // Sin signing keys: en dev se acepta si viene de la red interna
    const isLocalOrInternal =
      req.ip === "127.0.0.1" ||
      req.ip?.startsWith("10.") ||
      req.ip?.startsWith("172.") ||
      !process.env.NODE_ENV?.includes("prod");
    return isLocalOrInternal;
  }

  const signature =
    req.headers["upstash-signature"] ??
    req.headers["Upstash-Signature"];

  if (!signature || typeof signature !== "string") return false;

  try {
    return await receiver.verify({ signature, body: rawBody });
  } catch {
    return false;
  }
}

// ─── Endpoint principal ───────────────────────────────────────────────────────

app.post("/", async (req, res) => {
  const rawBody = req.body as string;

  // 1. Verificar firma QStash
  const signatureValid = await verifySignature(req, rawBody);
  if (!signatureValid) {
    console.warn("[Worker] invalid QStash signature from", req.ip);
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // 2. Parsear y validar payload
  let payload: ReelVariationJobPayload;
  try {
    const parsed = jobPayloadSchema.safeParse(JSON.parse(rawBody));
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" });
      return;
    }
    payload = parsed.data as ReelVariationJobPayload;
  } catch {
    res.status(400).json({ error: "Invalid JSON body" });
    return;
  }

  console.log("[Worker] received job", { jobId: payload.jobId });

  // 3. Responder 200 inmediatamente (QStash requiere respuesta antes de 30s)
  res.json({ ok: true, jobId: payload.jobId, status: "accepted" });

  // 4. Procesar en background (async sin bloquear)
  setImmediate(() => {
    processReelVariationJob(payload).catch((err: unknown) => {
      console.error("[Worker] unhandled error in processReelVariationJob", {
        jobId: payload.jobId,
        error: err instanceof Error ? err.message : String(err),
      });
    });
  });
});

// ─── Inicio ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[Worker] reel-worker listening on port ${PORT}`);
  console.log(`[Worker] env: ${process.env.NODE_ENV ?? "development"}`);
  console.log(`[Worker] QStash signing: ${receiver ? "enabled" : "disabled (dev mode)"}`);
  console.log(`[Worker] Supabase URL: ${process.env.SUPABASE_URL ? "configured" : "MISSING"}`);
  console.log(`[Worker] Anthropic API: ${process.env.ANTHROPIC_API_KEY ? "configured" : "MISSING"}`);
});

export default app;
