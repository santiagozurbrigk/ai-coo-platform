import { getAppBaseUrl, getUnipileConfig } from "./config";
import { unipileFetch } from "./client";

type WebhookListResponse = {
  items?: Array<{ id?: string; request_url?: string }>;
};

let ensureWebhookPromise: Promise<void> | null = null;

export async function ensureUnipileMessagingWebhook(): Promise<void> {
  if (ensureWebhookPromise) return ensureWebhookPromise;

  ensureWebhookPromise = (async () => {
    const { webhookSecret } = getUnipileConfig();
    const baseUrl = getAppBaseUrl();
    const requestUrl = `${baseUrl}/api/webhooks/unipile`;

    const list = await unipileFetch<WebhookListResponse>("/api/v1/webhooks");
    const exists = (list.items ?? []).some(
      (item) => item.request_url === requestUrl
    );
    if (exists) return;

    await unipileFetch("/api/v1/webhooks", {
      method: "POST",
      body: JSON.stringify({
        request_url: requestUrl,
        source: "messaging",
        headers: [
          { key: "Content-Type", value: "application/json" },
          ...(webhookSecret
            ? [{ key: "Unipile-Auth", value: webhookSecret }]
            : []),
        ],
      }),
    });
  })().catch((err) => {
    ensureWebhookPromise = null;
    console.error("[Unipile] No se pudo registrar webhook:", err);
  });

  return ensureWebhookPromise;
}
