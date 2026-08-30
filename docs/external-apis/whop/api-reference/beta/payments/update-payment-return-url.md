---
title: "Update payment return URL"
source: "https://docs.whop.com/api-reference/beta/payments/update-payment-return-url"
capturado: "2026-08-30"
metodo: "PATCH"
path: "/payments/{payment_id}/return_url"
---

# Update payment return URL

> Changes where the buyer lands after completing an off-site step, up until they return. Accepts either a secret key or the payment's own `client_secret`, so the surface that knows the final destination can set it.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`PATCH /payments/{payment_id}/return_url`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#patch-payments-payment-id-return-url) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)