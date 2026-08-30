---
title: "Update setup return URL"
source: "https://docs.whop.com/api-reference/beta/setup-intents/update-setup-return-url"
capturado: "2026-08-30"
metodo: "PATCH"
path: "/setup_intents/{setup_intent_id}/return_url"
---

# Update setup return URL

> Changes where the buyer lands after completing an off-site step, up until they return. Accepts either a secret key or the setup's own `client_secret`, so the surface that knows the final destination can set it.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`PATCH /setup_intents/{setup_intent_id}/return_url`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#patch-setup-intents-setup-intent-id-return-url) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)