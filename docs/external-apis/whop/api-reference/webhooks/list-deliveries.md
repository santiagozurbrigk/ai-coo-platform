---
title: "List deliveries"
source: "https://docs.whop.com/api-reference/webhooks/list-deliveries"
capturado: "2026-08-30"
metodo: "GET"
path: "/webhooks/{webhook_id}/deliveries"
---

# List deliveries

> Returns a paginated list of delivery attempts for a webhook, ordered by most recent first. Includes the request payload, response body, response code, and timing for each attempt.

Required permissions:
 - `developer:manage_webhook`



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /webhooks/{webhook_id}/deliveries`** — ver [ENDPOINTS-api-v1-stable.md](../../ENDPOINTS-api-v1-stable.md#get-webhooks-webhook-id-deliveries) · spec: [`openapi/api-v1-stable.json`](../../openapi/api-v1-stable.json)