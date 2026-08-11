import { Client } from "@upstash/qstash";

export type RagIngestionJobPayload = {
  documentId: string;
  organizationId: string;
  sourceType: "business_context_note" | "business_context_document";
};

export function isQStashConfigured(): boolean {
  return Boolean(process.env.QSTASH_TOKEN?.trim());
}

let qstashClient: Client | null = null;

export function getQStashClient(): Client | null {
  const token = process.env.QSTASH_TOKEN?.trim();
  if (!token) return null;

  if (!qstashClient) {
    qstashClient = new Client({ token });
  }

  return qstashClient;
}

export function getPublicAppUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return `https://${vercelUrl.replace(/\/$/, "")}`;

  throw new Error(
    "NEXT_PUBLIC_APP_URL no configurada — necesaria para publicar jobs en QStash"
  );
}

export function getRagIngestionWorkerUrl(): string {
  return `${getPublicAppUrl()}/api/queue/process-rag-ingestion`;
}

export function getReelVariationPublishUrl(): string {
  return `${getPublicAppUrl()}/api/queue/publish-reel-variation`;
}

export async function publishRagIngestionJob(
  payload: RagIngestionJobPayload
): Promise<boolean> {
  try {
    const client = getQStashClient();
    if (!client) return false;

    const response = await client.publishJSON({
      url: getRagIngestionWorkerUrl(),
      body: payload,
      retries: 3,
    });

    console.log("[Queue] rag-ingestion published to QStash", {
      documentId: payload.documentId,
      organizationId: payload.organizationId,
      sourceType: payload.sourceType,
      messageId: response.messageId,
    });
    return true;
  } catch (err) {
    console.error("[Queue] QStash publish failed — inline fallback", err);
    return false;
  }
}
