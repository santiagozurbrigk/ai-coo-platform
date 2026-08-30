---
title: "Retrieve payment status"
source: "https://docs.whop.com/api-reference/beta/payments/retrieve-payment-status"
capturado: "2026-08-30"
metodo: "GET"
path: "/payments/{payment_id}/status"
---

# Retrieve payment status

> Retrieves how far a payment has got and what the buyer must do next, if anything. A payment is collected in the background, so poll this rather than reading the create response. Accepts either a secret key or the payment's own `client_secret`, so the surface collecting the payment can poll it directly.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /payments/{payment_id}/status`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#get-payments-payment-id-status) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)