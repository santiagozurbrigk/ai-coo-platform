---
title: "Retrieve setup status"
source: "https://docs.whop.com/api-reference/beta/setup-intents/retrieve-setup-status"
capturado: "2026-08-30"
metodo: "GET"
path: "/setup_intents/{setup_intent_id}/status"
---

# Retrieve setup status

> Retrieves how far a setup has got and what the buyer must do next, if anything. Collection runs in the background, so poll this rather than reading the create response. Accepts either a secret key or the setup's own `client_secret`, so the surface collecting the payment method can poll it directly.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /setup_intents/{setup_intent_id}/status`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#get-setup-intents-setup-intent-id-status) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)