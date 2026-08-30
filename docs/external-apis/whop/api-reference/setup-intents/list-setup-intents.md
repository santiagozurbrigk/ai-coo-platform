---
title: "List setup intents"
source: "https://docs.whop.com/api-reference/setup-intents/list-setup-intents"
capturado: "2026-08-30"
metodo: "GET"
path: "/setup_intents"
---

# List setup intents

> Returns a paginated list of setup intents for a company, with optional filtering by creation date. A setup intent securely collects and stores a member's payment method for future use without charging them immediately.

Required permissions:
 - `payment:setup_intent:read`
 - `member:basic:read`
 - `member:email:read`



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /setup_intents`** — ver [ENDPOINTS-api-v1-stable.md](../../ENDPOINTS-api-v1-stable.md#get-setup-intents) · spec: [`openapi/api-v1-stable.json`](../../openapi/api-v1-stable.json)