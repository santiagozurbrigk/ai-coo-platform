---
title: "Replay Delivery"
source: "https://docs.whop.com/api-reference/beta/webhooks/replay-delivery"
capturado: "2026-08-30"
metodo: "POST"
path: "/webhooks/{id}/deliveries/{delivery_id}/replay"
---

# Replay Delivery

> Re-sends the exact payload of a past delivery to the webhook's current URL and returns the delivery result. By default the replay keeps the original `webhook-id`, so consumers that deduplicate on it can drop events they already processed. Pass `regenerate_id` to re-send under a freshly generated `webhook-id` instead, so a deduplicating consumer processes the replay as a new message. Only available for enabled webhooks on API version v1; deliveries are retained for 30 days.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /webhooks/{id}/deliveries/{delivery_id}/replay`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-webhooks-id-deliveries-delivery-id-replay) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)